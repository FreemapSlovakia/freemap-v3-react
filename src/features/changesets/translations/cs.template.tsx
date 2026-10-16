import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const cs: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  allAuthors: 'Všichni autoři',
  refresh: 'Stáhnout sady změn pro aktuální výřez mapy',
  tooBig:
    'Požadavek na získání změn může vrátit spoustu záznamů. Zkuste přiblížit mapu, zvolit méně dní, nebo zadat konkrétního autora.',
  olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
  notFound: 'Nebyly nalezeny žádné změny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání změn', err),
  timeWindow: 'Časové okno',
  diffNotReady:
    'Změny této sady ještě nejsou k dispozici. Připravené jsou několik minut po jejím uzavření.',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání změn sady', err),
  actions: {
    create: 'vytvořené',
    modify: 'upravené',
    delete: 'smazané',
  },
  element: {
    types: {
      node: 'Bod',
      way: 'Cesta',
      relation: 'Relace',
    },
    onlyNodesMoved: 'Posunuly se jen její body.',
    geometryChanged: 'Změnila se geometrie.',
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
  },
};

export default cs;
