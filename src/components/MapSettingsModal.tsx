import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import {
  BaseLayerLetters,
  baseLayers,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  overlayLayers,
  OverlayLetters,
  overlayLetters,
} from 'fm3/mapDefinitions';
import { Fragment, ReactElement, useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import {
  FaCheck,
  FaCog,
  FaEllipsisH,
  FaRegListAlt,
  FaTimes,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

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

  const userMadeChanges =
    overlayPaneOpacity !== initOverlayPaneOpacity ||
    layersSettings !== initLayersSettings;

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const customLayers = useSelector((state) => state.map.customLayers);

  const bases = [
    ...baseLayers,
    ...customLayers
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
    ...customLayers
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
      : m?.mapLayers.letters[type];
  }

  return (
    <Modal show={show} onHide={close}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              layersSettings,
              overlayPaneOpacity,
            }),
          );
        }}
      >
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
