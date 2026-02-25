import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaGem, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { purchase, setActiveModal } from '../store/actions.js';

type Props = { show: boolean };

export function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  function close() {
    dispatch(setActiveModal(null));
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaGem /> {m?.premium.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {m?.premium.commonHeader}
        {m?.premium.commonFooter}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            dispatch(setActiveModal(null));

            dispatch(purchase({ type: 'premium' }));
          }}
        >
          <FaGem /> {m?.premium.continue}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PremiumActivationModal;
