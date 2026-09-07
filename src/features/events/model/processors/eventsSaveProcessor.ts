import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  MapMetaSchema,
  mapsLoadList,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '@features/myMaps/model/actions.js';
import {
  fingerprintState,
  getMapDataFromState,
} from '@features/myMaps/model/mapDocument.js';
import { routePlannerSetSavedRoute } from '@features/routePlanner/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  eventsLoadList,
  eventsSave,
  eventsSaveDone,
  eventsSetView,
} from '../actions.js';

export const eventsSaveProcessor: Processor<typeof eventsSave> = {
  actionCreator: eventsSave,
  async handle({ getState, dispatch, action, toastError }) {
    const p = action.payload;

    try {
      let mapId: string;

      if (p.source.type === 'current') {
        // Publish the current app state as a new saved map, then reference it.
        const sent = getMapDataFromState(getState());

        const sentFingerprint = fingerprintState(getState());

        const mapRes = await httpRequest({
          getState,
          method: 'POST',
          url: '/maps/',
          expectedStatus: 200,
          data: {
            name: p.source.name,
            public: true,
            data: sent,
          },
        });

        const meta = MapMetaSchema.parse(await mapRes.json());

        mapId = meta.id;

        // The app becomes that map, exactly as after a my-maps save: otherwise
        // the unsaved-changes warning stays up and the next Save creates a
        // second copy. Done before the event request so a failure there still
        // leaves the map it created connected and listed rather than orphaned.
        dispatch(mapsLoadList());

        dispatch(mapsSetMeta(meta));

        dispatch(mapsSetSavedFingerprint(sentFingerprint));

        dispatch(routePlannerSetSavedRoute(sent.routePlanner?.result ?? null));
      } else {
        mapId = p.source.mapId;
      }

      await httpRequest({
        getState,
        method: p.id ? 'PATCH' : 'POST',
        url: `/events/${p.id ?? ''}`,
        expectedStatus: 200,
        data: {
          mapId,
          title: p.title,
          description: p.description ?? null,
          startAt: p.startAt,
          endAt: p.endAt ?? null,
          startPoint: p.startPoint ?? null,
          filterLocation: p.filterLocation ?? null,
          visibility: p.visibility,
        },
      });

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          messageKey: 'general.saved',
        }),
      );

      dispatch(eventsLoadList());

      // Only now, so a refused save leaves the form up with what was typed.
      dispatch(eventsSetView('list'));
    } catch (err) {
      await toastError(err, loadEventsMessages, 'saveError');
    } finally {
      dispatch(eventsSaveDone());
    }
  },
};
