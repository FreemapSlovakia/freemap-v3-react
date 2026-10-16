import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetDetails } from '../components/ChangesetDetails.js';
import { ChangesetElementDetails } from '../components/ChangesetElementDetails.js';
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
  diffNotReady:
    'The changes of this changeset are not available yet. They are ready a few minutes after the changeset is closed.',
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Error fetching changeset changes', err),
  elementDetail: ({ element }) => <ChangesetElementDetails element={element} />,
  actions: {
    create: 'created',
    modify: 'modified',
    delete: 'deleted',
  },
  element: {
    types: {
      node: 'Node',
      way: 'Way',
      relation: 'Relation',
    },
    onlyNodesMoved: 'Only its nodes moved.',
    geometryChanged: 'Its geometry changed.',
    tagsUnchanged: 'Tags unchanged.',
    key: 'Key',
    before: 'Before',
    after: 'After',
    value: 'Value',
    members: ({ added, removed }) =>
      `Members: ${added} added, ${removed} removed.`,
    history: 'History on osm.org',
  },
  details: {
    author: 'Author:',
    description: 'Description:',
    noDescription: 'without description',
    closedAt: 'Time:',
    openOnOsm: 'Open on osm.org',
  },
};

export default en;
