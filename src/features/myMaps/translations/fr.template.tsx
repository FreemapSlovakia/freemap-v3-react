import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MyMapsMessages } from './MyMapsMessages.js';

const fr: DeepPartialWithRequiredObjects<MyMapsMessages> = {
  deleteConfirm: (name) => (
    <>
      Voulez-vous vraiment supprimer la carte <i>{name}</i> ?
    </>
  ),
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement de la carte', err),
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors du chargement des cartes', err),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Erreur lors de la suppression de la carte', err),
  saveError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de l’enregistrement de la carte',
      err,
    ),
  offlineError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la mise en cache hors ligne de la carte',
      err,
    ),
  offlineCachedAll: ({ count }) =>
    `${count} carte(s) sont désormais disponibles hors ligne.`,
  offlineCachedPartial: ({ count, failed }) =>
    `${count} carte(s) mises en cache hors ligne, ${failed} en échec.`,
  addNew: 'Ajouter une nouvelle carte',
  noMapFound: 'Aucune carte trouvée',
  save: 'Enregistrer',
  disconnect: 'Déconnecter',
  disconnectAndClear: 'Déconnecter et vider',
  deleteTitle: 'Suppression de la carte',
  loadToEmpty: 'Dans une carte vide',
  loadInclMapAndPosition:
    'Inclure la carte de fond et la position enregistrées',
  writers: 'Éditeurs',
  addWriter: 'Ajouter un éditeur',
  conflictError: 'La carte a été modifiée entre-temps.',
  availableOffline: 'Disponible hors ligne',
  availableOfflineHint:
    'Conserve une copie de cette carte dans le navigateur afin de pouvoir l’ouvrir sans connexion. Les tuiles de la carte de fond sont mises en cache séparément via les Cartes hors ligne.',
  offline: 'Hors ligne',
  makeAllOffline: 'Rendre tout disponible hors ligne',
  removeAllOffline: 'Tout retirer du mode hors ligne',
};

export default fr;
