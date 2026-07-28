import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  PREMIUM_PRICE_EUR,
  PREMIUM_PRICE_INCREASE_AT,
  PREMIUM_WINBACK_PRICE_EUR,
} from '@shared/premiumPricing.js';
import type { ReactElement } from 'react';
import { Alert, Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { FaGem, FaRegGem, FaStopwatch, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useWinbackOffer } from '../hooks/useWinbackOffer.js';
import { isPremiumWithoutSubscription } from '../premium.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

type Props = { show: boolean };

export default function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const prm = usePremiumMessages();

  useDocumentTitle(show ? prm?.title : undefined);

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  // Someone holding a one-time year is told to switch, not to buy: the
  // subscription starts charging only once that year runs out.
  const switching = useAppSelector((state) =>
    isPremiumWithoutSubscription(state.auth.user),
  );

  const winback = useWinbackOffer(show ? authToken : undefined);

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function close() {
    dispatch(setActiveModal(null));
  }

  // The backend gives an eligible user the win-back price on any yearly
  // subscription, so nothing about the offer has to be sent from here.
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
        {prm?.commonHeader(PREMIUM_PRICE_EUR)}

        <Alert variant="warning" className="mt-3 mb-0">
          {winback
            ? prm?.winbackOffer({
                price: PREMIUM_WINBACK_PRICE_EUR,
                expiredAt: dateFormat.format(new Date(winback.expiredAt)),
              })
            : (switching ? prm?.priceIncreaseSwitch : prm?.priceIncrease)?.({
                date: dateFormat.format(PREMIUM_PRICE_INCREASE_AT),
                oldPrice: PREMIUM_PRICE_EUR,
                newPrice: 15,
              })}
        </Alert>

        <hr />

        <p className="mb-0 text-body-secondary">{prm?.chronsHint}</p>
      </Modal.Body>

      <Modal.Footer>
        <Dropdown as={ButtonGroup}>
          <Button variant="primary" onClick={() => buy({ recurring: true })}>
            <FaGem />{' '}
            {winback
              ? prm?.winbackAccept({ price: PREMIUM_WINBACK_PRICE_EUR })
              : prm?.paySubscription}
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
