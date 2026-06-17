import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { FaGem, FaRegGem, FaStopwatch, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

type Props = { show: boolean };

export default function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const prm = usePremiumMessages();

  useDocumentTitle(show ? prm?.title : undefined);

  function close() {
    dispatch(setActiveModal(null));
  }

  function buy(opts: { recurring?: boolean; via?: 'rovas' } = {}) {
    dispatch(setActiveModal(null));

    dispatch(purchase({ type: 'premium', ...opts }));
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

        <hr />

        <p className="mb-0 text-body-secondary">{prm?.chronsHint}</p>
      </Modal.Body>

      <Modal.Footer>
        <Dropdown as={ButtonGroup}>
          <Button variant="primary" onClick={() => buy({ recurring: true })}>
            <FaGem /> {prm?.paySubscription}
          </Button>

          <Dropdown.Toggle split variant="primary" id="premium-buy" />

          <Dropdown.Menu renderOnMount popperConfig={{ strategy: 'fixed' }}>
            <Dropdown.Item
              className="text-nowrap"
              onClick={() => buy({ recurring: false })}
            >
              <FaRegGem /> {prm?.payOnce}
            </Dropdown.Item>

            <Dropdown.Item
              className="text-nowrap"
              onClick={() => buy({ via: 'rovas' })}
            >
              <FaStopwatch /> {prm?.payWithChrons}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
