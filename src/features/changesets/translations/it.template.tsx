import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const it: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  allAuthors: 'Tutti gli autori',
  refresh: 'Scarica i changeset per la vista corrente della mappa',
  tooBig:
    'La richiesta dei changeset potrebbe restituire troppi risultati. Per favore aumenta lo zoom, scegli meno giorni o inserici un autore specifico.',
  olderThan: ({ days }) => `${days} giorni`,
  notFound: 'Nessun changeset trovato.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Errore nel recupero dei changeset:', err),
  details: {
    author: 'Autore:',
    description: 'Descrizione:',
    noDescription: 'senza descrizione',
    closedAt: 'Ora:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Maggiori dettagli su {osmLink} o {achaviLink}.
      </>
    ),
  },
};

export default it;
