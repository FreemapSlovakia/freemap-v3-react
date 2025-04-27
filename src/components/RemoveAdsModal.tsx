import { ReactElement } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { SiAdblock } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import { removeAds, setActiveModal } from '../actions/mainActions.js';
import { useMessages } from '../l10nInjector.js';

type Props = { show: boolean };

export function RemoveAdsModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  function close() {
    dispatch(setActiveModal(null));
  }

  const renderPremiumInfo = () => {
    return (
      <>
        {m?.premium.commonHeader}
        {m?.premium.commonFooter}
      </>
    );
  };
  
  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <SiAdblock /> {m?.premium.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light">
        {renderPremiumInfo()}
      </Modal.Body>
      
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            dispatch(setActiveModal(null));

            dispatch(removeAds());
          }}
        >
          <SiAdblock /> {m?.premium.continue}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RemoveAdsModal;
