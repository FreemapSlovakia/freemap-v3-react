import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasLink } from '@shared/components/RovasLink.js';
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
  chronsHint: (
    <>
      Pokud chcete získat prémiový přístup za dobrovolnickou práci nahlášenou v{' '}
      <RovasLink>Rováši</RovasLink>, zvolte platbu chrony.
    </>
  ),
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
