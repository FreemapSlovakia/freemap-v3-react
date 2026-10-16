import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const sk: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'História',
    error: ({ err }) =>
      addError(getMessages()!, 'Nastala chyba pri získavaní histórie', err),
  },
  changeset: 'Sada zmien',
  allAuthors: 'Všetci autori',
  refresh: 'Stiahnuť sady zmien pre aktuálny výrez mapy',
  tooBig:
    'Požiadavka na získanie zmien môže vrátiť veľa záznamov. Skúste priblížiť mapu, zvoliť menej dní, alebo zadať konkrétneho autora.',
  timeWindow: 'Časové okno',
  olderThan: ({ days }) => `${days} dn${days === 3 ? 'i' : 'í'}`,
  notFound: 'Neboli nájdené žiadne zmeny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní zmien', err),
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní zmien sady', err),
  actions: {
    create: 'vytvorené',
    modify: 'upravené',
    delete: 'zmazané',
  },
  element: {
    onlyNodesMoved: 'Posunuli sa len jej body.',
    geometryChanged: 'Geometria zmenená.',
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
    tooBig:
      'OSMCha túto sadu nemá a je príliš veľká na zostavenie z OSM API; jej zmeny pozrite na osm.org.',
    rebuilt:
      'Zostavené z OSM API, lebo OSMCha túto sadu nemá: neupravené body ciest sú zobrazené na dnešnom mieste a cesty, ktorým sa len posunuli body, chýbajú.',
  },
};

export default sk;
