import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type Place, PlaceSchema } from '../places.js';
import {
  deletePlace,
  placeStored,
  placesLoad,
  placesSet,
  savePlace,
} from './actions.js';

/** A new place's local id → its id on the account, once created there. */
const storedIds = new Map<number, number>();

let queue: Promise<unknown> = Promise.resolve();

/** Changes queued so far; a load that saw one queued while out is stale. */
let changes = 0;

/** One request at a time, so an edit follows the create of its place. */
function queued(task: () => Promise<void>): Promise<void> {
  const run = queue.then(task);

  queue = run.catch(() => undefined);

  return run;
}

const body = ({ name, lat, lon }: Place) => ({ name, lat, lon });

export const placesLoadProcessor: Processor<typeof placesLoad> = {
  actionCreator: placesLoad,
  handle({ getState, dispatch }) {
    return queued(async () => {
      const userId = getState().auth.user?.id;

      if (userId === undefined) {
        return;
      }

      const seen = changes;

      try {
        const res = await httpRequest({
          getState,
          url: '/places',
          expectedStatus: 200,
          cancelActions: [],
        });

        const places = PlaceSchema.array().parse(await res.json());

        if (getState().auth.user?.id !== userId) {
          return;
        }

        // It would undo what the user changed meanwhile; load again after it.
        if (changes !== seen) {
          dispatch(placesLoad());
        } else {
          dispatch(placesSet(places));
        }
      } catch (err) {
        console.warn('Places not loaded', err);
      }
    });
  },
};

/** Loads the account's places on login, and on start when logged in. */
export const placesLoginProcessor: Processor<typeof authSetUser> = {
  actionCreator: authSetUser,
  handle({ prevState, getState, dispatch }) {
    const user = getState().auth.user;

    if (
      !user ||
      (prevState.auth.validated && prevState.auth.user?.id === user.id)
    ) {
      return;
    }

    // Another account's, which local ids of this one must not resolve to.
    storedIds.clear();

    dispatch(placesLoad());
  },
};

export const savePlaceProcessor: Processor<typeof savePlace> = {
  actionCreator: savePlace,
  handle({ getState, dispatch, action, toastError }) {
    const place = action.payload;

    // TODO an edit of a place still being created counts as an add.
    trackMatomo(['trackEvent', 'Places', place.id < 0 ? 'add' : 'modify']);

    const userId = getState().auth.user?.id;

    changes++;

    return queued(async () => {
      // Not under an account logged into meanwhile.
      if (userId === undefined || getState().auth.user?.id !== userId) {
        return;
      }

      const id = storedIds.get(place.id) ?? place.id;

      try {
        const res = await httpRequest({
          getState,
          ...(id < 0
            ? { method: 'POST', url: '/places' }
            : { method: 'PATCH', url: `/places/${id}` }),
          data: body(place),
          expectedStatus: 200,
          cancelActions: [],
        });

        const stored = PlaceSchema.parse(await res.json());

        storedIds.set(place.id, stored.id);

        dispatch(placeStored({ localId: place.id, place: stored }));
      } catch (err) {
        await toastError(err, loadMapSettingsMessages, 'savingError');

        dispatch(placesLoad());
      }
    });
  },
};

export const deletePlaceProcessor: Processor<typeof deletePlace> = {
  actionCreator: deletePlace,
  handle({ getState, dispatch, action, toastError }) {
    trackMatomo(['trackEvent', 'Places', 'delete']);

    const userId = getState().auth.user?.id;

    changes++;

    return queued(async () => {
      // Resolved now: the create queued ahead of it has given it its id.
      const id = storedIds.get(action.payload) ?? action.payload;

      if (
        userId === undefined ||
        getState().auth.user?.id !== userId ||
        id < 0
      ) {
        return;
      }

      try {
        await httpRequest({
          getState,
          method: 'DELETE',
          url: `/places/${id}`,
          expectedStatus: 204,
          cancelActions: [],
        });
      } catch (err) {
        await toastError(err, loadMapSettingsMessages, 'savingError');

        dispatch(placesLoad());
      }
    });
  },
};
