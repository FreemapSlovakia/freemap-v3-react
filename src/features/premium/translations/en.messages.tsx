import { RovasLink } from '@shared/components/RovasLink.js';
import type { PremiumMessages } from './PremiumMessages.js';

const en: PremiumMessages = {
  title: 'Get premium access',
  commonHeader: (price) => (
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
        <li
          className="text-decoration-underline"
          title="hi-res detailed shading of Slovakia and Czechia, highest zoom levels of Outdoor Map, highest zoom levels of ortophoto maps of Slovakia and Czechia, various WMS-based maps"
        >
          premium map layers
        </li>
        <li>premium photos</li>
        <li>multimodal routing</li>
        <li>high-resolution elevation data (many European countries)</li>
      </ul>
      <p className="mb-0">Freemap stays free and open.</p>
    </>
  ),
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
  premiumOnly: 'Only available with premium access.',
  noPremium: 'You have no premium access.',
  clickToActivate: 'Click to activate.',
  higherPrecisionElevation:
    'Higher-precision elevation data available with premium access.',
  alreadyPremium: 'You already have premium access.',
  premiumUser: 'User with premium access',
  payOnce: 'Pay once for one year',
  paySubscription: 'Subscribe yearly (auto-renews)',
  payWithChrons: 'Pay with Chrons',
  chronsHint: (
    <>
      If you want to get premium access for volunteer work reported in{' '}
      <RovasLink>Rovas</RovasLink>, choose to pay with Chrons.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `On ${date} the price of premium access rises from ${oldPrice}\xa0€ to ${newPrice}\xa0€ per year. Subscribe before that date and you keep the ${oldPrice}\xa0€ price for as long as your subscription stays active. A one-time purchase costs ${oldPrice}\xa0€ for that one year only — the next one is at the price valid at the time.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `From ${date} premium access costs ${newPrice}\xa0€ a year. Subscribe before then for ${oldPrice}\xa0€ and keep that price for as long as your subscription stays active.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `From ${date} premium access costs ${newPrice}\xa0€ a year. Switch to a subscription before then and you keep the ${oldPrice}\xa0€ price for as long as it stays active — it starts charging only when the year you have already paid for runs out, so you pay nothing twice.`,
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium ${newPrice}\xa0€ a year from ${date}.`,
  priceIncreaseMore: 'more…',
  winbackOffer: ({ price, expiredAt }) =>
    `Your premium access expired on ${expiredAt}. As a former customer you can come back to the original price: an auto-renewing yearly subscription for ${price}\xa0€, kept for as long as it stays active. This offer is for you only and can be used once.`,
  winbackAccept: ({ price }) => `Subscribe for ${price}\xa0€ a year`,
};

export default en;
