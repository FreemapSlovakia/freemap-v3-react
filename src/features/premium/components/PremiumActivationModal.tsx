import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  PREMIUM_NEW_PRICE_EUR,
  PREMIUM_PRICE_EUR,
  PREMIUM_PRICE_INCREASE_AT,
} from '@shared/premiumPricing.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import {
  FaChevronLeft,
  FaGem,
  FaRegGem,
  FaStopwatch,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useDtmCountryNames } from '../hooks/useDtmCountryNames.js';
import {
  canSwitchToSubscription,
  hasSubscription,
  isPremium,
  subscriptionAutoRenews,
} from '../premium.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';
import { PriceComparison } from './PriceComparison.js';

type Props = { show: boolean };

export default function PremiumActivationModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const prm = usePremiumMessages();

  const dtmCountries = useDtmCountryNames();

  // A one-time year bought during the price lock is the strictly worse deal, so
  // that choice is confirmed before it is acted on.
  const [confirmingOnce, setConfirmingOnce] = useState(false);

  // Every open starts at the price list. Resetting on open rather than on close
  // keeps the confirmation on screen through the fade-out, and survives a reopen
  // during it — the modal outlives its own closing animation.
  useEffect(() => {
    if (show) {
      setConfirmingOnce(false);
    }
  }, [show]);

  useDocumentTitle(
    show ? (confirmingOnce ? prm?.payOnceConfirmTitle : prm?.title) : undefined,
  );

  // Nothing is sold to a live subscriber: a second subscription is refused by
  // the backend, and another one-time year or a chrons payment would only pay
  // ahead for what renews by itself. They get their status and a way out.
  const subscribed = useAppSelector((state) =>
    hasSubscription(state.auth.user),
  );

  const autoRenews = useAppSelector((state) =>
    subscriptionAutoRenews(state.auth.user),
  );

  // Someone holding a one-time year is told to switch rather than to buy; the
  // info bar sends them to `PremiumSwitchModal`, this is the same offer for
  // whoever lands here instead.
  const switching = useAppSelector((state) =>
    canSwitchToSubscription(state.auth.user),
  );

  const premiumExpiration = useAppSelector((state) =>
    isPremium(state.auth.user) ? state.auth.user?.premiumExpiration : undefined,
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const increaseDate = dateFormat.format(PREMIUM_PRICE_INCREASE_AT);

  // Only someone the price lock can still help loses by paying once: whoever has
  // no premium, and whoever can move their one-time year into a subscription.
  // Past that (premium reaching beyond the trial the switch needs) a
  // subscription would start charging over premium they already hold, so buying
  // another year outright is a fair choice and isn't argued with.
  const priceLockApplies = !premiumExpiration || switching;

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
          <FaGem className="text-info" />{' '}
          {confirmingOnce ? prm?.payOnceConfirmTitle : prm?.title}
        </Modal.Title>
      </Modal.Header>

      {confirmingOnce ? (
        <>
          <Modal.Body>
            <p className="mb-0">
              {prm?.payOnceConfirmBody({
                date: increaseDate,
                oldPrice: PREMIUM_PRICE_EUR,
                newPrice: PREMIUM_NEW_PRICE_EUR,
              })}
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                trackMatomo([
                  'trackEvent',
                  'Purchase',
                  'confirmPayOnce',
                  'subscribed',
                ]);

                buy({ recurring: true });
              }}
            >
              <FaGem /> {prm?.payOnceConfirmSubscribe}
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                trackMatomo([
                  'trackEvent',
                  'Purchase',
                  'confirmPayOnce',
                  'continued',
                ]);

                buy({ recurring: false });
              }}
            >
              <FaRegGem /> {prm?.payOnceConfirmContinue}
            </Button>

            <Button variant="dark" onClick={() => setConfirmingOnce(false)}>
              <FaChevronLeft /> {m?.general.back}
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Body>
            {prm?.commonHeader(PREMIUM_PRICE_EUR, dtmCountries)}

            {premiumExpiration && !switching ? (
              <Alert variant="info" className="mt-3 mb-0">
                {autoRenews
                  ? prm?.youArePremiumRenews
                  : prm?.youArePremium(dateFormat.format(premiumExpiration))}
              </Alert>
            ) : switching ? (
              <Alert variant="warning" className="mt-3 mb-0">
                {prm?.priceIncreaseSwitch({
                  date: increaseDate,
                  oldPrice: PREMIUM_PRICE_EUR,
                  newPrice: PREMIUM_NEW_PRICE_EUR,
                })}
              </Alert>
            ) : (
              // Not an alert box: the thing to compare is the offer itself, and
              // a yellow notice by the price list reads as boilerplate to skip.
              <div className="mt-3 p-3 border rounded">
                <p className="fw-semibold mb-2">
                  {prm?.priceIncreaseHeading({
                    date: increaseDate,
                    newPrice: PREMIUM_NEW_PRICE_EUR,
                  })}
                </p>

                <PriceComparison
                  columns={[prm?.compareNow, prm?.compareNextYear]}
                  rows={[
                    {
                      label: prm?.compareSubscription,
                      values: [
                        `${PREMIUM_PRICE_EUR}\xa0€`,
                        `${PREMIUM_PRICE_EUR}\xa0€`,
                      ],
                      recommended: true,
                    },
                    {
                      label: prm?.compareOnce,
                      values: [
                        `${PREMIUM_PRICE_EUR}\xa0€`,
                        `${PREMIUM_NEW_PRICE_EUR}\xa0€`,
                      ],
                    },
                  ]}
                />

                <p className="mt-3 mb-0 text-body-secondary">
                  {prm?.subscriptionReassurance({
                    oldPrice: PREMIUM_PRICE_EUR,
                  })}
                </p>
              </div>
            )}

            {!subscribed && (
              <>
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
                  onClick={() => buy({ recurring: true })}
                >
                  <FaGem /> {prm?.paySubscription}
                </Button>

                <Dropdown.Toggle split variant="primary" id="premium-buy" />

                <FmDropdownMenu renderOnMount>
                  <Dropdown.Item
                    as="button"
                    className={priceLockApplies ? undefined : 'text-nowrap'}
                    onClick={() => {
                      if (!priceLockApplies) {
                        buy({ recurring: false });

                        return;
                      }

                      trackMatomo([
                        'trackEvent',
                        'Purchase',
                        'confirmPayOnce',
                        'shown',
                      ]);

                      setConfirmingOnce(true);
                    }}
                  >
                    <FaRegGem />{' '}
                    {priceLockApplies
                      ? prm?.payOnceWithPrices({
                          oldPrice: PREMIUM_PRICE_EUR,
                          newPrice: PREMIUM_NEW_PRICE_EUR,
                        })
                      : prm?.payOnce}
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
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
        </>
      )}
    </Modal>
  );
}
