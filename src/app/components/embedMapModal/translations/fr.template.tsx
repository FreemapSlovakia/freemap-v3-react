import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const fr: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Insérez le code HTML suivant dans votre page :',
  example: 'Le résultat ressemblera à ceci :',
  dimensions: 'Dimensions',
  height: 'Hauteur',
  width: 'Largeur',
  enableFeatures: 'Activer les fonctions',
  enableSearch: 'recherche',
  enableMapSwitch: 'changement de couche de la carte',
  enableLocateMe: 'me localiser',
};

export default fr;
