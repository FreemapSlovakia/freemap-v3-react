import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

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
      Ha prémium hozzáférést szeretnél önkéntes munkáért, amelyet a{' '}
      <RovasLink>Rovasban</RovasLink> jelentettél be, válaszd a chronokkal
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
          credits="kreditjeid"
          help="A krediteket felhasználhatod [offline térképek exportjára]."
        />
      ) : (
        'kredited'
      )}
      .
    </>
  ),
};

export default hu;
