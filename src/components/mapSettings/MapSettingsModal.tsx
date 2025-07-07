import { FormEvent, ReactElement, useCallback, useMemo, useState } from 'react';
import { Accordion, Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';
import { saveSettings, setActiveModal } from '../../actions/mainActions.js';
import { toastsAdd } from '../../actions/toastsActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { CustomLayerDef } from '../../mapDefinitions.js';
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

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const initialCustomLayersDef = useMemo(
    () => (customLayers.length ? JSON.stringify(customLayers, null, 2) : ''),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [customLayersDef] = useState(initialCustomLayersDef);

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
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="customMaps">
              <Accordion.Header>{m?.mapLayers.customMaps}</Accordion.Header>

              <Accordion.Body>
                <CustomMapsSettings />
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
