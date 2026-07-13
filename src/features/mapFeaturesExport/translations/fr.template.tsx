import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapFeaturesExportMessages } from './MapFeaturesExportMessages.js';

const fr: DeepPartialWithRequiredObjects<MapFeaturesExportMessages> = {
  download: 'Télécharger',
  format: 'Format',
  target: 'Destination',
  elevation: {
    label: 'Altitude',
    none: 'Conserver tel quel',
    missing: 'Compléter les manquantes',
    all: 'Tout remplacer',
  },
  exportError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de l’exportation', err),
  what: {
    plannedRoute: 'itinéraire trouvé',
    plannedRouteWithStops: 'avec les arrêts',
    objects: 'objets (POI)',
    pictures: 'photos (dans la zone visible de la carte)',
    drawingLines: 'dessin - lignes',
    drawingAreas: 'dessin - polygones',
    drawingPoints: 'dessin - points',
    tracking: 'suivi en direct',
    import: 'fichier importé',
    search: 'résultat',
  },
  onlySelected: "Seulement l'élément sélectionné",
  disabledAlert:
    'Seules les options dont les objets sont présents sur la carte sont actives.',
  licenseAlert:
    'Diverses licences peuvent s’appliquer, comme celle d’OpenStreetMap. Veuillez ajouter les attributions manquantes lors du partage du fichier exporté.',
  exportedToDropbox: 'Le fichier a été enregistré sur Dropbox.',
  exportedToGdrive: 'Le fichier a été enregistré sur Google Drive.',
  garmin: {
    courseName: 'Nom du parcours',
    description: 'Description',
    activityType: 'Type d’activité',
    at: {
      running: 'Course à pied',
      hiking: 'Randonnée',
      other: 'Autre',
      mountain_biking: 'VTT',
      trailRunning: 'Trail',
      roadCycling: 'Cyclisme sur route',
      gravelCycling: 'Gravel',
    },
    revoked: 'L’exportation du parcours vers Garmin a été révoquée.',
    exportError: 'Erreur lors de l’exportation vers Garmin.',
    multipleLineStrings: 'La sélection contient plus d’une ligne continue.',
    noLineString: 'La sélection ne contient aucune ligne continue.',
    multipleTracks:
      'Plusieurs traces ne sont pas prises en charge. Sélectionnez-en une seule.',
    multipleLines:
      'Plusieurs lignes ne sont pas prises en charge. Sélectionnez-en une seule.',
    connectPrompt:
      'Votre compte Garmin n’est pas encore connecté. Souhaitez-vous le faire maintenant ?',
    authPrompt:
      'Vous n’êtes pas encore authentifié auprès de Garmin. Souhaitez-vous le faire maintenant ?',
  },
};

export default fr;
