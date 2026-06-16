import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaGem, FaRedo, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

type Props = { show: boolean };

export default function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const prm = usePremiumMessages();

  const polarEnabled = useAppSelector((state) => state.auth.user?.polarEnabled);

  useDocumentTitle(show ? prm?.title : undefined);

  function close() {
    dispatch(setActiveModal(null));
  }

  function buy(recurring?: boolean) {
    dispatch(setActiveModal(null));

    dispatch(purchase({ type: 'premium', recurring }));
  }

  return (
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaGem className="text-info" /> {prm?.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {prm?.commonHeader}

        {polarEnabled && (
          <p className="mt-3 mb-0 text-body-secondary">{prm?.payWhatYouWant}</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        {polarEnabled ? (
          <>
            <Button variant="primary" onClick={() => buy(true)}>
              <FaRedo /> {prm?.paySubscription}
            </Button>

            <Button variant="outline-primary" onClick={() => buy(false)}>
              <FaGem /> {prm?.payOnce}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => buy()}>
            <FaGem /> {prm?.continue}
          </Button>
        )}

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
