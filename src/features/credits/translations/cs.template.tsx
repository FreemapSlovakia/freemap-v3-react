import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('cs', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const cs: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Koupit kredity',
  amount: 'Kredity',
  credits: 'kreditů',
  buy: 'Koupit',
  payWithChrons: 'Zaplatit chrony',
  chronsHint:
    'Dáváte přednost chronům? Zaplaťte ze svého zůstatku v Rovasu místo kartou.',
  purchase: {
    success: ({ amount }) => (
      <>Váš kredit byl navýšen o {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Máte {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="kreditů"
          help="Kredity můžete využít ke [export offline map]."
        />
      ) : (
        'kreditů'
      )}
      .
    </>
  ),
};

export default cs;
