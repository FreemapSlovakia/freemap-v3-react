import { useMessages } from '@features/l10n/l10nInjector.js';
import type { CachedTileMapDef } from '@shared/cachedTileMaps.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  type IntegratedLayerDef,
  type IsTileLayerDef,
  type IsWmsLayerDef,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  countTilesInBbox,
  countTilesInPolygon,
} from '@shared/tileEnumeration.js';
import { polygon } from '@turf/helpers';
import {
  type ReactElement,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaDrawPolygon, FaEye, FaSave, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { cachedMapsSetView, cacheTilesStart } from '../model/actions.js';

type CacheableLayerDef = IntegratedLayerDef<IsTileLayerDef | IsWmsLayerDef> & {
  url: string;
};

const AVG_TILE_SIZE = 20_000;

export function CacheTilesForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const mapDefs = useMemo(() => {
    const integrated = integratedLayerDefs
      .filter(
        (def): def is CacheableLayerDef =>
          def.technology === 'tile' || def.technology === 'wms',
      )
      .map((layer) => ({
        ...layer,
        url: layer.url.startsWith('//') ? 'https:' + layer.url : layer.url,
      }));

    const custom = customLayers
      .filter((def) => def.technology === 'tile' || def.technology === 'wms')
      .map((def) => ({
        ...def,
        icon: undefined as ReactElement | undefined,
        countries: undefined as string[] | undefined,
        superseededBy: undefined as string | undefined,
        experimental: undefined as boolean | undefined,
      }));

    return [...integrated, ...custom];
  }, [customLayers]);

  const layers = useAppSelector((state) => state.map.layers);

  const [mapType, setMapType] = useState(
    mapDefs.find((def) => layers.includes(def.type))?.type ??
      mapDefs[0]?.type ??
      '',
  );

  const mapDef = useMemo(
    () => mapDefs.find((def) => def.type === mapType),
    [mapType, mapDefs],
  );

  const [name, setName] = useState('');

  const [nameChanged, setNameChanged] = useState(false);

  const [minZoom, setMinZoom] = useState('0');

  const [maxZoom, setMaxZoom] = useState('0');

  const selectedLine = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly' &&
    state.main.selection.id !== undefined
      ? state.drawingLines.lines[state.main.selection.id]
      : null,
  );

  const [area, setArea] = useState<'visible' | 'selected'>(
    selectedLine?.type === 'polygon' ? 'selected' : 'visible',
  );

  const bounds = useAppSelector((state) => state.map.bounds);

  useEffect(() => {
    if (!mapDef) {
      return;
    }

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(String(mapDef.maxNativeZoom ?? 18));
  }, [mapDef]);

  useEffect(() => {
    setName((prev) =>
      prev && nameChanged ? prev : (m?.mapLayers.letters[mapType] ?? mapType),
    );
  }, [m, mapType, nameChanged]);

  const tileCount = useMemo(() => {
    const minZ = Number(minZoom);
    const maxZ = Number(maxZoom);

    if (selectedLine?.type === 'polygon' && area === 'selected') {
      const poly = polygon([
        [
          ...selectedLine.points.map((pt) => [pt.lon, pt.lat]),
          [selectedLine.points[0].lon, selectedLine.points[0].lat],
        ],
      ]);

      return countTilesInPolygon(poly, minZ, maxZ);
    }

    if (area === 'visible' && bounds) {
      return countTilesInBbox(bounds, minZ, maxZ);
    }

    return undefined;
  }, [
    selectedLine?.type,
    selectedLine?.points,
    area,
    bounds,
    minZoom,
    maxZoom,
  ]);

  const cnf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const invalidMinZoom = isInvalidInt(
    minZoom,
    true,
    mapDef?.minZoom ?? 0,
    Math.min(
      mapDef?.maxNativeZoom ?? Infinity,
      parseInt(maxZoom, 10) || Infinity,
    ),
  );

  const invalidMaxZoom = isInvalidInt(
    maxZoom,
    true,
    Math.max(parseInt(minZoom, 10) || 0, mapDef?.minZoom ?? 0),
    mapDef?.maxNativeZoom,
  );

  const estimatedSize =
    tileCount !== undefined && tileCount !== Infinity
      ? tileCount * AVG_TILE_SIZE
      : undefined;

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!mapDef) {
        return;
      }

      const cacheType = 'cached-' + Math.random().toString(36).slice(2);

      // strip integrated-only / non-serializable fields (icon, shortcut, etc.)
      const {
        icon: _icon,
        shortcut: _shortcut,
        defaultInToolbar: _dt,
        defaultInMenu: _dm,
        countries: _countries,
        superseededBy: _s,
        experimental: _e,
        adminOnly: _a,
        premiumFromZoom: _p,
        ...rest
      } = mapDef as Record<string, unknown> & typeof mapDef;

      const meta = {
        ...rest,
        type: cacheType,
        name,
        sourceType: mapDef.type,
        minZoom: parseInt(minZoom, 10),
        maxNativeZoom: parseInt(maxZoom, 10),
        bounds: bounds as [number, number, number, number],
        tileCount: tileCount ?? 0,
        downloadedCount: 0,
        cacheName: `tiles-${cacheType}`,
        createdAt: new Date().toISOString(),
        sizeBytes: 0,
      } as CachedTileMapDef;

      dispatch(
        cacheTilesStart({
          meta,
          boundary:
            selectedLine?.type === 'polygon' && area === 'selected'
              ? {
                  type: 'polygon' as const,
                  points: selectedLine.points,
                }
              : {
                  type: 'bbox' as const,
                  bounds: bounds as [number, number, number, number],
                },
        }),
      );
    },
    [
      dispatch,
      name,
      mapDef,
      minZoom,
      maxZoom,
      bounds,
      tileCount,
      selectedLine,
      area,
    ],
  );

  function getItem(def: (typeof mapDefs)[number]) {
    return <MapLayerItem def={def} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> Cache Map for Offline Use
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="mapType">
          <Form.Label>{m?.downloadMap.map ?? 'Map'}</Form.Label>

          <Dropdown className="mb-3" onSelect={(value) => setMapType(value!)}>
            <Dropdown.Toggle className="text-start w-100">
              {mapDef ? getItem(mapDef) : '???'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {mapDefs.map((def) => (
                <Dropdown.Item key={def.type} eventKey={def.type}>
                  {getItem(def)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <Form.Group controlId="downloadArea">
          <Form.Label>{m?.downloadMap.downloadArea ?? 'Area'}</Form.Label>

          <ButtonGroup className="d-flex mb-3">
            <Button
              className="fm-ellipsis"
              variant="secondary"
              active={area === 'visible'}
              onClick={() => setArea('visible')}
            >
              <FaEye /> {m?.downloadMap.area.visible ?? 'Visible'}
            </Button>

            <Button
              className="fm-ellipsis"
              variant="secondary"
              active={area === 'selected'}
              onClick={() => setArea('selected')}
              disabled={selectedLine?.type !== 'polygon'}
            >
              <FaDrawPolygon /> {m?.downloadMap.area.byPolygon ?? 'By polygon'}
            </Button>
          </ButtonGroup>
        </Form.Group>

        <Form.Group controlId="name" className="mb-3">
          <Form.Label>{m?.downloadMap.name ?? 'Name'}</Form.Label>

          <Form.Control
            type="text"
            value={name}
            onChange={(e) => {
              setNameChanged(true);
              setName(e.currentTarget.value);
            }}
          />
        </Form.Group>

        {mapDef && (
          <Form.Group controlId="zoomRange" className="mb-3">
            <Form.Label className="required">
              {m?.downloadMap.zoomRange ?? 'Zoom range'}
            </Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                min={mapDef.minZoom ?? 0}
                max={mapDef.maxNativeZoom ?? 18}
                value={minZoom}
                isInvalid={invalidMinZoom}
                onChange={(e) => setMinZoom(e.currentTarget.value)}
              />

              <InputGroup.Text>&ndash;</InputGroup.Text>

              <Form.Control
                type="number"
                min={mapDef.minZoom ?? 0}
                max={mapDef.maxNativeZoom ?? 18}
                value={maxZoom}
                isInvalid={invalidMaxZoom}
                onChange={(e) => setMaxZoom(e.currentTarget.value)}
              />
            </InputGroup>
          </Form.Group>
        )}

        {tileCount !== undefined &&
          tileCount !== Infinity &&
          !invalidMinZoom &&
          !invalidMaxZoom &&
          tileCount > 50_000 && (
            <Alert variant="warning">
              Large download: {cnf.format(tileCount)} tiles (~
              {estimatedSize !== undefined ? formatSize(estimatedSize) : '?'}
              ). This may take a while.
            </Alert>
          )}
      </Modal.Body>

      <Modal.Footer className="flex-wrap">
        {tileCount !== undefined && (
          <div className="w-100 text-end">
            Tiles: <b>{cnf.format(tileCount)}</b>
            {estimatedSize !== undefined && (
              <>
                {' '}
                | Est. size: <b>{formatSize(estimatedSize)}</b>
              </>
            )}
          </div>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={
            invalidMinZoom ||
            invalidMaxZoom ||
            !tileCount ||
            tileCount === Infinity ||
            !name.trim()
          }
        >
          <FaSave /> Start caching <kbd>Enter</kbd>
        </Button>

        <Button
          variant="dark"
          type="button"
          onClick={() => dispatch(cachedMapsSetView('list'))}
        >
          <FaTimes /> Back
        </Button>
      </Modal.Footer>
    </form>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
