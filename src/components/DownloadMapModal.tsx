import { pointToTile, tileToBBOX } from '@mapbox/tilebelt';
import bbox from '@turf/bbox';
import { bboxPolygon } from '@turf/bbox-polygon';
import { booleanIntersects } from '@turf/boolean-intersects';
import { polygon } from '@turf/helpers';
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
import { setActiveModal } from '../actions/mainActions.js';
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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
  }

  const [name, setName] = useState('');

  const [type, setType] = useState('X');

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
      const poly = polygon([selectedLine.points.map((pt) => [pt.lon, pt.lat])]);

      const bounds = bbox(poly);

      let count = 0;

      for (let zoom = Number(minZoom); zoom <= Number(maxZoom); zoom++) {
        const from = pointToTile(bounds[0], bounds[1], zoom);

        const to = pointToTile(bounds[2], bounds[3], zoom);

        for (let x = from[0]; x <= to[0]; x++) {
          for (let y = from[1]; y <= to[1]; y++) {
            const tileBbox = tileToBBOX([x, y, zoom]);

            const tilePoly = bboxPolygon(tileBbox);

            if (booleanIntersects(poly, tilePoly)) {
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

          <CreditsAlert />

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

            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>

              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Form.Group>
          </Form.Group>

          <Form.Group controlId="type">
            <Form.Label>Map</Form.Label>

            <Form.Select
              className="mb-3"
              value={type}
              onChange={(e) => setType(e.currentTarget.value)}
            >
              {mapDefs.map((layer) => (
                <option value={layer.type}>
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

              <Form.Select>
                <option value="1">1</option>

                {mapDef.extraScales.map((scale) => (
                  <option value={scale}>{scale}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {tileCount !== undefined && mapDef && (
            <>
              <div>Tiles: {cnf.format(tileCount)}</div>

              <div>
                Price:{' '}
                {cnf.format(
                  Math.ceil((tileCount * mapDef.creditsPerMTile) / 1_000_000),
                )}{' '}
                credits
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={close} type="submit">
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
