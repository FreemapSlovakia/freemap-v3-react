import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const sk: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  allAuthors: 'Všetci autori',
  refresh: 'Stiahnuť sady zmien pre aktuálny výrez mapy',
  tooBig:
    'Požiadavka na získanie zmien môže vrátiť veľa záznamov. Skúste priblížiť mapu, zvoliť menej dní, alebo zadať konkrétneho autora.',
  olderThan: ({ days }) => `${days} dn${days === 3 ? 'i' : 'í'}`,
  olderThanFull: ({ days }) =>
    `Zmeny novšie ako ${days} dn${days === 3 ? 'i' : 'í'}`,
  notFound: 'Neboli nájdené žiadne zmeny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba pri získavaní zmien', err),
  details: {
    author: 'Autor:',
    description: 'Popis:',
    noDescription: 'bez popisu',
    closedAt: 'Čas:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Viac detailov na {osmLink}, alebo {achaviLink}.
      </>
    ),
  },
};

export default sk;
