import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  ChangeEvent,
  ReactElement,
  SubmitEvent,
  useCallback,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default MapPreferencesModal;

export function MapPreferencesModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initialMaxZoom = useAppSelector((state) => String(state.map.maxZoom));

  const [maxZoom, setMaxZoom] = useState(initialMaxZoom);

  const invalidMaxZoom = isInvalidInt(maxZoom, false, 0, 99);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      const maxZoomValue = parseInt(maxZoom, 10);

      dispatch(
        saveSettings({
          settings: {
            maxZoom: isNaN(maxZoomValue) ? 20 : maxZoomValue,
          },
        }),
      );
    },
    [dispatch, maxZoom],
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
            <FaCog /> {m?.mapLayers.preferences}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
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
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            disabled={maxZoom === initialMaxZoom || invalidMaxZoom}
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
