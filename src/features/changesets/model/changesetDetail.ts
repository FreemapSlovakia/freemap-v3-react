import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadChangesetsMessages } from '../translations/loadChangesetsMessages.js';
import { type Changeset, changesetsSetParams } from './actions.js';

/** What clicking a changeset shows: its details, until the query changes. */
export function changesetDetail(changeset: Changeset) {
  return toastsAdd({
    id: 'changeset.detail',
    messageKey: 'detail',
    messageLoader: loadChangesetsMessages,
    messageParams: {
      changeset,
    },
    cancelType: changesetsSetParams.type,
    style: 'info',
  });
}
