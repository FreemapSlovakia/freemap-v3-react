import { pointToTile, tileToGeoJSON } from '@mapbox/tilebelt';
import bbox from '@turf/bbox';
import { bboxPolygon } from '@turf/bbox-polygon';
import { booleanIntersects } from '@turf/boolean-intersects';
import { polygon } from '@turf/helpers';
import { BBox } from 'geojson';
import {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import {
  FaDownload,
  FaDrawPolygon,
  FaEye,
  FaHistory,
  FaTimes,
} from 'react-icons/fa';
import { TbLayersSelected, TbLayersSelectedBottom } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { authInit } from '../actions/authActions.js';
import { downloadMap, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import {
  IntegratedLayerDef,
  integratedLayerDefs,
  IsTileLayerDef,
} from '../mapDefinitions.js';
import { isInvalidInt } from '../numberValidator.js';
import { CreditsAlert } from './CredistAlert.js';
import { countryCodeToFlag, Emoji } from './Emoji.js';
import { ExperimentalFunction } from './ExperimentalFunction.js';
import { LongPressTooltip } from './LongPressTooltip.js';

type Props = { show: boolean };

export default DownloadMapModal;

export function DownloadMapModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState('');

  const [nameChanged, setNameChanged] = useState(false);

  const [email, setEmail] = useState(user?.email ?? '');

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

  const mapDefs = useMemo(
    () =>
      integratedLayerDefs
        .filter(
          (
            def,
          ): def is IntegratedLayerDef<
            IsTileLayerDef & {
              creditsPerMTile: number;
            }
          > => def.technology === 'tile' && def.creditsPerMTile !== undefined,
        )
        .map((layer) => ({
          ...layer,
          overlay: layer.layer === 'overlay', // TODO make server understand `layer` property
          url: layer.url.startsWith('//') ? 'http:' + layer.url : layer.url,
        })),
    [],
  );

  // for server: src/downloadableMaps.ts
  // console.log(
  //   JSON.stringify(
  //     mapDefs.map((mapDef) => ({
  //       type: mapDef.type,
  //       url: mapDef.url,
  //       extraScales: mapDef.extraScales,
  //       minZoom: mapDef.minZoom,
  //       maxNativeZoom: mapDef.maxNativeZoom,
  //       creditsPerMTile: mapDef.creditsPerMTile,
  //       layer: mapDef.layer,
  //       attribution: mapDef.attribution
  //         .map(
  //           (a) =>
  //             a.type +
  //             ': ' +
  //             (a.nameKey ? (m?.mapLayers.attr[a.nameKey] ?? '') : a.name),
  //         )
  //         .join(', '),
  //     })),
  //   ),
  // );

  const layers = useAppSelector((state) => state.map.layers);

  const [mapType, setMapType] = useState(
    mapDefs.find(
      (mapDef) => mapDef.creditsPerMTile && layers.includes(mapDef.type),
    )?.type ?? 'X',
  );

  const [format, setFormat] = useState('mbtiles');

  const [scale, setScale] = useState('1');

  const mapDef = useMemo(
    () => mapDefs.find((def) => def.type === mapType),
    [mapType, mapDefs],
  );

  useEffect(() => {
    if (!mapDef) {
      return;
    }

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(String(mapDef.maxNativeZoom));
  }, [mapDef]);

  const bounds = useAppSelector((state) => state.map.bounds);

  const tileCount = useMemo(() => {
    if (selectedLine?.type === 'polygon' && area === 'selected') {
      const poly = polygon([
        [
          ...selectedLine.points.map((pt) => [pt.lon, pt.lat]),
          [selectedLine.points[0].lon, selectedLine.points[0].lat],
        ],
      ]);

      const bboxExtent = bbox(poly);

      let count = 0;

      for (let z = Number(minZoom); z <= Number(maxZoom); z++) {
        const minTile = pointToTile(bboxExtent[0], bboxExtent[3], z);
        const maxTile = pointToTile(bboxExtent[2], bboxExtent[1], z);

        for (let x = minTile[0]; x <= maxTile[0]; x++) {
          for (let y = minTile[1]; y <= maxTile[1]; y++) {
            if (booleanIntersects(poly, tileToGeoJSON([x, y, z]))) {
              count++;
            }
          }
        }
      }

      return count;
    }

    if (area === 'visible' && bounds) {
      let count = 0;

      for (let zoom = Number(minZoom); zoom <= Number(maxZoom); zoom++) {
        const from = pointToTile(bounds[0], bounds[1], zoom);
        const to = pointToTile(bounds[2], bounds[3], zoom);

        count += (to[0] - from[0] + 1) * (from[1] - to[1] + 1);
      }

      return count > 1_000_000_000 ? Infinity : count;
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

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      dispatch(
        downloadMap({
          email,
          name,
          map: mapType,
          format,
          maxZoom: parseInt(maxZoom, 10),
          minZoom: parseInt(minZoom, 10),
          scale: parseInt(scale, 10),
          boundary:
            selectedLine?.type === 'polygon' && area === 'selected'
              ? polygon([
                  [
                    ...selectedLine.points.map((pt) => [pt.lon, pt.lat]),
                    [selectedLine.points[0].lon, selectedLine.points[0].lat],
                  ],
                ])
              : bboxPolygon(bounds as BBox),
        }),
      );
    },
    [
      dispatch,
      email,
      name,
      mapType,
      format,
      maxZoom,
      minZoom,
      scale,
      selectedLine?.type,
      selectedLine?.points,
      area,
      bounds,
    ],
  );

  // refresh user (credits)
  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const price = (() => {
    const price =
      mapDef && tileCount
        ? Math.ceil((tileCount * mapDef.creditsPerMTile) / 1_000_000)
        : 0;

    return price < 1_000_000_000 ? price : Infinity;
  })();

  const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    setName((name) =>
      name && nameChanged ? name : (m?.mapLayers.letters[mapType] ?? ''),
    );
  }, [m, mapType, nameChanged]);

  function getItem(def: IntegratedLayerDef) {
    return (
      <>
        {def.layer === 'base' ? (
          <TbLayersSelected className="opacity-50" />
        ) : (
          <TbLayersSelectedBottom className="opacity-50" />
        )}

        <span className="px-2">{def.icon}</span>

        {m?.mapLayers.letters[def.type]}

        {def.type !== 'X' &&
          def.countries?.map((country) => (
            <Emoji className="ms-1" key={country}>
              {countryCodeToFlag(country)}
            </Emoji>
          ))}

        {def.superseededBy && (
          <FaHistory className="text-warning ms-1" title={m?.maps.legacy} />
        )}

        {def.experimental && (
          <ExperimentalFunction data-interactive="1" className="ms-1" />
        )}
      </>
    );
  }

  return (
    <Modal show={show} onHide={close}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaDownload /> <ExperimentalFunction /> {m?.downloadMap.downloadMap}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            <p>
              <strong>Where you can use downloaded MBTiles maps:</strong>
            </p>
            <ul>
              <li>
                <strong>Desktop:</strong>{' '}
                <a href="https://qgis.org/" target="_blank">
                  QGIS
                </a>{' '}
                (Windows/macOS/Linux),{' '}
                <a href="https://www.maptiler.com/desktop/" target="_blank">
                  MapTiler Desktop
                </a>
              </li>

              <li>
                <strong>Android:</strong>{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=menion.android.locus"
                  target="_blank"
                >
                  Locus Map
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=menion.android.locus.pro"
                  target="_blank"
                >
                  OruxMaps
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.bodunov.galileo"
                  target="_blank"
                >
                  Guru Maps
                </a>
                ,{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=net.osmand"
                  target="_blank"
                >
                  OsmAnd
                </a>
              </li>

              <li>
                <strong>iOS:</strong>{' '}
                <a
                  href="https://apps.apple.com/app/guru-maps-offline-maps-gps/id1032458712"
                  target="_blank"
                >
                  Guru Maps
                </a>
                ,{' '}
                <a
                  href="https://apps.apple.com/app/map-plus/id123456789"
                  target="_blank"
                >
                  Map Plus
                </a>
                ,{' '}
                <a
                  href="https://apps.apple.com/us/app/osmand-maps-travel-navigate/id934850257"
                  target="_blank"
                >
                  OsmAnd
                </a>
              </li>

              <li>
                <strong>Web:</strong> Leaflet, MapLibre GL JS or OpenLayers (via
                a tile server such as{' '}
                <a
                  href="https://github.com/consbio/mbtileserver"
                  target="_blank"
                >
                  mbtileserver
                </a>{' '}
                or{' '}
                <a
                  href="https://github.com/maptiler/tileserver-gl"
                  target="_blank"
                >
                  TileServer GL
                </a>
                )
              </li>
            </ul>
          </div>

          <CreditsAlert buy price={price} />

          <hr />

          <Form.Group controlId="mapType">
            <Form.Label>{m?.downloadMap.map}</Form.Label>

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
            <Form.Label>{m?.downloadMap.downloadArea}</Form.Label>

            <ButtonGroup className="d-flex mb-3">
              <Button
                className="fm-ellipsis"
                variant="secondary"
                active={area === 'visible'}
                onClick={() => setArea('visible')}
              >
                <FaEye /> {m?.downloadMap.area.visible}
              </Button>

              <Button
                className="fm-ellipsis"
                variant="secondary"
                active={area === 'selected'}
                onClick={() => setArea('selected')}
                disabled={selectedLine?.type !== 'polygon'}
              >
                <FaDrawPolygon /> {m?.downloadMap.area.byPolygon}
              </Button>
            </ButtonGroup>
          </Form.Group>

          <Form.Group controlId="name" className="mb-3">
            <Form.Label>{m?.downloadMap.name}</Form.Label>

            <Form.Control
              type="text"
              value={name}
              onChange={(e) => {
                setNameChanged(true);
                setName(e.currentTarget.value);
              }}
            />
          </Form.Group>

          <Form.Group controlId="format" className="mb-3">
            <Form.Label>{m?.downloadMap.format}</Form.Label>

            <ButtonGroup className="d-block">
              <LongPressTooltip label="Locus Map, Guru Maps, OruxMaps">
                {({ props }) => (
                  <Button
                    variant="secondary"
                    active={format === 'mbtiles'}
                    onClick={() => setFormat('mbtiles')}
                    {...props}
                  >
                    MBTiles
                  </Button>
                )}
              </LongPressTooltip>

              <LongPressTooltip label="OSMAnd, Locus Map">
                {({ props }) => (
                  <Button
                    variant="secondary"
                    active={format === 'sqlitedb'}
                    onClick={() => setFormat('sqlitedb')}
                    {...props}
                  >
                    SQLiteDB
                  </Button>
                )}
              </LongPressTooltip>
            </ButtonGroup>
          </Form.Group>

          {mapDef && (
            <Form.Group controlId="zoomRange" className="mb-3">
              <Form.Label className="required">
                {m?.downloadMap.zoomRange}
              </Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={minZoom}
                  isInvalid={invalidMinZoom}
                  onChange={(e) => setMinZoom(e.currentTarget.value)}
                />

                <InputGroup.Text>&ndash;</InputGroup.Text>

                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={maxZoom}
                  isInvalid={invalidMaxZoom}
                  onChange={(e) => setMaxZoom(e.currentTarget.value)}
                />
              </InputGroup>
            </Form.Group>
          )}

          {mapDef?.extraScales && (
            <Form.Group controlId="scale" className="mb-3">
              <Form.Label>{m?.downloadMap.scale}</Form.Label>

              <Form.Select
                value={scale}
                onChange={(e) => setScale(e.currentTarget.value)}
              >
                <option value="1">1</option>

                {mapDef.extraScales.map((scale) => (
                  <option key={scale} value={scale}>
                    {scale}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group controlId="email" className="mb-3">
            <Form.Label className="required">{m?.downloadMap.email}</Form.Label>

            <Form.Control
              type="email"
              value={email}
              required
              isInvalid={invalidEmail}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <Form.Text className="text-muted">
              {m?.downloadMap.emailInfo}
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="flex-wrap">
          {tileCount !== undefined && mapDef && (
            <div className="w-100 text-end">
              {m?.downloadMap.summaryTiles}: <b>{cnf.format(tileCount)}</b> ｜{' '}
              <span
                className={
                  price >= Math.floor(user?.credits ?? 0) ? 'text-danger' : ''
                }
              >
                {m?.downloadMap.summaryPrice(<b>{cnf.format(price)}</b>)}
              </span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={close}
            type="submit"
            disabled={
              invalidEmail ||
              invalidMinZoom ||
              invalidMaxZoom ||
              price >= Math.floor(user?.credits ?? 0)
            }
          >
            <FaDownload /> {m?.downloadMap.download} <kbd>Enter</kbd>
          </Button>

          <Button variant="dark" onClick={close} type="button">
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
