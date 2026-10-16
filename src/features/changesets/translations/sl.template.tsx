import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const sl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Zgodovina',
    error: ({ err }) =>
      addError(getMessages()!, 'Napaka pri pridobivanju zgodovine', err),
  },
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju sprememb nabora', err),
  actions: {
    create: 'ustvarjeno',
    modify: 'spremenjeno',
    delete: 'izbrisano',
  },
  element: {
    onlyNodesMoved: 'Premaknile so se le njene točke.',
    geometryChanged: 'Geometrija spremenjena.',
    tagsUnchanged: 'Oznake nespremenjene.',
    key: 'Ključ',
    before: 'Prej',
    after: 'Potem',
    value: 'Vrednost',
    members: ({ added, removed }) =>
      `Člani: ${added} dodanih, ${removed} odstranjenih.`,
    history: 'Zgodovina na osm.org',
  },
  changeset: 'Nabor sprememb',
  allAuthors: 'Vsi avtorji',
  refresh: 'Prenesi nabore sprememb za trenutni izsek zemljevida',
  tooBig:
    'Zahteva za nabore sprememb lahko vrne preveč zapisov. Poskusite približati zemljevid, izbrati manj dni ali vnesti določenega avtorja.',
  timeWindow: 'Časovno okno',
  olderThan: ({ days }) => `${days} dni`,
  notFound: 'Ni najdenih naborov sprememb.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju naborov sprememb', err),
  details: {
    author: 'Avtor:',
    description: 'Opis:',
    noDescription: 'brez opisa',
    closedAt: 'Čas:',
    openOnOsm: 'Odpri na osm.org',
    tooBig:
      'OSMCha tega nabora nima, za obnovo iz API-ja OSM pa je prevelik; njegove spremembe so na osm.org.',
    rebuilt:
      'Obnovljeno iz API-ja OSM, ker OSMCha tega nabora nima: nespremenjena vozlišča poti so na današnjem mestu, poti, ki so se jim le premaknila vozlišča, pa manjkajo.',
  },
};

export default sl;
