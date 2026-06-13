import { PremiumMessages } from './PremiumMessages.js';

const en: PremiumMessages = {
  title: 'Get premium access',
  commonHeader: (
    <>
      <p>
        <strong>Support the volunteers who create this map!</strong>
      </p>
      <p className="mb-1">
        For <b>8 hours</b> of your{' '}
        <a
          href="https://rovas.app/freemap-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          volunteer work
        </a>{' '}
        or <b>8 €</b> you will have a year of access with:
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
      </ul>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Procedure</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Step 1</span> - create an account here
          in Freemap (below)
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Step 2</span> - in the Rovas
          application, where we'll direct you after registration, send us the
          payment.
        </p>
      </div>
    </>
  ),
  continue: 'Continue',
  success: 'Congratulations, you have gained premium access!',
  becomePremium: 'Get premium access',
  youArePremium: (date) => (
    <>
      You have premium access until <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Only available with premium access.',
  alreadyPremium: 'You already have premium access.',
  premiumUser: 'User with premium access',
};

export default en;
