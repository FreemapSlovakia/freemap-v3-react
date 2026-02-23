import { CRS } from 'leaflet';
import storage from 'local-storage-fallback';
import {
  ChangeEvent,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import {
  FaDownload,
  FaDrawPolygon,
  FaEye,
  FaPrint,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert, is } from 'typia';
import {
  ExportableLayer,
  ExportFormat,
  exportMap,
  LAYERS,
} from '../model/actions.js';
import {
  setActiveModal,
} from '../../../actions/mainActions.js';
import { toastsAdd } from '../../toasts/model/actions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { usePersistentState } from '../../../hooks/usePersistentState.js';
import { useMessages } from '../../../l10nInjector.js';
import { isInvalidInt } from '../../../numberValidator.js';
import { useResolvedAttribution } from '../../../components/Attribution.js';

type Props = { show: boolean };

const LAYERS_STORAGE_KEY = 'fm.exportMap.layers';

const MAP_LAYERS = ['X'];

export default ExportMapModal;

export function ExportMapModal({ show }: Props): ReactElement {
  const canExportByPolygon = useAppSelector(
    (state) =>
      state.main.selection?.type === 'draw-line-poly' &&
      state.main.selection.id !== undefined,
  );

  const m = useMessages();

  const [area, setArea] = useState<'visible' | 'selected'>(
    canExportByPolygon ? 'selected' : 'visible',
  );

  const [scale, setScale] = usePersistentState<string>(
    'fm.exportMap.scale',
    (value) => value,
    (value) => value ?? '100',
  );

  const [format, , setFormat] = usePersistentState<ExportFormat>(
    'fm.exportMap.format',

    (value) => value,
    (value) => (is<ExportFormat>(value) ? value : 'jpeg'),
  );

  const [layers, setLayers] = useState(() => {
    const layers = storage.getItem(LAYERS_STORAGE_KEY);

    if (!layers) {
      return new Set(LAYERS);
    }

    const set = new Set<ExportableLayer>();

    for (const str of layers.split(',')) {
      if (is<ExportableLayer>(str)) {
        set.add(str);
      }
    }

    return set;
  });

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  const invalidScale = isInvalidInt(scale, true, 60, 960);

  const cookiesEnabled = useAppSelector(
    (state) => state.main.cookieConsentResult !== null,
  );

  const handleLayersChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value as ExportableLayer;

      setLayers((prev) => {
        const n = new Set(prev);

        if (n.has(value)) {
          n.delete(value);
        } else {
          n.add(value);
        }

        if (cookiesEnabled) {
          storage.setItem(LAYERS_STORAGE_KEY, [...n].join(','));
        }

        return n;
      });
    },
    [cookiesEnabled],
  );

  const handleScaleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setScale(e.currentTarget.value);
    },
    [setScale],
  );

  const countries = useAppSelector((state) => state.map.countries);

  const [polyCountries, setPolyCountries] = useState<string[] | undefined>();

  const poly0 = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id]
      : undefined,
  );

  const poly = area === 'selected' ? poly0 : undefined;

  useEffect(() => {
    if (!poly || polyCountries) {
      return;
    }

    const coords = [...poly.points, poly.points.at(-1)!]
      .map((point) => CRS.EPSG3857.project({ lng: point.lon, lat: point.lat }))
      .map((point) => point.x + ' ' + point.y)
      .join(',');

    fetch(`${process.env['API_URL']}/geotools/in-count`, {
      method: 'POST',
      body: `POLYGON((${coords}))`,
      headers: { 'content-type': 'text/plain' },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error();
      })
      .then((data) => {
        setPolyCountries(assert<string[]>(data));
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch, poly, polyCountries]);

  const attribution = useResolvedAttribution(
    MAP_LAYERS,
    area === 'selected' ? polyCountries : countries,
  );

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">
          {m?.mapExport.alert(
            attribution?.map(([type, elem]) => (
              <Fragment key={type}>{elem}, </Fragment>
            )),
          )}
        </Alert>

        <Form.Group>
          <Form.Label className="d-block">{m?.mapExport.area}</Form.Label>

          <ButtonGroup className="d-flex">
            <Button
              className="fm-ellipsis"
              variant="secondary"
              active={area === 'visible'}
              onClick={() => setArea('visible')}
            >
              <FaEye /> {m?.mapExport.areas.visible}
            </Button>

            <Button
              className="fm-ellipsis"
              variant="secondary"
              active={area === 'selected'}
              onClick={() => setArea('selected')}
              disabled={!canExportByPolygon}
            >
              <FaDrawPolygon /> {m?.mapExport.areas.pinned}
            </Button>
          </ButtonGroup>
        </Form.Group>

        <hr />

        <Form.Group>
          <Form.Label className="d-block"> {m?.mapExport.format}</Form.Label>

          <ButtonGroup>
            {['jpeg', 'png', 'pdf', 'svg'].map((fmt) => (
              <Button
                variant="secondary"
                key={fmt}
                value={fmt}
                onClick={setFormat}
                active={format === fmt}
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </ButtonGroup>
        </Form.Group>

        <hr />

        <Form.Group>
          <Form.Label>{m?.mapExport.layersTitle}</Form.Label>

          {LAYERS.map((layer) => (
            <Form.Check
              key={layer}
              id={layer}
              value={layer}
              type="checkbox"
              checked={layers.has(layer)}
              onChange={handleLayersChange}
              label={m?.mapExport.layers[layer]}
            />
          ))}
        </Form.Group>

        <hr />

        <Form.Group controlId="mapScale">
          <Form.Label>{m?.mapExport.mapScale}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              value={scale}
              min={60}
              max={960}
              step={10}
              isInvalid={invalidScale}
              onChange={handleScaleChange}
            />

            <InputGroup.Text>DPI</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          disabled={invalidScale}
          onClick={() =>
            dispatch(
              exportMap({
                area,
                scale: parseInt(scale, 10) / 96,
                format,
                layers: [...layers],
              }),
            )
          }
        >
          <FaDownload /> {m?.general.export}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
