import { HttpError, httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { SavedEventFilterSchema, toSavedFilter } from '../savedFilters.js';
import {
  eventsSavedFilterCreate,
  eventsSavedFilterDelete,
  eventsSavedFilterPicked,
  eventsSavedFiltersLoad,
  eventsSavedFiltersSet,
  eventsSavedFilterUpdate,
} from '../savedFiltersSlice.js';

// Each load takes the next number; only the latest sets the list. A change
// loads it again once it is done, so that load is the one that wins.
let loadSeq = 0;

export const eventsSavedFiltersLoadProcessor: Processor<
  typeof eventsSavedFiltersLoad
> = {
  actionCreator: eventsSavedFiltersLoad,
  async handle({ getState, dispatch }) {
    const userId = getState().auth.user?.id;

    if (userId === undefined) {
      return;
    }

    const seq = ++loadSeq;

    // Without a toast: the menu just lists none meanwhile.
    try {
      const res = await httpRequest({
        getState,
        url: '/event-filters',
        expectedStatus: 200,
        cancelActions: [],
      });

      const items = SavedEventFilterSchema.array().parse(await res.json());

      // The asking user's, and not overtaken by a newer load.
      if (seq === loadSeq && getState().auth.user?.id === userId) {
        dispatch(eventsSavedFiltersSet({ userId, items }));
      }
    } catch (err) {
      console.warn('Saved events filters not loaded', err);
    }
  },
};

export const eventsSavedFilterCreateProcessor: Processor<
  typeof eventsSavedFilterCreate
> = {
  actionCreator: eventsSavedFilterCreate,
  async handle({ getState, dispatch, action, toastError }) {
    if (!getState().auth.user) {
      return;
    }

    const { name, notify, filter } = action.payload;

    trackMatomo([
      'trackEvent',
      'Events',
      'saveFilter',
      notify ? 'notify' : 'silent',
    ]);

    try {
      const res = await httpRequest({
        getState,
        method: 'POST',
        url: '/event-filters',
        data: { name, notify, filter: toSavedFilter(filter) },
        expectedStatus: 200,
        cancelActions: [],
      });

      // Saving applied it too.
      dispatch(
        eventsSavedFilterPicked(
          SavedEventFilterSchema.parse(await res.json()).id,
        ),
      );
    } catch (err) {
      await toastError(
        err,
        loadEventsMessages,
        err instanceof HttpError && err.status === 409
          ? 'savedFiltersFull'
          : 'savedFilterError',
      );
    } finally {
      dispatch(eventsSavedFiltersLoad());
    }
  },
};

export const eventsSavedFilterUpdateProcessor: Processor<
  typeof eventsSavedFilterUpdate
> = {
  actionCreator: eventsSavedFilterUpdate,
  async handle({ getState, dispatch, action, toastError }) {
    if (!getState().auth.user) {
      return;
    }

    const { id, filter, ...patch } = action.payload;

    trackMatomo([
      'trackEvent',
      'Events',
      'updateSavedFilter',
      patch.notify ? 'notify' : 'silent',
    ]);

    try {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: `/event-filters/${id}`,
        data: { ...patch, ...(filter && { filter: toSavedFilter(filter) }) },
        expectedStatus: 200,
        cancelActions: [],
      });
    } catch (err) {
      await toastError(err, loadEventsMessages, 'savedFilterError');
    } finally {
      dispatch(eventsSavedFiltersLoad());
    }
  },
};

export const eventsSavedFilterDeleteProcessor: Processor<
  typeof eventsSavedFilterDelete
> = {
  actionCreator: eventsSavedFilterDelete,
  async handle({ getState, dispatch, action, toastError }) {
    if (!getState().auth.user) {
      return;
    }

    trackMatomo(['trackEvent', 'Events', 'deleteSavedFilter']);

    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/event-filters/${action.payload}`,
        expectedStatus: 204,
        cancelActions: [],
      });
    } catch (err) {
      // Already gone is what was asked for.
      if (!(err instanceof HttpError && err.status === 404)) {
        await toastError(err, loadEventsMessages, 'savedFilterError');
      }
    } finally {
      dispatch(eventsSavedFiltersLoad());
    }
  },
};
