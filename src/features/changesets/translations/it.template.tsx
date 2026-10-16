import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const it: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'Le modifiche di questo changeset non sono ancora disponibili. Lo saranno alcuni minuti dopo la sua chiusura.',
  inspectError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore nel recupero delle modifiche del changeset',
      err,
    ),
  actions: {
    create: 'creati',
    modify: 'modificati',
    delete: 'eliminati',
  },
  element: {
    types: {
      node: 'Nodo',
      way: 'Via',
      relation: 'Relazione',
    },
    onlyNodesMoved: 'Sono stati spostati solo i suoi nodi.',
    geometryChanged: 'La geometria è cambiata.',
    tagsUnchanged: 'Tag invariati.',
    key: 'Chiave',
    before: 'Prima',
    after: 'Dopo',
    value: 'Valore',
    members: ({ added, removed }) =>
      `Membri: ${added} aggiunti, ${removed} rimossi.`,
    history: 'Cronologia su osm.org',
  },
  allAuthors: 'Tutti gli autori',
  refresh: 'Scarica i changeset per la vista corrente della mappa',
  tooBig:
    'La richiesta dei changeset potrebbe restituire troppi risultati. Per favore aumenta lo zoom, scegli meno giorni o inserici un autore specifico.',
  olderThan: ({ days }) => `${days} giorni`,
  notFound: 'Nessun changeset trovato.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Errore nel recupero dei changeset:', err),
  timeWindow: 'Intervallo di tempo',
  details: {
    author: 'Autore:',
    description: 'Descrizione:',
    noDescription: 'senza descrizione',
    closedAt: 'Ora:',
    openOnOsm: 'Apri su osm.org',
  },
};

export default it;
