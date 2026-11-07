import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  mapsLoad,
  mapsLoaded,
  mapsLoadFailed,
} from '@features/myMaps/model/actions.js';
import {
  type EventItem,
  EventParticipantSchema,
  EventSchema,
  eventsOpen,
  eventsOpenDone,
  eventsSetParticipants,
  eventsSetSelected,
} from '../actions.js';
import {
  eventsLayerOnSelector as layerOn,
  selectedEventId,
} from '../selectors.js';

/** Puts the selected event in the store, for its panel. */
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

    // In full: the list holds summaries only.
    let event: EventItem;

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

    dispatch(eventsSetSelected(event));
  },
};

/**
 * Loads who is going and who is interested whenever the selected event is set,
 * refreshed copies included, so the names follow the counts.
 */
export const eventsParticipantsProcessor: Processor<typeof eventsSetSelected> =
  {
    actionCreator: eventsSetSelected,
    async handle({ getState, dispatch, action }) {
      const event = action.payload;

      if (!event) {
        return;
      }

      // Without a toast: the counts still show, and offline the event itself
      // comes from the list.
      try {
        const res = await httpRequest({
          getState,
          url: `/events/${encodeURIComponent(event.id)}/participants`,
          expectedStatus: 200,
          cancelActions: [eventsSetSelected],
        });

        dispatch(
          eventsSetParticipants({
            eventId: event.id,
            items: EventParticipantSchema.array().parse(await res.json()),
          }),
        );
      } catch (err) {
        console.warn('Event participants not loaded', err);
      }
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
