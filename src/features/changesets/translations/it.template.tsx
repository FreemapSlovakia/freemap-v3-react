import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const it: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Storia',
    error: ({ err }) =>
      addError(getMessages()!, 'Errore nel recupero della storia', err),
  },
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
    onlyNodesMoved: 'Sono stati spostati solo i suoi nodi.',
    geometryChanged: 'Geometria cambiata.',
    tagsUnchanged: 'Tag invariati.',
    key: 'Chiave',
    before: 'Prima',
    after: 'Dopo',
    value: 'Valore',
    members: ({ added, removed }) =>
      `Membri: ${added} aggiunti, ${removed} rimossi.`,
    history: 'Cronologia su osm.org',
  },
  changeset: 'Changeset',
  allAuthors: 'Tutti gli autori',
  refresh: 'Scarica i changeset per la vista corrente della mappa',
  tooBig:
    'La richiesta dei changeset potrebbe restituire troppi risultati. Per favore aumenti lo zoom, scelga meno giorni o inserisca un autore specifico.',
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
    tooBig:
      "OSMCha non ha questo changeset, ed è troppo grande per ricostruirlo dall'API OSM; le sue modifiche sono su osm.org.",
    rebuilt:
      "Ricostruito dall'API OSM, perché OSMCha non ha questo changeset: i nodi non modificati delle vie sono nella posizione attuale e mancano le vie in cui si sono spostati solo i nodi.",
  },
};

export default it;
