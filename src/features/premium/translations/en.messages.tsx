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
        <li>higher panorama resolution</li>
        <li>higher viewshed resolution</li>
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
  higherDetail: 'Finer detail available with premium access.',
  alreadyPremium: 'You already have premium access.',
  alreadySubscribed: 'You already have an active subscription.',
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
  subscriptionReassurance: ({ price }) =>
    `The price stays ${price}\xa0€ a year for as long as the subscription is active. You can cancel it at any time — premium access then runs to the end of the paid year.`,
};

export default en;
