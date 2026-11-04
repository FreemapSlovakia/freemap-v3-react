import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import {
  mapsLoad,
  mapsLoaded,
  mapsLoadFailed,
} from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  type EventItem,
  EventSchema,
  eventsOpen,
  eventsOpenDone,
  eventsSetSelected,
} from '../actions.js';
import {
  eventsLayerOnSelector as layerOn,
  selectedEventId,
} from '../selectors.js';

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
      (e) => e.id === id,
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

    showSelectedEvent(dispatch, event);
  },
};

export const EVENT_TOAST_ID = 'event';

/**
 * The event's details, going with its selection. Closing it keeps the
 * selection: on a phone it covers the map, and the toolbar must stay usable.
 */
export const eventDetailsToast = (event: EventItem) =>
  toastsAdd({
    id: EVENT_TOAST_ID,
    style: 'info',
    messageKey: 'details',
    messageLoader: loadEventsMessages,
    messageParams: { event },
    statePredicate: (state) => selectedEventId(state) !== event.id,
  });

/** Puts the event in the store and its details in a toast. */
export function showSelectedEvent(dispatch: Dispatch, event: EventItem): void {
  dispatch(eventsSetSelected(event));

  dispatch(eventDetailsToast(event));
}

/** A newer copy of the selected event; a closed toast stays closed. */
export function refreshSelectedEvent(
  dispatch: Dispatch,
  getState: () => RootState,
  event: EventItem,
): void {
  dispatch(eventsSetSelected(event));

  if (getState().toasts.toasts[EVENT_TOAST_ID]) {
    dispatch(eventDetailsToast(event));
  }
}

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
export const eventsOpenedProcessor: Processor<
  typeof mapsLoaded | typeof mapsLoadFailed
> = {
  actionCreator: [mapsLoaded, mapsLoadFailed],
  handle({ getState, dispatch, action }) {
    const { opening } = getState().events;

    if (opening === null) {
      return;
    }

    // A failed load is done with too, or the event would be selected whenever
    // that map is loaded later.
    dispatch(eventsOpenDone());

    if (mapsLoaded.match(action) && action.payload.meta.id === opening.mapId) {
      dispatch(selectFeature({ type: 'event', id: opening.id }));
    }
  },
};
