import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetsMessages } from './ChangesetsMessages.js';

const cs: DeepPartialWithRequiredObjects<ChangesetsMessages> = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  allAuthors: 'Všichni autoři',
  refresh: 'Stáhnout sady změn pro aktuální výřez mapy',
  tooBig:
    'Požadavek na získání změn může vrátit spoustu záznamů. Zkuste přiblížit mapu, zvolit méně dní, nebo zadat konkrétního autora.',
  olderThan: ({ days }) => `${days} dn ${days === 3 ? 'i' : 'í'}`,
  notFound: 'Nebyly nalezeny žádné změny.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání změn', err),
  timeWindow: 'Časové okno',
  details: {
    author: 'Autor:',
    description: 'Popis:',
    noDescription: 'bez popisu',
    closedAt: 'Čas:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        Více detailů na {osmLink}, nebo {achaviLink}.
      </>
    ),
  },
};

export default cs;
