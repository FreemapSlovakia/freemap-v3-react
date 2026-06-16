import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('pl', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const pl: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Kup kredyty',
  amount: 'Kredyty',
  credits: 'kredytów',
  buy: 'Kup',
  payWithChrons: 'Zapłać chronami',
  chronsHint: 'Wolisz chrony? Zapłać ze swojego salda Rovas zamiast kartą.',
  purchase: {
    success: ({ amount }) => (
      <>Twój kredyt został zwiększony o {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Masz {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="kredytów"
          help="Możesz użyć kredytów do [eksport map offline]."
        />
      ) : (
        'kredytów'
      )}
      .
    </>
  ),
};

export default pl;
