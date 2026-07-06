import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const hu: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
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
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        További részletek itt: {osmLink} vagy itt: {achaviLink}.
      </>
    ),
  },
};

export default hu;
