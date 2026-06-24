import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, SubmitEvent, useCallback, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { MapLayersSettings } from './MapLayersSettings.js';

type Props = { show: boolean };

export default function MapLayersConfigModal({ show }: Props): ReactElement {
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

  useDocumentTitle(show ? m?.mapLayers.configureLayers : undefined);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      dispatch(saveSettings({ settings: { layersSettings } }));
    },
    [dispatch, layersSettings],
  );

  return (
    <Modal show={show} onHide={close} scrollable>
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLayerGroup /> {m?.mapLayers.configureLayers}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
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

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
