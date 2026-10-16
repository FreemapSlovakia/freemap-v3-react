import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const sk: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  allAuthors: 'Všetci autori',
  refresh: 'Stiahnuť sady zmien pre aktuálny výrez mapy',
  tooBig:
    'Požiadavka na získanie zmien môže vrátiť veľa záznamov. Skúste priblížiť mapu, zvoliť menej dní, alebo zadať konkrétneho autora.',
  timeWindow: 'Časové okno',
  olderThan: ({ days }) => `${days} dn${days === 3 ? 'i' : 'í'}`,
  notFound: 'Neboli nájdené žiadne zmeny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní zmien', err),
  diffNotReady:
    'Zmeny tejto sady ešte nie sú k dispozícii. Pripravené sú niekoľko minút po jej uzavretí.',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní zmien sady', err),
  actions: {
    create: 'vytvorené',
    modify: 'upravené',
    delete: 'zmazané',
  },
  element: {
    types: {
      node: 'Bod',
      way: 'Cesta',
      relation: 'Relácia',
    },
    onlyNodesMoved: 'Posunuli sa len jej body.',
    geometryChanged: 'Zmenila sa geometria.',
    tagsUnchanged: 'Tagy bez zmeny.',
    key: 'Kľúč',
    before: 'Predtým',
    after: 'Potom',
    value: 'Hodnota',
    members: ({ added, removed }) =>
      `Členovia: ${added} pridaných, ${removed} odobraných.`,
    history: 'História na osm.org',
  },
  details: {
    author: 'Autor:',
    description: 'Popis:',
    noDescription: 'bez popisu',
    closedAt: 'Čas:',
    openOnOsm: 'Otvoriť na osm.org',
  },
};

export default sk;
