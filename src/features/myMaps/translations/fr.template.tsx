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
  mapCreated: ({ name }) => (
    <>
      La carte <i>{name}</i> a été enregistrée dans vos cartes.
    </>
  ),
  mapUpdated: ({ name }) => (
    <>
      Les modifications de la carte <i>{name}</i> ont été enregistrées.
    </>
  ),
  mapDeleted: ({ name }) => (
    <>
      La carte <i>{name}</i> a été supprimée de vos cartes.
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
  loginToSave:
    'Connectez-vous d’abord pour enregistrer la carte dans vos cartes.',
  reload: 'Recharger la carte',
  reloadConfirm:
    'Abandonner vos modifications non enregistrées et recharger la carte enregistrée ?',
  unsaved: 'Modifications non enregistrées',
  unsavedTooltip:
    'La carte comporte des modifications non enregistrées qui ne sont pas reflétées dans le lien. Enregistrez la carte pour les conserver.',
  disconnect: 'Déconnecter',
  disconnectAndClear: 'Déconnecter et vider',
  deleteTitle: 'Suppression de la carte',
  loadMergeModal: {
    title: 'La carte n’est pas vide',
    message:
      'La carte affiche déjà du contenu. Y ajouter la carte chargée, ou le remplacer ?',
    append: 'Ajouter',
    replace: 'Remplacer',
  },
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
  savedToOutbox: ({ name }) => (
    <>
      La carte <i>{name}</i> a été enregistrée dans ce navigateur et sera
      envoyée dès que la connexion le permettra.
    </>
  ),
  unsent: 'Non envoyé',
  unsentTooltip:
    'Cette carte comporte des modifications enregistrées dans ce navigateur qui ne sont pas encore parvenues au serveur. Elles seront envoyées automatiquement dès que la connexion le permettra.',
  syncing: 'Envoi…',
  syncNow: 'Envoyer les modifications non envoyées',
  outboxEmpty: 'Aucune modification non envoyée.',
  outboxOffline:
    'Pas de connexion — les modifications non envoyées restent en attente.',
  outboxSynced: ({ count }) => `Modifications de cartes envoyées : ${count}.`,
  outboxRetryLater: ({ count }) =>
    `Les modifications de cartes n’ont pas pu être envoyées (${count}) ; une nouvelle tentative aura lieu plus tard.`,
  outboxError: ({ err }) =>
    addError(
      getMessages()!,
      "Erreur lors de l'envoi des modifications de cartes",
      err,
    ),
  outboxConflict: ({ name }) => (
    <>
      La carte <i>{name}</i> a été modifiée ailleurs entre-temps ; vos
      modifications non envoyées ne peuvent donc pas être envoyées. Choisissez
      ce qu’il faut en faire.
    </>
  ),
  outboxForbidden: ({ name }) => (
    <>
      Vous n’avez plus le droit d’écrire sur la carte <i>{name}</i> ; vos
      modifications non envoyées ne peuvent donc pas être envoyées. Choisissez
      ce qu’il faut en faire.
    </>
  ),
  outboxGone: ({ name }) => (
    <>
      La carte <i>{name}</i> n’existe plus ; vos modifications non envoyées ne
      peuvent donc pas être envoyées. Choisissez ce qu’il faut en faire.
    </>
  ),
  outboxUnreadable: ({ name }) => (
    <>
      Les modifications non envoyées de la carte <i>{name}</i> ne peuvent pas
      être relues depuis ce navigateur, elles ne peuvent donc pas être envoyées.
    </>
  ),
  outboxConflictBadge: 'Conflit',
  outboxBlockedBadge: 'Envoi impossible',
  outboxResolveCopy: 'Enregistrer comme copie',
  outboxResolveOverwrite: 'Écraser la version du serveur',
  outboxResolveDiscard: 'Abandonner mes modifications',
  outboxDiscardTitle: 'Abandon des modifications non envoyées',
  outboxDiscardConfirm: (name) => (
    <>
      Abandonner les modifications non envoyées de la carte <i>{name}</i> ?
      Elles n’existent que dans ce navigateur et sont irrécupérables.
    </>
  ),
  outboxCopyName: (name) => `${name} (copie)`,
  logoutUnsentTitle: 'Modifications de cartes non envoyées',
  logoutUnsentWarning: ({ count }) =>
    `${count} carte(s) comportent des modifications qui ne sont pas encore parvenues au serveur. La déconnexion les abandonne. Se déconnecter quand même ?`,
};

export default fr;
