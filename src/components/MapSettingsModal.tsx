import { FormEvent, ReactElement, useCallback, useMemo, useState } from 'react';
import {
  Accordion,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
  Stack,
  Table,
} from 'react-bootstrap';
import {
  FaCheck,
  FaCog,
  FaEllipsisH,
  FaEye,
  FaRegListAlt,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { saveSettings, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import {
  BaseLayerLetters,
  baseLayers,
  CustomLayerDef,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  IntegratedLayerLetters,
  overlayLayers,
  OverlayLetters,
} from '../mapDefinitions.js';

type Props = { show: boolean };

export default MapSettingsModal;

export function MapSettingsModal({ show }: Props): ReactElement {
  const initLayersSettings = useAppSelector(
    (state) => state.map.layersSettings,
  );

  const m = useMessages();

  const [layersSettings, setLayersSettings] = useState(initLayersSettings);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const initialCustomLayersDef = useMemo(
    () => (customLayers.length ? JSON.stringify(customLayers, null, 2) : ''),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [customLayersDef] = useState(initialCustomLayersDef);

  //   let localCustomLayers: CustomLayerDef[];

  //   try {
  //     localCustomLayers = assert<CustomLayerDef[]>(
  //       JSON.parse(customLayersDef || '[]'),
  //     );
  //   } catch (e) {
  //     console.log(e);

  //     localCustomLayers = customLayers;
  //   }

  //   const wasFocused = useRef(false);

  //   const customLayersHelp = `// remove all commentes (starting with // to end of line) because it must be a valid JSON
  // [
  //   {
  //     "type": ".1", // prefix 1-digit number with "." for base layers and ":" for overlay layers
  //     "url": "https://example.com/{z}/{x}/{y}.jpg",
  //     "minZoom": 0,
  //     "maxNativeZoom": 18,
  //     // "zIndex": 0, // for overlays
  //     // "subdomains": "abc",
  //     // "tms": false, // set to true for TMS, false for XYZ
  //     // "extraScales": [2, 3], // for maps supporting multiple scales
  //     // "scaleWithDpi": true,
  //     // "cors": false
  //   }
  // ]
  // `;

  // const handleCustomLayersDefFocus = () => {
  //   if (!wasFocused.current && !customLayersDef) {
  //     setCustomLayersDef(customLayersHelp);
  //   }

  //   wasFocused.current = true;
  // };

  // const bases = [
  //   ...baseLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith('.'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), false] as const,
  //     })),
  // ];

  // const ovls = [
  //   ...overlayLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith(':'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), true] as const,
  //     })),
  // ];

  function getName(type: BaseLayerLetters | OverlayLetters) {
    return type.startsWith('.')
      ? m?.mapLayers.customBase + ' ' + type.slice(1)
      : type.startsWith(':')
        ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
        : m?.mapLayers.letters[type as IntegratedLayerLetters];
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let customLayers: CustomLayerDef[];

    try {
      customLayers = assert<CustomLayerDef[]>(
        JSON.parse(customLayersDef || '[]'),
      );
    } catch (e) {
      console.log(e);

      dispatch(
        toastsAdd({
          id: 'cusomLayersDef',
          style: 'danger',
          timeout: 5000,
          messageKey: 'settings.customLayersDefError',
        }),
      );

      return;
    }

    dispatch(
      saveSettings({
        settings: {
          layersSettings,
          customLayers,
        },
      }),
    );
  };

  const userMadeChanges =
    layersSettings !== initLayersSettings ||
    customLayersDef !== initialCustomLayersDef;

  const [activeType, setActiveType] = useState('');

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">{m?.settings.overlayOpacity}</Popover.Header>

      <Popover.Body>
        <Form.Range
          min={0}
          max={100}
          value={(layersSettings[activeType]?.opacity ?? 1) * 100}
          onChange={(e) =>
            setLayersSettings({
              ...layersSettings,
              [activeType]: {
                ...(layersSettings[activeType] ?? {}),
                opacity: Number(e.currentTarget.value) / 100,
              },
            })
          }
        />
      </Popover.Body>
    </Popover>
  );

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mapLayers.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Accordion>
            <Accordion.Item eventKey="menuAndToolbar">
              <Accordion.Header>{m?.mapLayers.menuAndToolbar}</Accordion.Header>

              <Accordion.Body>
                <Table striped borderless size="sm">
                  <thead>
                    <tr>
                      <th />
                      <th />
                      <th>
                        <FaEllipsisH title={m?.settings.showInToolbar} />
                      </th>
                      <th>
                        <FaRegListAlt title={m?.settings.showInMenu} />
                      </th>
                      <th>
                        <FaEye title={m?.settings.overlayOpacity} />
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...baseLayers, ...overlayLayers].map(
                      ({ icon, type }, i) => (
                        <tr key={type}>
                          <td>{icon}</td>

                          <td>{getName(type)}</td>

                          <td>
                            <Form.Check
                              checked={
                                layersSettings[type]?.showInToolbar ??
                                defaultToolbarLayerLetters.includes(type) ??
                                false
                              }
                              onChange={(e) => {
                                setLayersSettings({
                                  ...layersSettings,
                                  [type]: {
                                    ...(layersSettings[type] ?? {}),
                                    showInToolbar: e.currentTarget.checked,
                                  },
                                });
                              }}
                            />
                          </td>

                          <td>
                            <Form.Check
                              checked={
                                layersSettings[type]?.showInMenu ??
                                defaultMenuLayerLetters.includes(type) ??
                                false
                              }
                              onChange={(e) => {
                                setLayersSettings({
                                  ...layersSettings,
                                  [type]: {
                                    ...(layersSettings[type] ?? {}),
                                    showInMenu: e.currentTarget.checked,
                                  },
                                });
                              }}
                            />
                          </td>

                          <td>
                            {i > baseLayers.length && (
                              <div>
                                <OverlayTrigger
                                  trigger="click"
                                  placement="left"
                                  overlay={popover}
                                  rootClose
                                >
                                  <div className="fm-opacity-button">
                                    <button
                                      type="button"
                                      style={{
                                        opacity:
                                          (layersSettings[type]?.opacity ?? 1) *
                                            100 +
                                          '%',
                                      }}
                                      onClick={() => setActiveType(type)}
                                    />
                                  </div>
                                </OverlayTrigger>
                              </div>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="customMaps">
              <Accordion.Header>{m?.mapLayers.customMaps}</Accordion.Header>

              <Accordion.Body>
                {/* <Form.Group className="mb-3">
                  <Form.Label>
                    {m?.settings.customLayersDef}{' '}
                    <FaFlask
                      title={m?.general.experimentalFunction}
                      className="text-warning"
                    />
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    value={customLayersDef}
                    onChange={(e) => setCustomLayersDef(e.target.value)}
                    rows={12}
                    className="text-monospace text-pre"
                    onFocus={handleCustomLayersDefFocus}
                    placeholder={customLayersHelp}
                  />
                </Form.Group> */}
                <Container fluid className="p-0">
                  <Row className="mb-3">
                    <Col>Base</Col>

                    <ButtonGroup as={Col}>
                      {Array(10)
                        .fill(0)
                        .map((_, i) => (
                          <Button key={i}>{i}</Button>
                        ))}
                    </ButtonGroup>
                  </Row>

                  <Row>
                    <Col>Overlay</Col>

                    <ButtonGroup as={Col}>
                      {Array(10)
                        .fill(0)
                        .map((_, i) => (
                          <Button key={i}>{i}</Button>
                        ))}
                    </ButtonGroup>
                  </Row>
                </Container>

                <hr />

                <Stack gap={3}>
                  <Form.Group>
                    <Form.Label>Template</Form.Label>
                    <Form.Control type="text" />
                  </Form.Group>
                  <Stack direction="horizontal" gap={2}>
                    <Form.Group>
                      <Form.Label>Min Zoom</Form.Label>
                      <Form.Control type="number" min={0} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Max Zoom</Form.Label>
                      <Form.Control type="number" min={0} />
                    </Form.Group>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Form.Group className="w-50">
                      <Form.Label>Max Native Zoom</Form.Label>
                      <Form.Control type="number" min={0} />
                    </Form.Group>
                    <Form.Group className="w-50">
                      <Form.Label>&nbsp;</Form.Label>
                      <Form.Check id="chk-scale-dpi" label="Scale with DPI" />
                    </Form.Group>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Form.Group>
                      <Form.Label>Z-Index</Form.Label>
                      <Form.Control type="number" min={0} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Extra scales</Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>
                  </Stack>
                </Stack>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!userMadeChanges}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
