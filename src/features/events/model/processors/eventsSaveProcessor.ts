import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { MapMetaSchema } from '@features/myMaps/model/actions.js';
import { getMapDataFromState } from '@features/myMaps/model/processors/mapsSaveProcessor.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { eventsLoadList, eventsSave } from '../actions.js';

export const eventsSaveProcessor: Processor<typeof eventsSave> = {
  actionCreator: eventsSave,
  async handle({ getState, dispatch, action, toastError }) {
    const p = action.payload;

    try {
      let mapId: string;

      if (p.source.type === 'current') {
        // Publish the current app state as a new saved map, then reference it.
        const mapRes = await httpRequest({
          getState,
          method: 'POST',
          url: '/maps/',
          expectedStatus: 200,
          data: {
            name: p.source.name,
            public: true,
            data: getMapDataFromState(getState()),
          },
        });

        mapId = MapMetaSchema.parse(await mapRes.json()).id;
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
    } catch (err) {
      await toastError(err, loadEventsMessages, 'saveError');
    }
  },
};
