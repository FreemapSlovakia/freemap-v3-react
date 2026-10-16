import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import { ChangesetInspector } from '../components/ChangesetInspector.js';
import type { ChangesetsMessages } from './ChangesetsMessages.js';

const en: ChangesetsMessages = {
  inspector: () => <ChangesetInspector />,
  history: {
    title: 'History',
    error: ({ err }) =>
      addError(getMessages()!, 'Error fetching the history', err),
  },
  changeset: 'Changeset',
  allAuthors: 'All authors',
  refresh: 'Download changesets for current map view',
  tooBig:
    'Changesets request may return too many items. Please try zoom in, choose fewer days or enter the specific author.',
  timeWindow: 'Time window',
  olderThan: ({ days }) => `${days} days`,
  notFound: 'No changesets found.',
  fetchError: ({ err }) =>
    addError(getMessages()!, 'Error fetching changesets', err),
  inspectError: ({ err }) =>
    addError(getMessages()!, 'Error fetching changeset changes', err),
  actions: {
    create: 'created',
    modify: 'modified',
    delete: 'deleted',
  },
  element: {
    onlyNodesMoved: 'Only its nodes moved.',
    geometryChanged: 'Geometry changed.',
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
    tooBig:
      'OSMCha has no diff of this changeset, and it is too big to rebuild from the OSM API; see its changes on osm.org.',
    rebuilt:
      'Rebuilt from the OSM API, as OSMCha lacks this changeset: the untouched nodes of ways are shown where they are today, and ways whose only change was moved nodes are missing.',
  },
};

export default en;
