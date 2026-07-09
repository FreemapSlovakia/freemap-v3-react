import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const sl: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
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
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Več podrobnosti na {osmLink} ali {achaviLink}.
      </>
    ),
  },
};

export default sl;
