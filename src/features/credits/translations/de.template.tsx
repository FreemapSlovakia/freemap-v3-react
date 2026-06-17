import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('de', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const de: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Credits kaufen',
  amount: 'Credits',
  credits: 'Credits',
  buy: 'Kaufen',
  payWithChrons: 'Mit Chrons bezahlen',
  chronsHint: (
    <>
      Wenn Sie Premium-Zugang für in <RovasLink>Rovas</RovasLink> gemeldete
      ehrenamtliche Arbeit erhalten möchten, wählen Sie die Zahlung mit Chrons.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>Dein Guthaben wurde um {nf00.format(amount)} erhöht.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Sie haben {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="Credits"
          help="Sie können Credits verwenden, um [Export von Offline-Karten]."
        />
      ) : (
        'Credits'
      )}
      .
    </>
  ),
};

export default de;
