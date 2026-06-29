import { RovasLink } from '@shared/components/RovasLink.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('it', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const it: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Acquista crediti',
  amount: 'Crediti',
  credits: 'crediti',
  buy: 'Acquista',
  payWithChrons: 'Paga con i Chron',
  chronsHint: (
    <>
      Se desideri ottenere crediti per il lavoro di volontariato segnalato in{' '}
      <RovasLink>Rovas</RovasLink>, scegli di pagare con i Chron.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>Il tuo credito è stato aumentato di {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Hai {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="crediti"
          help="Puoi usare i crediti per [l'esportazione delle mappe offline]."
        />
      ) : (
        'crediti'
      )}
      .
    </>
  ),
};

export default it;
