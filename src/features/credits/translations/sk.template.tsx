import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('sk', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const sk: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Kúpiť kredity',
  amount: 'Kredity',
  credits: 'kreditov',
  buy: 'Kúpiť',
  payWithChrons: 'Zaplatiť chronmi',
  chronsHint:
    'Uprednostňujete chrony? Zaplaťte zo svojho zostatku v Rovase namiesto kartou.',
  purchase: {
    success: ({ amount }) => (
      <>Váš kredit bol navýšený o {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Máte {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="kreditov"
          help="Kredity môžete využiť na [export offline máp]."
        />
      ) : (
        'kreditov'
      )}
      .
    </>
  ),
};

export default sk;
