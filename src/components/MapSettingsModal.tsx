import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { CustomLayer, mapSetCustomLayers } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import {
  BaseLayerLetters,
  baseLayers,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  NoncustomLayerLetters,
  overlayLayers,
  OverlayLetters,
  overlayLetters,
} from 'fm3/mapDefinitions';
import {
  FormEvent,
  Fragment,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Accordion,
  Card,
  FormControl,
  FormGroup,
  FormLabel,
} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {
  FaCheck,
  FaCog,
  FaEllipsisH,
  FaFlask,
  FaRegListAlt,
  FaTimes,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { assertType } from 'typescript-is';

type Props = { show: boolean };

export default MapSettingsModal;

export function MapSettingsModal({ show }: Props): ReactElement {
  const initLayersSettings = useSelector((state) => state.map.layersSettings);

  const initOverlayPaneOpacity = useSelector(
    (state) => state.map.overlayPaneOpacity,
  );

  const m = useMessages();

  const [layersSettings, setLayersSettings] = useState(initLayersSettings);

  const [overlayPaneOpacity, setOverlayPaneOpacity] = useState(
    initOverlayPaneOpacity,
  );

  const [selectedLayer, setSelectedLeyer] = useState('X');

  const dispatch = useDispatch();

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const customLayers = useSelector((state) => state.map.customLayers);

  const initialCustomLayersDef = useMemo(
    () => (customLayers.length ? JSON.stringify(customLayers, null, 2) : ''),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [customLayersDef, setCustomLayersDef] = useState(
    initialCustomLayersDef,
  );

  let localCustomLayers: CustomLayer[];

  try {
    localCustomLayers = assertType<CustomLayer[]>(
      JSON.parse(customLayersDef || '[]'),
    );
  } catch {
    localCustomLayers = customLayers;
  }

  const wasFocused = useRef(false);

  const customLayersHelp = `// remove all commentes (starting with // to end of line) because it must be a valid JSON
[
  {
    "type": ".1", // prefix 1-digit number with "." for base layers and ":" for overlay layers
    "url": "https://example.com/{z}/{x}/{y}.jpg",
    "minZoom": 0,
    "maxNativeZoom": 18,
    // "zIndex": 0, // for overlays
    // "subdomains": "abc",
    // "tms": false, // set to true for TMS, false for XYZ
    // "extraScales": [2, 3], // for maps supporting multiple scales
    // "scaleWithDpi": true,
    // "cors": false
  }
]
`;

  const handleCustomLayersDefFocus = () => {
    if (!wasFocused.current && !customLayersDef) {
      setCustomLayersDef(customLayersHelp);
    }

    wasFocused.current = true;
  };

  const bases = [
    ...baseLayers,
    ...localCustomLayers
      .filter((cl) => cl.type.startsWith('.'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), false] as const,
      })),
  ];

  const ovls = [
    ...overlayLayers,
    ...localCustomLayers
      .filter((cl) => cl.type.startsWith(':'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), true] as const,
      })),
  ];

  const selectedLayerDetails = [...bases, ...ovls].find(
    ({ type }) => type === selectedLayer,
  );

  function getName(type: BaseLayerLetters | OverlayLetters) {
    return type.startsWith('.')
      ? m?.mapLayers.customBase + ' ' + type.slice(1)
      : type.startsWith(':')
      ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
      : m?.mapLayers.letters[type as NoncustomLayerLetters];
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      dispatch(
        mapSetCustomLayers(
          assertType<CustomLayer[]>(JSON.parse(customLayersDef || '[]')),
        ),
      );
    } catch {
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
        layersSettings,
        overlayPaneOpacity,
      }),
    );
  };

  const userMadeChanges =
    overlayPaneOpacity !== initOverlayPaneOpacity ||
    layersSettings !== initLayersSettings ||
    customLayersDef !== initialCustomLayersDef;

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mapLayers.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>
              {m?.settings.map.overlayPaneOpacity}{' '}
              {nf.format(overlayPaneOpacity * 100)}
              {' %'}
            </Form.Label>

            <Form.Control
              type="range"
              custom
              value={overlayPaneOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(e) =>
                setOverlayPaneOpacity(Number(e.currentTarget.value))
              }
            />
          </Form.Group>

          {selectedLayerDetails && (
            <>
              <hr />

              <Form.Group>
                <Form.Label>{m?.settings.layer}</Form.Label>

                <DropdownButton
                  className="fm-map-layers-dropdown"
                  variant="secondary"
                  id="overlayOpacity"
                  onSelect={(o) => {
                    if (o !== null) {
                      setSelectedLeyer(o);
                    }
                  }}
                  title={
                    <>
                      {selectedLayerDetails.icon}{' '}
                      {getName(selectedLayerDetails.type)}{' '}
                      {nf.format(
                        (layersSettings[selectedLayer]?.opacity ?? 1) * 100,
                      )}{' '}
                      %
                    </>
                  }
                >
                  {[...bases, ...ovls].map(({ type, icon }, i) => (
                    <Fragment key={type}>
                      {i === bases.length && <Dropdown.Divider />}
                      <Dropdown.Item
                        eventKey={type}
                        active={type === selectedLayer}
                      >
                        {icon} {getName(type)}
                        {((overlayLetters as readonly string[]).includes(
                          type,
                        ) ||
                          type.charAt(0) === ':') && (
                          <>
                            {' ('}
                            {nf.format(
                              (layersSettings[type]?.opacity ?? 1) * 100,
                            )}{' '}
                            %)
                          </>
                        )}{' '}
                        <FaEllipsisH
                          color={
                            layersSettings[type]?.showInToolbar ??
                            defaultToolbarLayerLetters.includes(type)
                              ? ''
                              : '#ddd'
                          }
                        />{' '}
                        <FaRegListAlt
                          color={
                            layersSettings[type]?.showInMenu ??
                            defaultMenuLayerLetters.includes(type)
                              ? ''
                              : '#ddd'
                          }
                        />
                      </Dropdown.Item>
                    </Fragment>
                  ))}
                </DropdownButton>
              </Form.Group>

              <Form.Check
                type="checkbox"
                id="chk-showInToolbar"
                label={
                  <>
                    <FaEllipsisH /> {m?.settings.showInToolbar}
                  </>
                }
                checked={
                  layersSettings[selectedLayer]?.showInToolbar ??
                  defaultToolbarLayerLetters.includes(selectedLayer)
                }
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={(e) => {
                  setLayersSettings({
                    ...layersSettings,
                    [selectedLayer]: {
                      ...(layersSettings[selectedLayer] ?? {}),
                      showInToolbar: e.currentTarget.checked,
                    },
                  });
                }}
              />

              <Form.Check
                type="checkbox"
                id="chk-showInMenu"
                label={
                  <>
                    <FaRegListAlt /> {m?.settings.showInMenu}
                  </>
                }
                checked={
                  layersSettings[selectedLayer]?.showInMenu ??
                  defaultMenuLayerLetters.includes(selectedLayer)
                }
                min={0.1}
                max={1.0}
                step={0.1}
                onChange={(e) => {
                  setLayersSettings({
                    ...layersSettings,
                    [selectedLayer]: {
                      ...(layersSettings[selectedLayer] ?? {}),
                      showInMenu: e.currentTarget.checked,
                    },
                  });
                }}
              />

              {(overlayLetters.includes(selectedLayer as any) ||
                selectedLayer.charAt(0) === ':') && (
                <Form.Group className="mt-2">
                  <Form.Label>{m?.settings.overlayOpacity}</Form.Label>

                  <Form.Control
                    type="range"
                    custom
                    value={layersSettings[selectedLayer]?.opacity ?? 1}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    onChange={(e) => {
                      setLayersSettings({
                        ...layersSettings,
                        [selectedLayer]: {
                          ...(layersSettings[selectedLayer] ?? {}),
                          opacity: Number(e.currentTarget.value),
                        },
                      });
                    }}
                  />
                </Form.Group>
              )}
            </>
          )}

          <hr />

          <Accordion>
            <Card>
              <Card.Header>
                <Accordion.Toggle
                  as={Button}
                  eventKey="0"
                  variant="link"
                  className="text-left w-100"
                >
                  {m?.pdfExport.advancedSettings}
                </Accordion.Toggle>
              </Card.Header>

              <Accordion.Collapse eventKey="0" className="p-2">
                <FormGroup>
                  <FormLabel>
                    {m?.settings.customLayersDef}{' '}
                    <FaFlask
                      title={m?.general.experimentalFunction}
                      className="text-warning"
                    />
                  </FormLabel>

                  <FormControl
                    as="textarea"
                    value={customLayersDef}
                    onChange={(e) => setCustomLayersDef(e.target.value)}
                    rows={12}
                    className="text-monospace text-pre"
                    onFocus={handleCustomLayersDefFocus}
                    placeholder={customLayersHelp}
                  />
                </FormGroup>
              </Accordion.Collapse>
            </Card>
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
