import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  PREMIUM_NEW_PRICE_EUR,
  PREMIUM_PRICE_EUR,
  PREMIUM_PRICE_INCREASE_AT,
} from '@shared/premiumPricing.js';
import { type ReactElement, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaGem, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { canSwitchToSubscription } from '../premium.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';
import { PriceComparison } from './PriceComparison.js';

type Props = { show: boolean };

/**
 * Offers a user holding a one-time year the switch to a subscription while the
 * current price lasts. Temporary — goes away with the price increase (see
 * TODO.md), which is why it is a modal of its own rather than another branch of
 * the purchase modal.
 *
 * Only that user can see it: anyone else following the link (already
 * subscribed, no premium at all) is sent to the purchase modal, which says
 * something true for them.
 */
export default function PremiumSwitchModal({
  show,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const online = useOnline();

  const prm = usePremiumMessages();

  useDocumentTitle(show ? prm?.switchTitle : undefined);

  const eligible = useAppSelector((state) =>
    canSwitchToSubscription(state.auth.user),
  );

  // A cached session is only trustworthy once `/auth/validate` has answered;
  // until then an eligible user still looks premium-less and would be sent
  // away. Nothing is pending for a visitor who isn't logged in at all — there
  // `validated` stays false forever.
  const resolving = useAppSelector(
    (state) => Boolean(state.auth.user) && !state.auth.validated,
  );

  const premiumExpiration = useAppSelector(
    (state) => state.auth.user?.premiumExpiration,
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (show && !resolving && !eligible) {
      dispatch(setActiveModal({ type: 'premium' }));
    }
  }, [show, resolving, eligible, dispatch]);

  function close() {
    dispatch(setActiveModal(null));
  }

  if (!eligible || !premiumExpiration) {
    return null;
  }

  const expiration = dateFormat.format(premiumExpiration);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaGem className="text-info" /> {prm?.switchTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        <p>{prm?.switchStatus({ expiration })}</p>

        <p className="fw-semibold mb-2">
          {prm?.priceIncreaseHeading({
            date: dateFormat.format(PREMIUM_PRICE_INCREASE_AT),
            newPrice: PREMIUM_NEW_PRICE_EUR,
          })}
        </p>

        <PriceComparison
          columns={[prm?.compareNextYear]}
          rows={[
            {
              label: prm?.switchAction,
              values: [`${PREMIUM_PRICE_EUR}\xa0€`],
              recommended: true,
            },
            {
              label: prm?.compareNoSwitch,
              values: [`${PREMIUM_NEW_PRICE_EUR}\xa0€`],
            },
          ]}
        />

        <p className="mt-3 mb-2 text-body-secondary">
          {prm?.subscriptionReassurance({ oldPrice: PREMIUM_PRICE_EUR })}
        </p>

        <p className="mb-0 text-body-secondary">
          {prm?.switchNoDoubleCharge({ expiration })}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          disabled={!online}
          onClick={() => {
            close();

            dispatch(purchase({ type: 'premium', recurring: true }));
          }}
        >
          <FaGem /> {prm?.switchAction}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
