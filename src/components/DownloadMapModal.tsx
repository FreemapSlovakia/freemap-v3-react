import { ReactElement, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useMessages } from '../l10nInjector.js';
import { CreditsAlert } from './CreditsAlert.js';

type Props = { show: boolean };

export default DownloadMapModal;

export function DownloadMapModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaDownload /> Download map{/* t */}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <CreditsAlert />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaDownload /> Download
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
