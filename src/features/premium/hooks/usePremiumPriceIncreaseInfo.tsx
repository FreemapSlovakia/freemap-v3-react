import { ShowModalLink } from '@shared/components/ShowModalLink.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  PREMIUM_NEW_PRICE_EUR,
  PREMIUM_PRICE_EUR,
  PREMIUM_PRICE_INCREASE_AT,
} from '@shared/premiumPricing.js';
import { type ReactNode, useState } from 'react';
import { Anchor } from 'react-bootstrap';
import { canSwitchToSubscription } from '../premium.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

/**
 * Info bar announcing the upcoming premium price increase, or `null` when there
 * is nothing to show yet (its messages load in a separate chunk) — the caller
 * uses that to keep the bar itself out of the page.
 *
 * The full sentence doesn't fit a phone, so up to `md` it shrinks to a headline
 * that expands to the full text on demand.
 */
export function usePremiumPriceIncreaseInfo(): ReactNode {
  const prm = usePremiumMessages();

  const [expanded, setExpanded] = useState(false);

  // Someone holding a one-time year is told to switch instead of to buy.
  const switching = useAppSelector((state) =>
    canSwitchToSubscription(state.auth.user),
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shortDateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  if (!prm) {
    return null;
  }

  const params = {
    date: dateFormat.format(PREMIUM_PRICE_INCREASE_AT),
    oldPrice: PREMIUM_PRICE_EUR,
    newPrice: PREMIUM_NEW_PRICE_EUR,
  };

  const full = (
    <>
      {switching
        ? prm.priceIncreaseSwitch(params)
        : prm.priceIncreaseShort(params)}{' '}
      <ShowModalLink modal={switching ? 'premium-switch' : 'premium'}>
        {switching ? prm.switchTitle : prm.becomePremium}
        {'\xa0›'}
      </ShowModalLink>
    </>
  );

  return expanded ? (
    full
  ) : (
    <>
      <span className="d-md-none">
        {prm.priceIncreaseMini({
          date: shortDateFormat.format(PREMIUM_PRICE_INCREASE_AT),
          newPrice: PREMIUM_NEW_PRICE_EUR,
        })}{' '}
        <Anchor onClick={() => setExpanded(true)}>
          {prm.priceIncreaseMore}
        </Anchor>
      </span>

      <span className="d-none d-md-inline">{full}</span>
    </>
  );
}
