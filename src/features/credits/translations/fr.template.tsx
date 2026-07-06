import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { CreditsText } from '../components/CreditsText.js';
import type { CreditsMessages } from './CreditsMessages.js';

const nf00 = new Intl.NumberFormat('fr', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fr: DeepPartialWithRequiredObjects<CreditsMessages> = {
  buyCredits: 'Acheter des crédits',
  amount: 'Crédits',
  credits: 'crédits',
  buy: 'Acheter',
  payWithChrons: 'Payer avec des Chrons',
  chronsHint: (
    <>
      Si vous souhaitez obtenir des crédits pour du travail bénévole déclaré
      dans <RovasLink>Rovas</RovasLink>, choisissez de payer avec des Chrons.
    </>
  ),
  purchase: {
    success: ({ amount }) => (
      <>Votre crédit a été augmenté de {nf00.format(amount)}.</>
    ),
  },
  youHaveCredits: (amount, explainCredits) => (
    <>
      Vous avez {amount}{' '}
      {explainCredits ? (
        <CreditsText
          credits="crédits"
          help="Vous pouvez utiliser les crédits pour l’[export de cartes hors ligne]."
        />
      ) : (
        'crédits'
      )}
      .
    </>
  ),
};

export default fr;
