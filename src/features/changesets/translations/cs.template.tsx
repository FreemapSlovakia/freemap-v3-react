import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const cs: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Historie',
    error: ({ err }) =>
      addError(getMessages()!, 'Nastala chyba při získávání historie', err),
  },
  changeset: 'Sada změn',
  allAuthors: 'Všichni autoři',
  refresh: 'Stáhnout sady změn pro aktuální výřez mapy',
  tooBig:
    'Požadavek na získání změn může vrátit spoustu záznamů. Zkuste přiblížit mapu, zvolit méně dní, nebo zadat konkrétního autora.',
  olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
  notFound: 'Nebyly nalezeny žádné změny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání změn', err),
  timeWindow: 'Časové okno',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání změn sady', err),
  actions: {
    create: 'vytvořené',
    modify: 'upravené',
    delete: 'smazané',
  },
  element: {
    onlyNodesMoved: 'Posunuly se jen její body.',
    geometryChanged: 'Geometrie změněna.',
    tagsUnchanged: 'Tagy beze změny.',
    key: 'Klíč',
    before: 'Předtím',
    after: 'Potom',
    value: 'Hodnota',
    members: ({ added, removed }) =>
      `Členové: ${added} přidaných, ${removed} odebraných.`,
    history: 'Historie na osm.org',
  },
  details: {
    author: 'Autor:',
    description: 'Popis:',
    noDescription: 'bez popisu',
    closedAt: 'Čas:',
    openOnOsm: 'Otevřít na osm.org',
    tooBig:
      'OSMCha tuto sadu nemá a je příliš velká na sestavení z OSM API; její změny najdete na osm.org.',
    rebuilt:
      'Sestaveno z OSM API, protože OSMCha tuto sadu nemá: neupravené body cest jsou zobrazené na dnešním místě a cesty, kterým se jen posunuly body, chybí.',
  },
};

export default cs;
