import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { PREMIUM_PRICE_EUR } from '@shared/premiumPricing.js';
import type { ReactElement } from 'react';
import { Alert, Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { FaGem, FaRegGem, FaStopwatch, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useDtmCountryNames } from '../hooks/useDtmCountryNames.js';
import {
  hasSubscription,
  isPremium,
  subscriptionAutoRenews,
} from '../premium.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

type Props = { show: boolean };

export default function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const online = useOnline();

  const prm = usePremiumMessages();

  const dtmCountries = useDtmCountryNames();

  useDocumentTitle(show ? prm?.title : undefined);

  // Nothing is sold to a live subscriber: a second subscription is refused by
  // the backend, and another one-time year or a chrons payment would only pay
  // ahead for what renews by itself. They get their status and a way out.
  const subscribed = useAppSelector((state) =>
    hasSubscription(state.auth.user),
  );

  const autoRenews = useAppSelector((state) =>
    subscriptionAutoRenews(state.auth.user),
  );

  const premiumExpiration = useAppSelector((state) =>
    isPremium(state.auth.user) ? state.auth.user?.premiumExpiration : undefined,
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function close() {
    dispatch(setActiveModal(null));
  }

  function buy(opts: { recurring?: boolean; via?: 'rovas' } = {}) {
    close();

    dispatch(purchase({ type: 'premium', ...opts }));
  }

  return (
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaGem /> {prm?.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        {prm?.commonHeader(PREMIUM_PRICE_EUR, dtmCountries)}

        {premiumExpiration && (
          <Alert variant="info" className="mt-3 mb-0">
            {autoRenews
              ? prm?.youArePremiumRenews
              : prm?.youArePremium(dateFormat.format(premiumExpiration))}
          </Alert>
        )}

        {!subscribed && (
          <>
            {/* Only where it can't be read as describing premium already held. */}
            {!premiumExpiration && (
              <p className="mt-3 mb-0 text-body-secondary">
                {prm?.subscriptionReassurance({ price: PREMIUM_PRICE_EUR })}
              </p>
            )}

            <hr />

            <p className="mb-0 text-body-secondary">{prm?.chronsHint}</p>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {!subscribed && (
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              disabled={!online}
              onClick={() => buy({ recurring: true })}
            >
              <FaGem /> {prm?.paySubscription}
            </Button>

            <Dropdown.Toggle
              split
              variant="primary"
              id="premium-buy"
              disabled={!online}
            />

            <FmDropdownMenu renderOnMount>
              <Dropdown.Item
                as="button"
                disabled={!online}
                className="text-nowrap"
                onClick={() => buy({ recurring: false })}
              >
                <FaRegGem /> {prm?.payOnce}
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
                disabled={!online}
                className="text-nowrap"
                onClick={() => buy({ via: 'rovas' })}
              >
                <FaStopwatch /> {prm?.payWithChrons}
              </Dropdown.Item>
            </FmDropdownMenu>
          </Dropdown>
        )}

        <Button variant="dark" onClick={close}>
          <FaTimes /> {subscribed ? m?.general.close : m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
