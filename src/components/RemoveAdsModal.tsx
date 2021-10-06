import { removeAds, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaTimes } from 'react-icons/fa';
import { SiAdblock } from 'react-icons/si';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function RemoveAdsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  function close() {
    dispatch(setActiveModal(null));
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <SiAdblock /> {m?.removeAds.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light">{m?.removeAds.info}</Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            dispatch(setActiveModal(null));
            dispatch(removeAds());
          }}
        >
          <SiAdblock /> {m?.removeAds.continue}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RemoveAdsModal;
