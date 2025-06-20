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
import { Button, ButtonGroup, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaDownload, FaDrawPolygon, FaEye, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { authInit } from '../actions/authActions.js';
import { downloadMap, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMap } from '../hooks/useMap.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import {
  baseLayers,
  IntegratedLayerDef,
  IsTileLayerDef,
  overlayLayers,
} from '../mapDefinitions.js';
import { CreditsAlert } from './CredistAlert.js';

type Props = { show: boolean };

export default DownloadMapModal;

export function DownloadMapModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const mapType = useAppSelector((state) => state.map.mapType);

  const [name, setName] = useState('');

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
      [...baseLayers, ...overlayLayers].filter(
        (
          def,
        ): def is IntegratedLayerDef<
          IsTileLayerDef & {
            creditsPerMTile: number;
            technology: 'tile';
          }
        > => def.technology === 'tile' && def.creditsPerMTile !== undefined,
      ),
    [],
  );

  // for server
  console.log(
    JSON.stringify(
      mapDefs.map((mapDef) => ({
        type: mapDef.type,
        url: mapDef.url,
        extraScales: mapDef.extraScales,
        minZoom: mapDef.minZoom,
        maxNativeZoom: mapDef.maxNativeZoom,
        creditsPerMTile: mapDef.creditsPerMTile,
        attributuion: 'TODO',
      })),
    ),
  );

  const [type, setType] = useState(
    mapDefs.find((mapDef) => mapDef.type === mapType)?.type ?? 'X',
  );

  const [scale, setScale] = useState('1');

  const mapDef = useMemo(
    () => mapDefs.find((def) => def.type === type),
    [type, mapDefs],
  );

  useEffect(() => {
    if (!mapDef) {
      return;
    }

    setMinZoom(String(mapDef.minZoom ?? 0));

    setMaxZoom(String(mapDef.maxNativeZoom));
  }, [mapDef]);

  const map = useMap();

  const boundingBox = map?.getBounds().toBBoxString();

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

    if (area === 'visible' && boundingBox) {
      let count = 0;

      const bounds = boundingBox.split(',').map(Number);

      for (let zoom = Number(minZoom); zoom <= Number(maxZoom); zoom++) {
        const from = pointToTile(bounds[0], bounds[1], zoom);
        const to = pointToTile(bounds[2], bounds[3], zoom);

        count += (to[0] - from[0] + 1) * (from[1] - to[1] + 1);
      }

      return count;
    }

    return undefined;
  }, [
    selectedLine?.type,
    selectedLine?.points,
    area,
    boundingBox,
    minZoom,
    maxZoom,
  ]);

  const cnf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      dispatch(
        downloadMap({
          email,
          name,
          type,
          maxZoom: Number(maxZoom),
          minZoom: Number(minZoom),
          scale: Number(scale),
          boundary:
            selectedLine?.type === 'polygon' && area === 'selected'
              ? polygon([
                  [
                    ...selectedLine.points.map((pt) => [pt.lon, pt.lat]),
                    [selectedLine.points[0].lon, selectedLine.points[0].lat],
                  ],
                ])
              : bboxPolygon(boundingBox!.split(',').map(Number) as BBox),
        }),
      );
    },
    [
      area,
      boundingBox,
      dispatch,
      email,
      maxZoom,
      minZoom,
      name,
      scale,
      selectedLine?.points,
      selectedLine?.type,
      type,
    ],
  );

  // refresh user (credits)
  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const price =
    mapDef && tileCount
      ? Math.ceil((tileCount * mapDef.creditsPerMTile) / 1_000_000)
      : Infinity;

  const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <Modal show={show} onHide={close}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaDownload /> Download map{/* t */}
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
                <a href="https://www.locusmap.app/" target="_blank">
                  Guru Maps
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
              </li>

              <li>
                <strong>Web:</strong> Leaflet, MapLibre GL JS or OpenLayers (via
                a tile server such as TileServer GL)
              </li>
            </ul>
          </div>

          <CreditsAlert price={price} />

          <hr />

          <Form.Group>
            <Form.Label>Download</Form.Label>

            <ButtonGroup className="d-block mb-3">
              <Button
                variant="secondary"
                active={area === 'visible'}
                onClick={() => setArea('visible')}
              >
                <FaEye /> Visible area
              </Button>

              <Button
                variant="secondary"
                active={area === 'selected'}
                onClick={() => setArea('selected')}
                disabled={selectedLine?.type !== 'polygon'}
              >
                <FaDrawPolygon /> Area covered by selected polygon
              </Button>
            </ButtonGroup>
          </Form.Group>

          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>

            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </Form.Group>

          <Form.Group controlId="type">
            <Form.Label>Map</Form.Label>

            <Form.Select
              className="mb-3"
              value={type}
              onChange={(e) => setType(e.currentTarget.value as 'X')}
            >
              {mapDefs.map((layer) => (
                <option key={layer.type} value={layer.type}>
                  {m?.mapLayers.letters[layer.type]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {mapDef && (
            <Form.Group controlId="zoomRange" className="mb-3">
              <Form.Label>Zoom range</Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={minZoom}
                  onChange={(e) => setMinZoom(e.currentTarget.value)}
                />

                <InputGroup.Text>&ndash;</InputGroup.Text>

                <Form.Control
                  type="number"
                  min={mapDef.minZoom ?? 0}
                  max={mapDef.maxNativeZoom}
                  value={maxZoom}
                  onChange={(e) => setMaxZoom(e.currentTarget.value)}
                />
              </InputGroup>
            </Form.Group>
          )}

          {mapDef?.extraScales && (
            <Form.Group controlId="scale" className="mb-3">
              <Form.Label>Scale</Form.Label>

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

          <hr />

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>
              Your email address <sup>*</sup>
            </Form.Label>

            <Form.Control
              type="email"
              value={email}
              required
              isInvalid={invalidEmail}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <Form.Text className="text-muted">
              We will use your email to send you the download link.
            </Form.Text>
          </Form.Group>

          {tileCount !== undefined && mapDef && (
            <div className="mb-3">
              Tiles: <b>{cnf.format(tileCount)}</b> ｜ Total price:{' '}
              <b>{cnf.format(price)}</b> credits
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            onClick={close}
            type="submit"
            disabled={invalidEmail || price >= Math.floor(user?.credits ?? 0)}
          >
            <FaDownload /> Download
          </Button>

          <Button variant="dark" onClick={close} type="button">
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
