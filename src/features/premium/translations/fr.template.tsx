import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const fr: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Obtenir l’accès premium',
  commonHeader: (price, dtmCountries) => (
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
        <li>
          <HintTooltip hint="ombrage détaillé en haute résolution de la Slovaquie et de la Tchéquie, niveaux de zoom les plus élevés de la carte Outdoor, niveaux de zoom les plus élevés des orthophotos de la Slovaquie et de la Tchéquie, diverses cartes basées sur WMS">
            des couches cartographiques premium
          </HintTooltip>
        </li>
        <li>des photos premium</li>
        <li>un calcul d’itinéraire multimodal</li>
        <li>l’optimisation de l’ordre des points de l’itinéraire</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            des données d’altitude en haute résolution (nombreux pays européens)
          </HintTooltip>
        </li>
        <li>un historique plus long du radar météo et sa prévision</li>
        <li>
          la coloration des itinéraires et des traces (certains modes sont
          réservés au premium)
        </li>
      </ul>
      <p className="mb-0">Freemap reste gratuit et ouvert.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Angleterre' },
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
  payOnceWithPrices: ({ oldPrice, newPrice }) =>
    `Payer une fois pour un an — ${oldPrice}\xa0€ ; prix l’an prochain ${newPrice}\xa0€`,
  paySubscription: 'Abonnement annuel (renouvellement automatique)',
  payWithChrons: 'Payer avec des Chrons',
  chronsHint: (
    <>
      Si vous souhaitez obtenir l’accès premium pour du travail bénévole déclaré
      dans <RovasLink>Rovas</RovasLink>, choisissez de payer avec des Chrons.
    </>
  ),
  priceIncreaseHeading: ({ date, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an.`,
  compareNow: 'Maintenant',
  compareNextYear: 'Prix l’an prochain',
  compareSubscription: 'Abonnement annuel',
  compareOnce: 'Achat unique',
  compareNoSwitch: 'Sans changement',
  subscriptionReassurance: ({ oldPrice }) =>
    `Le prix de ${oldPrice}\xa0€ par an vous reste acquis tant que l’abonnement est actif. Vous pouvez le résilier à tout moment — l’accès premium court alors jusqu’à la fin de l’année payée.`,
  payOnceConfirmTitle: 'Cela ne conserve pas le prix actuel',
  payOnceConfirmBody: ({ date, oldPrice, newPrice }) =>
    `Un achat unique couvre un an pour ${oldPrice}\xa0€. Le suivant sera au prix en vigueur à ce moment-là — ${newPrice}\xa0€ par an à partir du ${date}. Un abonnement souscrit maintenant conserve le prix de ${oldPrice}\xa0€ par an tant qu’il est actif, et vous pouvez le résilier à tout moment.`,
  payOnceConfirmSubscribe: 'S’abonner plutôt',
  payOnceConfirmContinue: 'Payer une fois quand même',
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûtera ${newPrice}\xa0€ par an. Si vous vous abonnez avant, le prix de ${oldPrice}\xa0€ par an vous reste acquis tant que l’abonnement est actif.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `À partir du ${date}, l’accès premium coûte ${newPrice}\xa0€ par an. Si vous passez à un abonnement avant, votre prix reste à ${oldPrice}\xa0€ — rien n’est prélevé avant la fin de l’année déjà payée.`,
  switchTitle: 'Conservez votre prix actuel',
  switchStatus: ({ expiration }) =>
    `Vous avez l’accès premium jusqu’au ${expiration} — ce n’est pas un abonnement.`,
  switchNoDoubleCharge: ({ expiration }) =>
    `Vous ne perdez rien en changeant maintenant : l’abonnement commence par une période gratuite jusqu’au ${expiration}, et le premier prélèvement n’a lieu qu’à ce moment-là.`,
  switchAction: 'Passer à l’abonnement annuel',
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium à ${newPrice}\xa0€ par an à partir du ${date}.`,
  priceIncreaseMore: 'plus…',
  youArePremiumRenews: (
    <>
      Vous avez l’accès premium. Votre abonnement se renouvelle automatiquement.
    </>
  ),
};

export default fr;
