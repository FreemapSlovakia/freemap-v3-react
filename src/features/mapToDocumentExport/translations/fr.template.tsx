import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

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
    mtbScale: 'Difficulté VTT',
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
  lossless: 'Sans perte',
  lossy: 'Avec perte',
  quality: 'Qualité',
  sizeTitle: 'Taille et détail',
  zoom: 'Niveau de zoom',
  printScale: 'Échelle',
  mapScale: 'Résolution de la carte',
  printSize: "Taille d'impression",
  imageSize: "Taille de l'image",
  lock: 'Verrouiller',
  unlock: 'Déverrouiller',
  scaleFollowsZoom: "Non verrouillée, l'échelle suit le zoom.",
  symbolSize: ({ percent }) =>
    `Textes et symboles imprimés à ${percent} % de leur taille normale`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'La zone est trop grande pour être exportée. Exportez une zone plus petite.'
      : `La zone est trop grande pour ce niveau de zoom. Réduisez le zoom à ${zoom} ou exportez une zone plus petite.`,
  customLayerOrder: 'Placement des données cartographiques',
  orders: {
    natural: 'Naturel',
    topmost: 'Au premier plan',
  },
  decorations: 'Décorations de la carte',
  scaleBar: 'Échelle',
  northArrow: 'Flèche du nord',
  attribution: 'Attribution',
  legend: 'Légende',
  legendWidens:
    'La légende se place à côté de la carte : le document sera plus large que le papier choisi.',
  webpTooLarge:
    'WebP autorise au plus 16383 px par côté, ce que cet export peut dépasser. Choisissez PNG ou une résolution plus basse.',
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
      La carte <i>{outdoorMap()}</i> sera exportée. Cela peut durer plusieurs
      dizaines de secondes.
    </>
  ),
};

export default fr;
