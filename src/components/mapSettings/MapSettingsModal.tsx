import { FormEvent, ReactElement, useCallback, useState } from 'react';
import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { saveSettings, setActiveModal } from '../../actions/mainActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { CustomMapsSettings } from './CustomMapsSettings.js';
import { MapLayersSettings } from './MapLayersSettings.js';

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

  const initialCustomLayers = useAppSelector((state) => state.map.customLayers);

  const [customLayers, setCustomLayers] = useState(initialCustomLayers);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      dispatch(
        saveSettings({
          settings: {
            layersSettings,
            customLayers,
          },
        }),
      );
    },
    [customLayers, dispatch, layersSettings],
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
                <MapLayersSettings
                  layersSettings={layersSettings}
                  setLayersSettings={setLayersSettings}
                  customLayers={customLayers}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="customMaps">
              <Accordion.Header>{m?.mapLayers.customMaps}</Accordion.Header>

              <Accordion.Body>
                <CustomMapsSettings
                  value={customLayers}
                  onChange={setCustomLayers}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            disabled={
              layersSettings === initLayersSettings &&
              customLayers === initialCustomLayers
            }
          >
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
