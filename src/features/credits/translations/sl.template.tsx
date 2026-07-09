import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import type { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('sl', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const sl: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Kupi kredite',
  amount: 'Krediti',
  credits: 'kreditov',
  buy: 'Kupi',
  payWithChrons: 'Plačaj s chroni',
  chronsHint: (
    <>
      Če želite pridobiti kredite za prostovoljno delo, prijavljeno v{' '}
      <RovasLink>Rovasu</RovasLink>, izberite plačilo s chroni.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>Vaš kredit se je povečal za {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Imate {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="kreditov"
          help="Kredite lahko uporabite za [izvoz zemljevidov brez povezave]."
        />
      ) : (
        'kreditov'
      )}
      .
    </>
  ),
};

export default sl;
