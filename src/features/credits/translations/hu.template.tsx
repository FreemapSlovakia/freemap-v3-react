import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import type { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('hu', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const hu: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Kredit vásárlása',
  amount: 'Kreditek',
  credits: 'kredit',
  buy: 'Vásárlás',
  payWithChrons: 'Fizetés chronnal',
  chronsHint: (
    <>
      Ha kreditet szeretne önkéntes munkáért, amelyet a{' '}
      <RovasLink>Rovasban</RovasLink> jelentett be, válassza a chronokkal
      történő fizetést.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>A kreditje {nf00.format(amount)} összeggel növekedett.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Van {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="kreditje"
          help="A krediteket felhasználhatja [offline térképek exportjára]."
        />
      ) : (
        'kreditje'
      )}
      .
    </>
  ),
};

export default hu;
