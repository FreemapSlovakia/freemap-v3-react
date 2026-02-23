import {
  ChangeEvent,
  SubmitEvent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { saveSettings, setActiveModal } from '../../../actions/mainActions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMessages } from '../../../l10nInjector.js';
import { isInvalidInt } from '../../../numberValidator.js';
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

  const initialCustomLayerDefs = useAppSelector(
    (state) => state.map.customLayers,
  );

  const [customLayerDefs, setCustomLayerDefs] = useState(
    initialCustomLayerDefs,
  );

  const initialMaxZoom = useAppSelector((state) => String(state.map.maxZoom));

  const [maxZoom, setMaxZoom] = useState(initialMaxZoom);

  const invalidMaxZoom = isInvalidInt(maxZoom, false, 0, 99);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      const maxZoomValue = parseInt(maxZoom, 10);

      dispatch(
        saveSettings({
          settings: {
            layersSettings,
            customLayers: customLayerDefs,
            maxZoom: isNaN(maxZoomValue) ? 20 : maxZoomValue,
          },
        }),
      );
    },
    [customLayerDefs, dispatch, layersSettings, maxZoom],
  );

  const handleMaxZoomChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxZoom(e.currentTarget.value);
    },
    [],
  );

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mapLayers.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-body-tertiary">
          <Accordion>
            <Accordion.Item eventKey="general">
              <Accordion.Header>
                {m?.mapLayers.generalSettings}
              </Accordion.Header>

              <Accordion.Body>
                <Form.Group controlId="maxZoom">
                  <Form.Label>{m?.mapLayers.maxZoom}</Form.Label>

                  <Form.Control
                    type="number"
                    min={0}
                    max={99}
                    value={maxZoom}
                    isInvalid={invalidMaxZoom}
                    onChange={handleMaxZoomChange}
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="menuAndToolbar">
              <Accordion.Header>{m?.mapLayers.layerSettings}</Accordion.Header>

              <Accordion.Body>
                <MapLayersSettings
                  layersSettings={layersSettings}
                  setLayersSettings={setLayersSettings}
                  customLayers={customLayerDefs}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="customMaps">
              <Accordion.Header>{m?.mapLayers.customMaps}</Accordion.Header>

              <Accordion.Body>
                <CustomMapsSettings
                  value={customLayerDefs}
                  onChange={setCustomLayerDefs}
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
              (layersSettings === initLayersSettings &&
                customLayerDefs === initialCustomLayerDefs &&
                maxZoom === initialMaxZoom) ||
              invalidMaxZoom
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
