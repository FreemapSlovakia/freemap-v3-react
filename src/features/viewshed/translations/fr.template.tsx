import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const fr: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Choisir sur la carte',
  locate: 'Visibilité depuis ma position',
  pickViewpointPrompt: 'Cliquez sur la carte à l’endroit d’où regarder',
  detail: 'Qualité / vitesse',
  details: {
    superfast: 'Minimale / la plus rapide',
    fast: 'Basse / rapide',
    standard: 'Standard',
    detailed: 'Détaillée / lente',
    finest: 'Maximale / la plus lente',
  },
  settings: 'Paramètres de visibilité',
  targetHeight: 'Hauteur de la cible',
  targetHeightHint:
    'La hauteur de ce que vous regardez — relevez-la pour voir d’où un pylône ou une personne sur une crête serait visible.',
  color: 'Couleur',
  strength: 'Intensité',
  strengthMeasured: 'Telle que mesurée',
  strengthHint:
    'La couche est teintée selon la part de sol que vous voyez : les surfaces vues presque par la tranche ressortent donc très pâles. L’augmenter relève l’extrémité pâle sans aplatir le reste.',
  minOpacity: 'Opacité minimale',
  minOpacityHint:
    'L’intensité du relief visible, même vu presque par la tranche. À 100 %, la couche n’est qu’un pochoir : visible ou non, rien entre les deux.',
  update: 'Actualiser',
  outdated: 'La couche montre le point de vue précédent.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'En attente du moteur de rendu…'
      : ahead === 1
        ? 'En attente — un calcul passe avant.'
        : `En attente — ${ahead} calculs passent avant.`,
  errors: {
    offline:
      'La visibilité est calculée par le serveur, et vous êtes hors ligne.',
    unreachable:
      'Le service de rendu n’a pas pu être joint. Il est peut-être hors service, ou quelque chose entre vous et lui bloque la requête.',
    busy: 'Le service de rendu est indisponible pour le moment. Réessayez dans un instant.',
    tooMany:
      'Trop de calculs ont été effectués récemment. Réessayez plus tard ou passez au premium.',
    noData:
      'Il n’y a pas de données de relief pour ce point de vue. Essayez de cliquer ailleurs.',
    failed: 'La visibilité n’a pas pu être calculée.',
  },
};

export default fr;
