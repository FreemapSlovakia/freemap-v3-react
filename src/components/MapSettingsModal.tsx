import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import {
  baseLayers,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  overlayLayers,
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
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export default MapSettingsModal;

export function MapSettingsModal({ show }: Props): ReactElement {
  const initLayersSettings = useSelector((state) => state.map.layersSettings);

  const initOverlayPaneOpacity = useSelector(
    (state) => state.map.overlayPaneOpacity,
  );

  const language = useSelector((state) => state.l10n.language);

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

  const selectedLayerDetails = [...baseLayers, ...overlayLayers].find(
    ({ type }) => type === selectedLayer,
  );

  const nf = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

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
                      {m?.mapLayers.letters[selectedLayerDetails.type]}{' '}
                      {nf.format(
                        (layersSettings[selectedLayer]?.opacity ?? 1) * 100,
                      )}{' '}
                      %
                    </>
                  }
                >
                  {[...baseLayers, ...overlayLayers].map(
                    ({ type, icon }, i) => (
                      <Fragment key={type}>
                        {i === baseLayers.length && <Dropdown.Divider />}
                        <Dropdown.Item
                          eventKey={type}
                          active={type === selectedLayer}
                        >
                          {icon} {m?.mapLayers.letters[type]}
                          {overlayLetters.includes(type as any) && (
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
                    ),
                  )}
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

              {overlayLetters.includes(selectedLayer as any) && (
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
