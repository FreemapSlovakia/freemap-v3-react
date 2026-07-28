import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const fr: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Obtenir l’accès premium',
  commonHeader: (price) => (
    <>
      <p>
        <strong>Freemap Premium</strong> est un abonnement annuel facultatif qui
        enrichit l’application.
      </p>
      <p className="mb-1">
        Pour <b>{price} €</b> par an, vous obtenez :
      </p>
      <ul>
        <li>la suppression de la bannière publicitaire</li>
        <li
          className="text-decoration-underline fm-cursor-help"
          title="ombrage détaillé en haute résolution de la Slovaquie et de la Tchéquie, niveaux de zoom les plus élevés de la carte Outdoor, niveaux de zoom les plus élevés des orthophotos de la Slovaquie et de la Tchéquie, diverses cartes basées sur WMS"
        >
          des couches cartographiques premium
        </li>
        <li>des photos premium</li>
        <li>un calcul d’itinéraire multimodal</li>
        <li>
          des données d’altitude en haute résolution (nombreux pays européens)
        </li>
      </ul>
      <p className="mb-0">Freemap reste gratuit et ouvert.</p>
    </>
  ),
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Comment ça marche</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Étape 1</span> - connectez-vous ou créez
          un compte Freemap gratuit (ci-dessous).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">Étape 2</span> - vous serez redirigé
          pour finaliser le paiement.
        </p>
      </div>
    </>
  ),
  success: 'Félicitations, vous avez obtenu l’accès premium !',
  becomePremium: 'Obtenir l’accès premium',
  youArePremium: (date) => (
    <>
      Vous avez l’accès premium jusqu’au <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Disponible uniquement avec l’accès premium.',
  noPremium: 'Vous n’avez pas d’accès premium.',
  clickToActivate: 'Cliquez pour activer.',
  higherPrecisionElevation:
    'Des données d’altitude plus précises sont disponibles avec l’accès premium.',
  alreadyPremium: 'Vous avez déjà l’accès premium.',
  alreadySubscribed: 'Vous avez déjà un abonnement actif.',
  premiumUser: 'Utilisateur avec accès premium',
  payOnce: 'Payer une fois pour un an',
  paySubscription: 'Abonnement annuel (renouvellement automatique)',
  subscribe: 'S’abonner',
  payWithChrons: 'Payer avec des Chrons',
  chronsHint: (
    <>
      Si vous souhaitez obtenir l’accès premium pour du travail bénévole déclaré
      dans <RovasLink>Rovas</RovasLink>, choisissez de payer avec des Chrons.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an. Si vous vous abonnez avant, le prix de ${oldPrice}\xa0€ par an vous reste acquis tant que l’abonnement est actif. Un achat unique coûte ${oldPrice}\xa0€ pour cette seule année — la suivante sera au prix en vigueur à ce moment-là.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an. Si vous vous abonnez avant, le prix de ${oldPrice}\xa0€ par an vous reste acquis tant que l’abonnement est actif.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an. Si vous passez à un abonnement annuel avant cette date, le prix annuel de ${oldPrice}\xa0€ vous reste acquis tant que l’abonnement est actif. Le prélèvement ne commence qu’à l’expiration de l’année déjà payée, vous ne payez donc rien deux fois.`,
  switchTitle: 'Conservez votre prix actuel',
  switchStatus: ({ expiration }) =>
    `Vous avez l’accès premium jusqu’au ${expiration} — ce n’est pas un abonnement.`,
  switchOffer: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an. Si vous passez à un abonnement annuel avant cette date, le prix annuel de ${oldPrice}\xa0€ vous reste acquis tant que l’abonnement est actif.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Vous ne perdez rien en changeant maintenant : l’abonnement commence par une période gratuite jusqu’au ${expiration}, et le premier prélèvement n’a lieu qu’à ce moment-là.`,
  switchAction: 'Passer à l’abonnement annuel',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium à ${newPrice}\xa0€ par an à partir du ${date}.`,
  priceIncreaseMore: 'plus…',
};

export default fr;
