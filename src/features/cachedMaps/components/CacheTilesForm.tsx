import { saveSettings } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import { LayerVisibilityFields } from '@features/mapSettings/components/LayerVisibilityFields.js';
import { useOfflineMapExportMessages } from '@features/offlineMapExport/translations/useOfflineMapExportMessages.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFreeStorage } from '@shared/hooks/useFreeStorage.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useTilesSizeEstimate } from '@shared/hooks/useTilesSizeEstimate.js';
import {
  type IntegratedLayerDef,
  type IsTileLayerDef,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { countTilesInBbox } from '@shared/tileEnumeration.js';
import { pickTileScale } from '@shared/tileUrl.js';
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
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaChevronLeft, FaSave } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { CachedTileMapDef } from '../cachedTileMaps.js';
import { cachedMapsSetView, cacheTilesStart } from '../model/actions.js';
import { useCachedMapsMessages } from '../translations/useCachedMapsMessages.js';

type CacheableLayerDef = IntegratedLayerDef<IsTileLayerDef> & {
  url: string;
};

// pre-filled upper bound; the layer's own `maxNativeZoom` still caps it
const DEFAULT_MAX_ZOOM = 16;

// warn once the download would claim this share of the free storage
const QUOTA_HEADROOM = 0.9;

// Rough cost model behind the "this may take a while" warning: every tile costs
// one request (latency, spread over the batches the download runs in) and its
// bytes cost bandwidth. Neither term alone catches both a million tiny tiles and
// a handful of hi-DPI ones.
const REQUEST_SECONDS = 0.15;

const CONCURRENT_REQUESTS = 6; // BATCH_SIZE in cacheTilesProcessor

const BYTES_PER_SECOND = 1_250_000; // ~10 Mbps

const LARGE_DOWNLOAD_SECONDS = 5 * 60;

export function CacheTilesForm(): ReactElement {
  const m = useMessages();

  const ome = useOfflineMapExportMessages();

  const cm = useCachedMapsMessages();

  const dispatch = useDispatch();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const mapDefs = useMemo(() => {
    const integrated = integratedLayerDefs
      .filter((def): def is CacheableLayerDef => def.technology === 'tile')
      .map((layer) => {
        const url = layer.url.startsWith('//')
          ? `https:${layer.url}`
          : layer.url;

        return { ...layer, url };
      });

    // WMS is not offered: `buildTileUrl` substitutes only {x}/{y}/{z}, so every
    // WMS tile would collapse to one cache entry, while the rendered layer asks
    // for per-tile `?…&BBOX=…` URLs that are not in the cache. See TODO.md.
    const custom = customLayers
      .filter((def) => def.technology === 'tile')
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

  const { area, setArea, bbox, startSelecting } = useMapAreaSelection();

  const [showInMenu, setShowInMenu] = useState(true);

  const [showInToolbar, setShowInToolbar] = useState(false);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  useEffect(() => {
    if (!mapDef) {
      return;
    }

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(
      String(
        Math.max(
          mapDef.minZoom ?? 0,
          Math.min(mapDef.maxNativeZoom ?? Infinity, DEFAULT_MAX_ZOOM),
        ),
      ),
    );
  }, [mapDef]);

  useEffect(() => {
    setName((prev) => {
      if (prev && nameChanged) {
        return prev;
      }

      const layerName = m?.mapLayers.letters[mapType] ?? mapType;

      return cm?.namePrefix ? `${cm.namePrefix} ${layerName}` : layerName;
    });
  }, [m, cm, mapType, nameChanged]);

  const tileCount = useMemo(() => {
    if (!bbox) {
      return undefined;
    }

    return countTilesInBbox(bbox, Number(minZoom), Number(maxZoom));
  }, [bbox, minZoom, maxZoom]);

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

  // the caching download picks the hi-DPI variant for this screen, so the
  // estimate must sample that same variant
  const scale = pickTileScale(mapDef?.extraScales);

  const { bytes: estimatedSize, sampling } = useTilesSizeEstimate({
    urlTemplate: mapDef?.url,
    bbox,
    minZoom: Number(minZoom),
    maxZoom: Number(maxZoom),
    tileCount,
    scale,
    enabled: !invalidMinZoom && !invalidMaxZoom,
  });

  const freeSpace = useFreeStorage();

  const overQuota =
    estimatedSize !== undefined &&
    freeSpace !== undefined &&
    estimatedSize > freeSpace * QUOTA_HEADROOM;

  const largeDownload =
    estimatedSize !== undefined &&
    tileCount !== undefined &&
    (tileCount * REQUEST_SECONDS) / CONCURRENT_REQUESTS +
      estimatedSize / BYTES_PER_SECOND >
      LARGE_DOWNLOAD_SECONDS;

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!mapDef || !bbox) {
        return;
      }

      const type = Math.random().toString(36).slice(2);

      // strip integrated-only / non-serializable fields (icon, shortcut, etc.);
      // `bbox` is the source layer's declared coverage — a cached map's real
      // extent is its `bounds`, set below
      const {
        icon: _icon,
        shortcut: _shortcut,
        defaultInToolbar: _dt,
        defaultInMenu: _dm,
        countries: _countries,
        superseededBy: _s,
        experimental: _e,
        layerPreview: _lp,
        premiumFromZoom: _p,
        bbox: _bbox,
        ...rest
      } = mapDef as Record<string, unknown> & typeof mapDef;

      const meta = {
        ...rest,
        type,
        name,
        sourceType: mapDef.type,
        minZoom: parseInt(minZoom, 10),
        maxNativeZoom: parseInt(maxZoom, 10),
        bounds: bbox,
        tileCount: tileCount ?? 0,
        downloadedCount: 0,
        cacheName: `tiles-${type}`,
        createdAt: new Date().toISOString(),
        sizeBytes: 0,
      } as CachedTileMapDef;

      dispatch(cacheTilesStart(meta));

      dispatch(
        saveSettings({
          settings: {
            layersSettings: {
              ...layersSettings,
              [type]: {
                ...(layersSettings[type] ?? {}),
                showInMenu,
                showInToolbar,
              },
            },
          },
          keepOpen: true,
        }),
      );
    },
    [
      dispatch,
      name,
      mapDef,
      minZoom,
      maxZoom,
      bbox,
      tileCount,
      layersSettings,
      showInMenu,
      showInToolbar,
    ],
  );

  function getItem(def: (typeof mapDefs)[number]) {
    return <MapLayerItem def={def} />;
  }

  return (
    <form onSubmit={handleSubmit} className="d-contents">
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> {cm?.cacheOfflineMap}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="mapType">
          <Form.Label>{ome?.map}</Form.Label>

          <Dropdown className="mb-3" onSelect={(value) => setMapType(value!)}>
            <Dropdown.Toggle as={SelectToggle} className="w-100">
              {mapDef ? getItem(mapDef) : '???'}
            </Dropdown.Toggle>

            <FmDropdownMenu popperConfig={sameMinWidthPopperConfig}>
              {mapDefs.map((def) => (
                <Dropdown.Item
                  as="button"
                  type="button"
                  key={def.type}
                  eventKey={def.type}
                >
                  {getItem(def)}
                </Dropdown.Item>
              ))}
            </FmDropdownMenu>
          </Dropdown>
        </Form.Group>

        <Form.Group controlId="downloadArea">
          <Form.Label>{ome?.downloadArea}</Form.Label>

          <MapAreaToggle
            className="mb-3"
            area={area}
            onSelectVisible={() => setArea('visible')}
            onSelectArea={startSelecting}
          />
        </Form.Group>

        <Form.Group controlId="name" className="mb-3">
          <Form.Label>{m?.general.name}</Form.Label>

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
            <Form.Label className="required">{ome?.zoomRange}</Form.Label>

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

        <Form.Group>
          <LayerVisibilityFields
            showInMenu={showInMenu}
            showInToolbar={showInToolbar}
            onChange={(v) => {
              setShowInMenu(v.showInMenu);
              setShowInToolbar(v.showInToolbar);
            }}
          />
        </Form.Group>

        {tileCount !== undefined &&
          tileCount !== Infinity &&
          !invalidMinZoom &&
          !invalidMaxZoom && (
            <>
              {/* the quota alert says the same thing more urgently */}
              {largeDownload && !overQuota && (
                <Alert variant="warning" className="mt-3 mb-0">
                  {cm?.largeDownload({
                    tiles: cnf.format(tileCount),
                    size: sampling ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      formatSize(estimatedSize!)
                    ),
                  })}
                </Alert>
              )}

              {/* only once measured — the fallback is too crude to alarm with */}
              {overQuota && !sampling && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {cm?.notEnoughSpace({
                    size: formatSize(estimatedSize!),
                    free: formatSize(freeSpace!),
                  })}
                </Alert>
              )}
            </>
          )}
      </Modal.Body>

      <Modal.Footer className="flex-wrap">
        {tileCount !== undefined && (
          <div className="w-100 text-end">
            {cm?.tiles}: <b>{cnf.format(tileCount)}</b>
            {estimatedSize !== undefined && (
              <>
                {' '}
                | {cm?.estSize}:{' '}
                {sampling ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <b>{formatSize(estimatedSize)}</b>
                )}
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
          <FaSave /> {cm?.startCaching} <kbd>Enter</kbd>
        </Button>

        <Button
          variant="dark"
          onClick={() => dispatch(cachedMapsSetView('list'))}
        >
          <FaChevronLeft /> {m?.general.back}
        </Button>
      </Modal.Footer>
    </form>
  );
}
