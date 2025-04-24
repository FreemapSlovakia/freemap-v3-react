import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
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
  FaFlask,
  FaPrint,
  FaRegQuestionCircle,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { exportMap, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';

type Props = { show: boolean };

export default ExportMapModal;

export function ExportMapModal({ show }: Props): ReactElement {
  const canExportByPolygon = useAppSelector(
    (state) =>
      state.main.selection?.type === 'draw-line-poly' &&
      state.main.selection.id !== undefined,
  );

  const m = useMessages();

  const [area, setArea] = useState<'visible' | 'selected'>('visible');

  const [scale, setScale] = useState(100);

  const [format, setFormat] = useState<'jpeg' | 'png' | 'pdf' | 'svg'>('jpeg');

  const [contours, setContours] = useState(true);

  const [shadedRelief, setShadedRelief] = useState(true);

  const [hikingTrails, setHikingTrails] = useState(true);

  const [bicycleTrails, setBicycleTrails] = useState(true);

  const [skiTrails, setSkiTrails] = useState(true);

  const [horseTrails, setHorseTrails] = useState(true);

  const [drawing, setDrawing] = useState(true);

  const [plannedRoute, setPlannedRoute] = useState(true);

  const [track, setTrack] = useState(true);

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

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPrint /> {m?.mainMenu.mapExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">{m?.mapExport.alert()}</Alert>

        <p>{m?.mapExport.area}</p>

        <ButtonGroup>
          <Button
            variant="secondary"
            active={area === 'visible'}
            onClick={() => setArea('visible')}
          >
            {m?.mapExport.areas.visible}
          </Button>

          <Button
            variant="secondary"
            active={area === 'selected'}
            onClick={() => setArea('selected')}
            disabled={!canExportByPolygon}
          >
            {m?.mapExport.areas.pinned} <FaDrawPolygon />
          </Button>
        </ButtonGroup>

        <hr />

        <p>{m?.mapExport.format}</p>

        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={() => setFormat('jpeg')}
            active={format === 'jpeg'}
          >
            JPEG
          </Button>

          <Button
            variant="secondary"
            onClick={() => setFormat('png')}
            active={format === 'png'}
          >
            PNG
          </Button>

          <Button
            variant="secondary"
            onClick={() => setFormat('pdf')}
            active={format === 'pdf'}
          >
            PDF{' '}
            <FaFlask
              title={m?.general.experimentalFunction}
              className="text-warning"
            />
          </Button>

          <Button
            variant="secondary"
            onClick={() => setFormat('svg')}
            active={format === 'svg'}
          >
            SVG{' '}
            <FaFlask
              title={m?.general.experimentalFunction}
              className="text-warning"
            />
          </Button>
        </ButtonGroup>

        <hr />

        <p>{m?.mapExport.layersTitle}</p>

        <Form.Check
          id="contours"
          type="checkbox"
          checked={contours}
          onChange={() => {
            setContours((b) => !b);
          }}
          label={m?.mapExport.layers.contours}
        />

        <Form.Check
          id="shading"
          type="checkbox"
          checked={shadedRelief}
          onChange={() => setShadedRelief((b) => !b)}
          label={m?.mapExport.layers.shading}
        />

        <Form.Check
          id="hikingTrails"
          type="checkbox"
          checked={hikingTrails}
          onChange={() => {
            setHikingTrails((b) => !b);
          }}
          label={m?.mapExport.layers.hikingTrails}
        />

        <Form.Check
          id="bicycleTrails"
          checked={bicycleTrails}
          onChange={() => {
            setBicycleTrails((b) => !b);
          }}
          label={m?.mapExport.layers.bicycleTrails}
        />

        <Form.Check
          id="skiTrails"
          type="checkbox"
          checked={skiTrails}
          onChange={() => {
            setSkiTrails((b) => !b);
          }}
          label={m?.mapExport.layers.skiTrails}
        />

        <Form.Check
          id="horseTrails"
          type="checkbox"
          checked={horseTrails}
          onChange={() => {
            setHorseTrails((b) => !b);
          }}
          label={m?.mapExport.layers.horseTrails}
        />

        <Form.Check
          id="drawing"
          type="checkbox"
          checked={drawing}
          onChange={() => {
            setDrawing((b) => !b);
          }}
          label={m?.mapExport.layers.drawing}
        />

        <Form.Check
          id="plannedRoute"
          type="checkbox"
          checked={plannedRoute}
          onChange={() => {
            setPlannedRoute((b) => !b);
          }}
          label={m?.mapExport.layers.plannedRoute}
        />

        <Form.Check
          id="track"
          type="checkbox"
          checked={track}
          onChange={() => {
            setTrack((b) => !b);
          }}
          label={m?.mapExport.layers.track}
        />

        <hr />

        <p>{m?.mapExport.mapScale}</p>

        <InputGroup>
          <Form.Control
            type="number"
            value={scale}
            min={60}
            max={960}
            step={10}
            onChange={(e) => {
              setScale(Number(e.currentTarget.value));
            }}
          />

          <InputGroup.Text>DPI</InputGroup.Text>
        </InputGroup>

        <hr />

        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{m?.mapExport.advancedSettings}</Accordion.Header>

            <Accordion.Body>
              <Form.Group className="mb-3">
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
                  disabled={!(drawing || plannedRoute || track)}
                  className="text-monospace"
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={() =>
            dispatch(
              exportMap({
                area,
                scale: scale / 96,
                format,
                contours,
                shadedRelief,
                hikingTrails,
                bicycleTrails,
                skiTrails,
                horseTrails,
                drawing,
                plannedRoute,
                track,
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
