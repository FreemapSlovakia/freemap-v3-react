import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { MapLayersSettings } from './MapLayersSettings.js';

type Props = { show: boolean };

export default MapLayersConfigModal;

export function MapLayersConfigModal({ show }: Props): ReactElement {
  const initLayersSettings = useAppSelector(
    (state) => state.map.layersSettings,
  );

  const m = useMessages();

  const [layersSettings, setLayersSettings] = useState(initLayersSettings);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      dispatch(saveSettings({ settings: { layersSettings } }));
    },
    [dispatch, layersSettings],
  );

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLayerGroup /> {m?.mapLayers.configureLayers}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-body-tertiary">
          <MapLayersSettings
            layersSettings={layersSettings}
            setLayersSettings={setLayersSettings}
            customLayers={customLayerDefs}
            cachedMaps={cachedMaps}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            disabled={layersSettings === initLayersSettings}
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
