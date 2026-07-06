import { RovasLink } from '@shared/components/RovasLink.js';
import { CreditsText } from '../components/CreditsText.js';
import type { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('en', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const en: CreditsMessages = {
  buyCredits: 'Buy credits',
  amount: 'Credits',
  credits: 'credits',
  buy: 'Buy',
  payWithChrons: 'Pay with Chrons',
  chronsHint: (
    <>
      If you want to get credits for volunteer work reported in{' '}
      <RovasLink>Rovas</RovasLink>, choose to pay with Chrons.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>Your credit has been increased by {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      You have {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="credits"
          help="You can use credits to [offline maps export]."
        />
      ) : (
        'credits'
      )}
      .
    </>
  ),
};

export default en;
