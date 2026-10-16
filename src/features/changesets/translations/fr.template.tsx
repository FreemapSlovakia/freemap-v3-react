import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const fr: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'Les modifications de cet ensemble ne sont pas encore disponibles. Elles le sont quelques minutes après sa fermeture.',
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
    types: {
      node: 'Nœud',
      way: 'Chemin',
      relation: 'Relation',
    },
    onlyNodesMoved: 'Seuls ses nœuds ont été déplacés.',
    geometryChanged: 'Sa géométrie a changé.',
    tagsUnchanged: 'Attributs inchangés.',
    key: 'Clé',
    before: 'Avant',
    after: 'Après',
    value: 'Valeur',
    members: ({ added, removed }) =>
      `Membres : ${added} ajoutés, ${removed} retirés.`,
    history: 'Historique sur osm.org',
  },
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
  },
};

export default fr;
