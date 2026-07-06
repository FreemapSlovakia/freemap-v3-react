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
  area: 'Zone à exporter',
  format: 'Format',
  layersTitle: 'Couches optionnelles',
  mapDataTitle: 'Données cartographiques',
  layers: {
    contours: 'Courbes de niveau',
    shading: 'Relief ombré',
    hikingTrails: 'Sentiers de randonnée',
    bicycleTrails: 'Pistes cyclables',
    skiTrails: 'Pistes de ski',
    horseTrails: 'Sentiers équestres',
  },
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
  alert: (licence) => (
    <>
      Remarques :
      <ul>
        <li>
          La carte exportée sera la carte <i>{outdoorMap}</i>.
        </li>
        <li>
          L’exportation de la carte peut durer plusieurs dizaines de secondes.
        </li>
        <li>
          Avant de partager la carte exportée, accompagnez-la de l’attribution
          suivante :
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default fr;
