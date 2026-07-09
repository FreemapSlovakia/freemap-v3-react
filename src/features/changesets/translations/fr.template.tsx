import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const fr: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
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
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Plus de détails sur {osmLink} ou {achaviLink}.
      </>
    ),
  },
};

export default fr;
