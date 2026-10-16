import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const sl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'Spremembe tega nabora še niso na voljo. Pripravljene so nekaj minut po njegovem zaprtju.',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Napaka pri pridobivanju sprememb nabora', err),
  actions: {
    create: 'ustvarjeno',
    modify: 'spremenjeno',
    delete: 'izbrisano',
  },
  element: {
    types: {
      node: 'Točka',
      way: 'Pot',
      relation: 'Relacija',
    },
    onlyNodesMoved: 'Premaknile so se le njene točke.',
    geometryChanged: 'Geometrija se je spremenila.',
    tagsUnchanged: 'Oznake nespremenjene.',
    key: 'Ključ',
    before: 'Prej',
    after: 'Potem',
    value: 'Vrednost',
    members: ({ added, removed }) =>
      `Člani: ${added} dodanih, ${removed} odstranjenih.`,
    history: 'Zgodovina na osm.org',
  },
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
  },
};

export default sl;
