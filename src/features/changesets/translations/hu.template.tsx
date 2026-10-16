import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const hu: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  diffNotReady:
    'A módosításkészlet változásai még nem érhetők el. Néhány perccel a lezárása után lesznek elérhetők.',
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
    types: {
      node: 'Pont',
      way: 'Vonal',
      relation: 'Kapcsolat',
    },
    onlyNodesMoved: 'Csak a pontjai mozdultak el.',
    geometryChanged: 'A geometriája megváltozott.',
    tagsUnchanged: 'A címkék nem változtak.',
    key: 'Kulcs',
    before: 'Előtte',
    after: 'Utána',
    value: 'Érték',
    members: ({ added, removed }) =>
      `Tagok: ${added} hozzáadva, ${removed} eltávolítva.`,
    history: 'Előzmények az osm.org-on',
  },
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
  },
};

export default hu;
