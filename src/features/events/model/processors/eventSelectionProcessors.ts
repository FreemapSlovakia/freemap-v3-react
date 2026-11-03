import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { userLayersSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { mapsLoad, mapsLoaded } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EVENTS_LAYER,
  type EventItem,
  EventSchema,
  eventsOpen,
  eventsOpenDone,
  eventsSetSelected,
} from '../actions.js';
import { selectedEventId } from '../selectors.js';

const layerOn = (state: RootState) =>
  userLayersSelector(state).includes(EVENTS_LAYER);

/** Puts the selected event in the store and its details in a toast, which goes with the selection. */
export const eventSelectionProcessor: Processor = {
  stateChangePredicate: selectedEventId,
  errorKey: 'general.loadError',
  async handle({ getState, dispatch }) {
    const id = selectedEventId(getState());

    // At once, or the toolbar and the halo would show the previous event while
    // this one loads.
    if (getState().events.selected) {
      dispatch(eventsSetSelected(null));
    }

    if (id === null) {
      return;
    }

    let event: EventItem | undefined = getState().events.list.find(
      (e) => e.mapId === id,
    );

    // The filter may have dropped it since it was picked.
    if (!event) {
      try {
        const res = await httpRequest({
          getState,
          url: `/events/${encodeURIComponent(id)}`,
          expectedStatus: 200,
          stateChangePredicate: selectedEventId,
        });

        event = EventSchema.parse(await res.json());
      } catch (err) {
        // Nothing would show the selection, so nothing could dismiss it.
        if (selectedEventId(getState()) === id) {
          dispatch(selectFeature(null));
        }

        throw err;
      }
    }

    dispatch(eventsSetSelected(event));

    dispatch(
      toastsAdd({
        id: 'event',
        style: 'info',
        messageKey: 'details',
        messageLoader: loadEventsMessages,
        messageParams: { event },
        statePredicate: (state) => selectedEventId(state) !== id,
        onClose: selectFeature(null),
      }),
    );
  },
};

/** Turning the layer off lets go of its event. */
export const eventsLayerOffProcessor: Processor = {
  stateChangePredicate: layerOn,
  handle({ getState, dispatch }) {
    if (!layerOn(getState()) && selectedEventId(getState()) !== null) {
      dispatch(selectFeature(null));
    }
  },
};

export const eventsOpenProcessor: Processor<typeof eventsOpen> = {
  actionCreator: eventsOpen,
  handle({ dispatch, action }) {
    dispatch(
      mapsLoad({ id: action.payload.mapId, merge: action.payload.merge }),
    );
  },
};

/**
 * Selects the opened event again once its map is in: replacing the map's
 * contents clears the selection, and with it the event's details.
 */
export const eventsOpenedProcessor: Processor<typeof mapsLoaded> = {
  actionCreator: mapsLoaded,
  handle({ getState, dispatch, action }) {
    const { opening } = getState().events;

    if (opening === null) {
      return;
    }

    dispatch(eventsOpenDone());

    if (action.payload.meta.id === opening) {
      dispatch(selectFeature({ type: 'event', id: opening }));
    }
  },
};
