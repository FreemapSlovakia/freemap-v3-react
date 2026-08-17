import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { PremiumMessages } from './PremiumMessages.js';

const en: PremiumMessages = {
  title: 'Get premium access',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        <strong>Freemap Premium</strong> is an optional yearly subscription that
        enhances the app.
      </p>
      <p className="mb-1">
        For <b>{price} €</b> per year you get:
      </p>
      <ul>
        <li>removed ad banner</li>
        <li>
          <HintTooltip hint="hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps">
            premium map layers
          </HintTooltip>
        </li>
        <li>premium photos</li>
        <li>multimodal routing</li>
        <li>optimizing the order of route points</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            high-resolution elevation data (many European countries)
          </HintTooltip>
        </li>
        <li>longer weather radar history and its forecast</li>
        <li>colorizing routes and tracks (some modes are premium only)</li>
      </ul>
      <p className="mb-0">Freemap stays free and open.</p>
    </>
  ),
  dtmAreaNames: { gb: 'England' },
  stepsForAnonymous: (
    <>
      <div className="fw-bold">How it works</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Step 1</span> - sign in or create a free
          Freemap account (below).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Step 2</span> - you'll be redirected to
          complete the payment.
        </p>
      </div>
    </>
  ),
  success: 'Congratulations, you have gained premium access!',
  becomePremium: 'Get premium access',
  youArePremium: (date) => (
    <>
      You have premium access until <b>{date}</b>.
    </>
  ),
  youArePremiumRenews: (
    <>You have premium access. Your subscription renews automatically.</>
  ),
  premiumOnly: 'Only available with premium access.',
  noPremium: 'You have no premium access.',
  clickToActivate: 'Click to activate.',
  higherPrecisionElevation:
    'Higher-precision elevation data available with premium access.',
  alreadyPremium: 'You already have premium access.',
  alreadySubscribed: 'You already have an active subscription.',
  premiumUser: 'User with premium access',
  payOnce: 'Pay once for one year',
  payOnceWithPrices: ({ oldPrice, newPrice }) =>
    `Pay once for one year — ${oldPrice}\xa0€; next year's price ${newPrice}\xa0€`,
  paySubscription: 'Subscribe yearly (auto-renews)',
  payWithChrons: 'Pay with Chrons',
  chronsHint: (
    <>
      If you want to get premium access for volunteer work reported in{' '}
      <RovasLink>Rovas</RovasLink>, choose to pay with Chrons.
    </>
  ),
  priceIncreaseHeading: ({ date, newPrice }) =>
    `From ${date} premium access will cost ${newPrice}\xa0€ a year.`,
  compareNow: 'Now',
  compareNextYear: 'Price next year',
  compareSubscription: 'Yearly subscription',
  compareOnce: 'One-time purchase',
  compareNoSwitch: 'Without switching',
  subscriptionReassurance: ({ oldPrice }) =>
    `The price stays ${oldPrice}\xa0€ a year for as long as the subscription is active. You can cancel it at any time — premium access then runs to the end of the paid year.`,
  payOnceConfirmTitle: "This doesn't keep the current price",
  payOnceConfirmBody: ({ date, oldPrice, newPrice }) =>
    `A one-time purchase covers one year for ${oldPrice}\xa0€. The next one is at the price valid at the time — ${newPrice}\xa0€ a year from ${date}. A subscription started now keeps ${oldPrice}\xa0€ a year for as long as it is active, and you can cancel it at any time.`,
  payOnceConfirmSubscribe: 'Subscribe instead',
  payOnceConfirmContinue: 'Pay once anyway',
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `From ${date} premium access will cost ${newPrice}\xa0€ a year. Subscribe before then and the ${oldPrice}\xa0€ a year price stays yours for as long as the subscription is active.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `From ${date} premium costs ${newPrice}\xa0€ a year. Switch to a subscription before then and your price stays ${oldPrice}\xa0€ — nothing is charged until the year you already paid for runs out.`,
  switchTitle: 'Keep your current price',
  switchStatus: ({ expiration }) =>
    `You have premium access until ${expiration} — it isn't a subscription.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `You lose nothing by switching now: the subscription starts as a free period until ${expiration}, and the first payment is taken only then.`,
  switchAction: 'Switch to a yearly subscription',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium ${newPrice}\xa0€ a year from ${date}.`,
  priceIncreaseMore: 'more…',
};

export default en;
