import { RovasLink } from '@shared/components/RovasLink.js';
import type { PremiumMessages } from './PremiumMessages.js';

const en: PremiumMessages = {
  title: 'Get premium access',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> is an optional yearly subscription that
        enhances the app.
      </p>
      <p className="mb-1">
        For <b>8 €</b> per year you get:
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
};

export default en;
