import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const fr: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Obtenir l’accès premium',
  commonHeader: (
    <>
      <p>
        <strong>Freemap Premium</strong> est un abonnement annuel facultatif qui
        enrichit l’application.
      </p>
      <p className="mb-1">
        Pour <b>8 €</b> par an, vous obtenez :
      </p>
      <ul>
        <li>la suppression de la bannière publicitaire</li>
        <li
          className="text-decoration-underline"
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
  premiumUser: 'Utilisateur avec accès premium',
  payOnce: 'Payer une fois pour un an',
  paySubscription: 'Abonnement annuel (renouvellement automatique)',
  payWithChrons: 'Payer avec des Chrons',
  chronsHint: (
    <>
      Si vous souhaitez obtenir l’accès premium pour du travail bénévole déclaré
      dans <RovasLink>Rovas</RovasLink>, choisissez de payer avec des Chrons.
    </>
  ),
};

export default fr;
