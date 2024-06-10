import { exportMap, setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import {
  FaDownload,
  FaDrawPolygon,
  FaPrint,
  FaRegQuestionCircle,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';

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

  const isAdmin = useAppSelector((state) => state.auth.user?.isAdmin);

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
          <FaPrint /> {m?.mainMenu.pdfExport}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">{m?.pdfExport.alert()}</Alert>

        <p>{m?.pdfExport.area}</p>

        <ButtonGroup>
          <Button
            variant="secondary"
            active={area === 'visible'}
            onClick={() => setArea('visible')}
          >
            {m?.pdfExport.areas.visible}
          </Button>

          <Button
            variant="secondary"
            active={area === 'selected'}
            onClick={() => setArea('selected')}
            disabled={!canExportByPolygon}
          >
            {m?.pdfExport.areas.pinned} <FaDrawPolygon />
          </Button>
        </ButtonGroup>

        <hr />

        <p>{m?.pdfExport.format}</p>

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

          {isAdmin && (
            <>
              <Button
                variant="secondary"
                onClick={() => setFormat('pdf')}
                active={format === 'pdf'}
              >
                PDF
              </Button>

              <Button
                variant="secondary"
                onClick={() => setFormat('svg')}
                active={format === 'svg'}
              >
                SVG
              </Button>
            </>
          )}
        </ButtonGroup>

        <hr />

        <p>{m?.pdfExport.layersTitle}</p>

        <Form.Check
          id="contours"
          type="checkbox"
          checked={contours}
          onChange={() => {
            setContours((b) => !b);
          }}
          label={m?.pdfExport.layers.contours}
        />

        <Form.Check
          id="shading"
          type="checkbox"
          checked={shadedRelief}
          onChange={() => setShadedRelief((b) => !b)}
          label={m?.pdfExport.layers.shading}
        />

        <Form.Check
          id="hikingTrails"
          type="checkbox"
          checked={hikingTrails}
          onChange={() => {
            setHikingTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.hikingTrails}
        />

        <Form.Check
          id="bicycleTrails"
          checked={bicycleTrails}
          onChange={() => {
            setBicycleTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.bicycleTrails}
        />

        <Form.Check
          id="skiTrails"
          type="checkbox"
          checked={skiTrails}
          onChange={() => {
            setSkiTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.skiTrails}
        />

        <Form.Check
          id="horseTrails"
          type="checkbox"
          checked={horseTrails}
          onChange={() => {
            setHorseTrails((b) => !b);
          }}
          label={m?.pdfExport.layers.horseTrails}
        />

        <Form.Check
          id="drawing"
          type="checkbox"
          checked={drawing}
          onChange={() => {
            setDrawing((b) => !b);
          }}
          label={m?.pdfExport.layers.drawing}
        />

        <Form.Check
          id="plannedRoute"
          type="checkbox"
          checked={plannedRoute}
          onChange={() => {
            setPlannedRoute((b) => !b);
          }}
          label={m?.pdfExport.layers.plannedRoute}
        />

        <Form.Check
          id="track"
          type="checkbox"
          checked={track}
          onChange={() => {
            setTrack((b) => !b);
          }}
          label={m?.pdfExport.layers.track}
        />

        <hr />

        <p>{m?.pdfExport.mapScale}</p>

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
          <Card>
            <Card.Header>
              <Accordion.Button
                as={Button}
                variant="link"
                eventKey="0"
                className="text-left w-100"
              >
                {m?.pdfExport.advancedSettings}
              </Accordion.Button>
            </Card.Header>

            <Accordion.Collapse eventKey="0" className="p-2">
              <Form.Group className="mt-2">
                <Form.Label>
                  {m?.pdfExport.styles}{' '}
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
            </Accordion.Collapse>
          </Card>
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
