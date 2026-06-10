import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const hu: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  allAuthors: 'Minden szerző',
  refresh: 'Változáskészletek letöltése az aktuális térképnézethez',
  tooBig:
    'A változáskérések túl sok elemet adhatnak vissza. Kérlek, nagyíts rá, válassz kevesebb napot, vagy adj meg egy konkrét szerzőt.',
  olderThan: ({ days }) => `${days} nap`,
  olderThanFull: ({ days }) => `Az elmúlt ${days} nap módosításkészletei`,
  notFound: 'Nincs módosításkészlet.',
  fetchError: ({ err }) =>
    addError(
      getMessages()!,
      'Hiba történt a módosításkészletek beolvasásánál',
      err,
    ),
  details: {
    author: 'Szerző:',
    description: 'Leírás:',
    noDescription: 'leírás nélküli',
    closedAt: 'Idő:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        További részletek itt: {osmLink} vagy itt: {achaviLink}.
      </>
    ),
  },
};

export default hu;
