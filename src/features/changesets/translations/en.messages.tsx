import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const en: ChangesetsMessages = {
  detail: ({ changeset }) => <ChangesetDetails changeset={changeset} />,
  allAuthors: 'All authors',
  refresh: 'Download changesets for current map view',
  tooBig:
    'Changesets request may return too many items. Please try zoom in, choose fewer days or enter the specific author.',
  timeWindow: 'Time window',
  olderThan: ({ days }) => `${days} days`,
  notFound: 'No changesets found.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Error fetching changesets', err),
  details: {
    author: 'Author:',
    description: 'Description:',
    noDescription: 'without description',
    closedAt: 'Time:',
    moreDetailsOn: ({ osmLink, achaviLink }) => (
      <>
        More details on {osmLink} or {achaviLink}.
      </>
    ),
  },
};

export default en;
