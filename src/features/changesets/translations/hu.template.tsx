import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const hu: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'Előzmények',
    error: ({ err }) =>
      addError(getMessages()!, 'Hiba az előzmények lekérésekor', err),
  },
  inspectError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a módosításkészlet változásainak beolvasásánál',
      err,
    ),
  actions: {
    create: 'létrehozva',
    modify: 'módosítva',
    delete: 'törölve',
  },
  element: {
    onlyNodesMoved: 'Csak a pontjai mozdultak el.',
    geometryChanged: 'A geometria megváltozott.',
    tagsUnchanged: 'A címkék nem változtak.',
    key: 'Kulcs',
    before: 'Előtte',
    after: 'Utána',
    value: 'Érték',
    members: ({ added, removed }) =>
      `Tagok: ${added} hozzáadva, ${removed} eltávolítva.`,
    history: 'Előzmények az osm.org-on',
  },
  changeset: 'Módosításkészlet',
  allAuthors: 'Minden szerző',
  refresh: 'Változáskészletek letöltése az aktuális térképnézethez',
  tooBig:
    'A változáskérések túl sok elemet adhatnak vissza. Kérlek, nagyíts rá, válassz kevesebb napot, vagy adj meg egy konkrét szerzőt.',
  olderThan: ({ days }) => `${days} nap`,
  notFound: 'Nincs módosításkészlet.',
  fetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a módosításkészletek beolvasásánál',
      err,
    ),
  timeWindow: 'Időablak',
  details: {
    author: 'Szerző:',
    description: 'Leírás:',
    noDescription: 'leírás nélküli',
    closedAt: 'Idő:',
    openOnOsm: 'Megnyitás az osm.org-on',
    tooBig:
      'Az OSMCha nem tartalmazza ezt a módosításkészletet, és túl nagy ahhoz, hogy az OSM API-ból összeállítsuk; a változásai az osm.org-on láthatók.',
    rebuilt:
      'Az OSM API-ból összeállítva, mert az OSMCha nem tartalmazza ezt a módosításkészletet: az utak nem módosított pontjai a mai helyükön látszanak, és hiányoznak azok az utak, amelyeknek csak a pontjai mozdultak el.',
  },
};

export default hu;
