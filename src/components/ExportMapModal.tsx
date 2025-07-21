import storage from 'local-storage-fallback';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import {
  Accordion,
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
  FaRegQuestionCircle,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import {
  ExportableLayer,
  ExportFormat,
  exportMap,
  LAYERS,
  setActiveModal,
} from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { isInvalidInt } from '../numberValidator.js';

type Props = { show: boolean };

const FORMAT_STORAGE_KEY = 'fm.exportMap.format';

const LAYERS_STORAGE_KEY = 'fm.exportMap.layers';

const SCALE_STORAGE_KEY = 'fm.exportMap.scale';

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

  const [scale, setScale] = useState(
    () => storage.getItem(SCALE_STORAGE_KEY) ?? '100',
  );

  const [format, setFormat] = useState<ExportFormat>(() => {
    const target = storage.getItem(FORMAT_STORAGE_KEY);

    return is<ExportFormat>(target) ? target : 'jpeg';
  });

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

  const [style, setStyle] = useState(`<Style name="custom-polygons">
  <Rule>
    <PolygonSymbolizer
      fill="[color]"
      fill-opacity="0.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <LineSymbolizer
      stroke="[color]"
      stroke-width="[width]"
      stroke-opacity="0.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <TextSymbolizer
      fontset-name="regular"
      fill="[color]"
      halo-fill="white"
      halo-radius="1.5"
      halo-opacity="0.75"
      size="16"
      line-spacing="-2"
      wrap-width="100"
      wrap-before="true"
      placement="interior"
    >
      [name]
    </TextSymbolizer>
  </Rule>
</Style>

<Style name="custom-polylines">
  <Rule>
    <LineSymbolizer
      stroke="[color]"
      stroke-width="[width]"
      stroke-opacity="0.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <TextSymbolizer
      fontset-name="regular"
      fill="[color]"
      halo-fill="white"
      halo-radius="1.5"
      halo-opacity="0.75"
      size="16"
      line-spacing="-2"
      placement="line"
      spacing="200"
      dy="8"
    >
      [name]
    </TextSymbolizer>
  </Rule>
</Style>

<Style name="custom-points">
  <Rule>
    <MarkersSymbolizer
      fill="[color]"
      width="24"
      file="images/marker.svg"
      allow-overlap="true"
      ignore-placement="true"
      stroke-width="1.5"
      stroke-opacity="0.75"
      stroke="white"
    />

    <TextSymbolizer
      fontset-name="regular"
      fill="[color]"
      halo-fill="white"
      halo-radius="1.5"
      halo-opacity="0.75"
      size="16"
      line-spacing="-2"
      wrap-width="100"
      wrap-before="true"
      dy="-40"
    >
      [name]
    </TextSymbolizer>
  </Rule>
</Style>
`);

  const handleStyleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setStyle(e.currentTarget.value);
    },
    [],
  );

  const dispatch = useDispatch();

  function close() {
    dispatch(setActiveModal(null));
  }

  const invalidScale = isInvalidInt(scale, true, 60, 960);

  const handleFormatChange = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    storage.setItem(FORMAT_STORAGE_KEY, e.currentTarget.value);

    setFormat(e.currentTarget.value as ExportFormat);
  }, []);

  const handleLayersChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value as ExportableLayer;

    setLayers((prev) => {
      const n = new Set(prev);

      if (n.has(value)) {
        n.delete(value);
      } else {
        n.add(value);
      }

      storage.setItem(LAYERS_STORAGE_KEY, [...n].join(','));

      return n;
    });
  }, []);

  const handleScaleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    storage.setItem(SCALE_STORAGE_KEY, e.currentTarget.value);

    setScale(e.currentTarget.value);
  }, []);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">{m?.mapExport.alert()}</Alert>

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
                onClick={handleFormatChange}
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

        <hr />

        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{m?.mapExport.advancedSettings}</Accordion.Header>

            <Accordion.Body>
              <Form.Group controlId="styles" className="mb-3">
                <Form.Label>
                  {m?.mapExport.styles}{' '}
                  <a
                    href="http://mapnik.org/mapnik-reference/"
                    target="mapnik_reference"
                  >
                    <FaRegQuestionCircle />
                  </a>
                </Form.Label>

                <Form.Control
                  as="textarea"
                  value={style}
                  onChange={handleStyleChange}
                  rows={12}
                  disabled={
                    !layers.has('drawing') &&
                    !layers.has('plannedRoute') &&
                    !layers.has('track')
                  }
                  className="text-monospace"
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
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
                style,
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
