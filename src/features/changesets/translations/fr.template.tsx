import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const fr: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Historique',
    error: ({ err }) =>
      addError(
        getMessages()!,
        "Erreur lors de la récupération de l'historique",
        err,
      ),
  },
  inspectError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la récupération des modifications de l’ensemble',
      err,
    ),
  actions: {
    create: 'créés',
    modify: 'modifiés',
    delete: 'supprimés',
  },
  element: {
    onlyNodesMoved: 'Seuls ses nœuds ont été déplacés.',
    geometryChanged: 'Géométrie modifiée.',
    tagsUnchanged: 'Attributs inchangés.',
    key: 'Clé',
    before: 'Avant',
    after: 'Après',
    value: 'Valeur',
    members: ({ added, removed }) =>
      `Membres : ${added} ajoutés, ${removed} retirés.`,
    history: 'Historique sur osm.org',
  },
  changeset: 'Ensemble de modifications',
  allAuthors: 'Tous les auteurs',
  refresh:
    'Télécharger les ensembles de modifications pour la vue actuelle de la carte',
  tooBig:
    'La requête d’ensembles de modifications peut renvoyer trop de résultats. Essayez de zoomer, de choisir moins de jours ou d’indiquer un auteur précis.',
  timeWindow: 'Fenêtre temporelle',
  olderThan: ({ days }) => `${days} jour${days > 1 ? 's' : ''}`,
  notFound: 'Aucun ensemble de modifications trouvé.',
  fetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Erreur lors de la récupération des ensembles de modifications',
      err,
    ),
  details: {
    author: 'Auteur :',
    description: 'Description :',
    noDescription: 'sans description',
    closedAt: 'Heure :',
    openOnOsm: 'Ouvrir sur osm.org',
    tooBig:
      "OSMCha n'a pas cet ensemble, et il est trop grand pour être reconstitué depuis l'API OSM ; ses modifications sont sur osm.org.",
    rebuilt:
      "Reconstitué depuis l'API OSM, car OSMCha n'a pas cet ensemble : les nœuds non modifiés des chemins sont à leur position actuelle, et les chemins dont seuls les nœuds ont bougé manquent.",
  },
};

export default fr;
