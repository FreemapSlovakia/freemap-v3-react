import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  MapMetaSchema,
  mapsLoadList,
  mapsSave,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '../actions.js';
import { fingerprintState, getMapDataFromState } from '../mapDocument.js';

export const mapsSaveProcessor: Processor<typeof mapsSave> = {
  actionCreator: mapsSave,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      const { activeMap } = getState().myMaps;

      const asNew = action.payload?.asCopy;

      const patchExisting = activeMap && !asNew;

      trackMatomo([
        'trackEvent',
        'MyMaps',
        asNew ? 'copy' : patchExisting ? 'update' : 'create',
      ]);

      // What is about to be sent becomes the reference the screen is compared
      // against, so edits made while the request is in flight still show as
      // unsaved — no bookkeeping needed, the comparison simply stops matching.
      const sent = getMapDataFromState(getState());

      const sentFingerprint = fingerprintState(getState());

      const res = await httpRequest({
        getState,
        method: patchExisting ? 'PATCH' : 'POST',
        url: `/maps/${patchExisting ? activeMap.id : ''}`,
        expectedStatus: [200, 412],
        headers: patchExisting
          ? {
              'If-Unmodified-Since': activeMap.modifiedAt.toUTCString(),
            }
          : {},
        data: {
          name: action.payload?.name,
          public: true, // TODO
          writers: action.payload?.writers,
          data: sent,
        },
      });

      if (res.status === 412) {
        dispatch(
          toastsAdd({
            id: 'myMaps.conflictError',
            style: 'danger',
            messageKey: 'conflictError',
            messageLoader: loadMyMapsMessages,
          }),
        );

        return;
      }

      const meta = MapMetaSchema.parse(await res.json());

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          // The name comes from the response, so saving an existing map without
          // retyping its name still names it in the toast.
          messageKey: patchExisting ? 'mapUpdated' : 'mapCreated',
          messageParams: { name: meta.name },
          messageLoader: loadMyMapsMessages,
        }),
      );

      dispatch(mapsLoadList());

      dispatch(mapsSetMeta(meta));

      dispatch(mapsSetSavedFingerprint(sentFingerprint));
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'saveError');
    }
  },
};
