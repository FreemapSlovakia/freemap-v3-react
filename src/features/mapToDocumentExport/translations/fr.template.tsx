import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Randonnée, Vélo, Ski, Équitation';

const fr: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de l’exportation de la carte', err),
  cancelExportTitle: 'Annuler l’exportation',
  cancelExportQuestion: 'Voulez-vous vraiment annuler l’exportation en cours ?',
  discardExportTitle: 'Abandonner l’exportation',
  discardExportQuestion:
    'La carte exportée n’a pas encore été enregistrée. Voulez-vous l’abandonner ?',
  area: 'Zone à exporter',
  format: 'Format',
  layersTitle: 'Couches optionnelles',
  mapDataTitle: 'Données cartographiques',
  mapTitle: 'Carte',
  layers: {
    contours: 'Courbes de niveau',
    shading: 'Relief ombré',
    hikingTrails: 'Sentiers de randonnée',
    bicycleTrails: 'Pistes cyclables',
    skiTrails: 'Pistes de ski',
    horseTrails: 'Sentiers équestres',
    sacScale: 'Difficulté des sentiers',
    smoothness: 'État des routes',
    waymarking: 'Poteaux indicateurs',
  },
  baseMap: 'Carte de fond',
  noBaseMapHint:
    'Seules les couches sélectionnées sont dessinées, le reste est transparent.',
  omitTitle: 'Omettre',
  omit: {
    groundCover: 'Occupation du sol',
    buildings: 'Bâtiments',
  },
  omitHint:
    'Transparente là où quelque chose est omis — pour superposer une image aérienne, qui le montre mieux.',
  webpLossy: 'Compression avec perte',
  quality: 'Qualité',
  mapScale: 'Résolution de la carte',
  customLayerOrder: 'Placement des données cartographiques',
  orders: {
    natural: 'Naturel',
    topmost: 'Au premier plan',
  },
  decorations: 'Décorations de la carte',
  scaleBar: 'Échelle',
  northArrow: 'Flèche du nord',
  attribution: 'Attribution',
  northArrowLetter: 'N',
  glow: 'Halo',
  labelTitle: 'Étiquettes',
  ready: 'La carte est prête',
  readyCredits:
    'Lors de la publication ou du partage de la carte, indiquez ces sources :',
  readyCreditsNone:
    'Le moteur de rendu n’a pas indiqué les sources qu’il a utilisées.',
  readyUnknownSources: 'Sources qui n’ont pas pu être nommées :',
  copyCredits: 'Copier les sources',
  openInNewTab: 'Ouvrir dans un nouvel onglet',
  savedCredits: ({ credits }) =>
    `Carte enregistrée. Lors de sa publication ou de son partage, indiquez : ${credits}`,
  alert: () => (
    <>
      La carte <i>{outdoorMap}</i> sera exportée. Cela peut durer plusieurs
      dizaines de secondes.
    </>
  ),
};

export default fr;
