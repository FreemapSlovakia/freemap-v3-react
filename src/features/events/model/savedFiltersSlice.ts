import type { RootState } from '@app/store/store.js';
import { authLogout } from '@features/auth/model/actions.js';
import { createAction, createReducer, createSelector } from '@reduxjs/toolkit';
import { type EventsFilter, isFilterEmpty, sameFilter } from './filter.js';
import { fromSavedFilter, type SavedEventFilter } from './savedFilters.js';

/** Fetches the user's saved filters. */
export const eventsSavedFiltersLoad = createAction('EVENTS_SAVED_FILTERS_LOAD');

export const eventsSavedFiltersSet = createAction<{
  userId: number;
  items: SavedEventFilter[];
}>('EVENTS_SAVED_FILTERS_SET');

/** Saves a filter under a name. */
export const eventsSavedFilterCreate = createAction<{
  name: string;
  notify: boolean;
  filter: EventsFilter;
}>('EVENTS_SAVED_FILTER_CREATE');

/** Changes a saved filter, its name or its emails. */
export const eventsSavedFilterUpdate = createAction<{
  id: number;
  name?: string;
  notify?: boolean;
  filter?: EventsFilter;
}>('EVENTS_SAVED_FILTER_UPDATE');

export const eventsSavedFilterDelete = createAction<number>(
  'EVENTS_SAVED_FILTER_DELETE',
);

/** A saved filter was applied or saved, so the layer shows it by name; null lets go. */
export const eventsSavedFilterPicked = createAction<number | null>(
  'EVENTS_SAVED_FILTER_PICKED',
);

export interface EventsSavedFiltersState {
  /** Whose the list is; another user's must not show. */
  userId: number | null;
  /** By name; null until loaded. */
  items: SavedEventFilter[] | null;
  /** The one last applied or saved; it names the filter while that is unchanged. */
  pickedId: number | null;
}

const initialState: EventsSavedFiltersState = {
  userId: null,
  items: null,
  pickedId: null,
};

const byName = (items: SavedEventFilter[]) =>
  items.toSorted((a, b) => a.name.localeCompare(b.name) || a.id - b.id);

export const eventsSavedFiltersReducer = createReducer(
  initialState,
  (builder) =>
    builder
      // The pick stays: ids are unique, so another user's never matches.
      .addCase(eventsSavedFiltersSet, (state, { payload }) => {
        state.userId = payload.userId;

        state.items = byName(payload.items);
      })
      .addCase(eventsSavedFilterPicked, (state, { payload }) => {
        state.pickedId = payload;
      })
      .addCase(authLogout, () => initialState),
);

/** The logged-in user's saved filters; null until loaded or logged out. */
export const selectSavedFilters = (state: RootState) =>
  state.auth.user && state.eventsSavedFilters.userId === state.auth.user.id
    ? state.eventsSavedFilters.items
    : null;

/**
 * The saved filter the layer applies as it is: the one picked, or else one
 * equal to it. An empty one only when picked, or it would name the unfiltered layer.
 */
export const selectAppliedSavedFilter = createSelector(
  [
    (state: RootState) => state.events.filter,
    selectSavedFilters,
    (state: RootState) => state.eventsSavedFilters.pickedId,
  ],
  (filter, items, pickedId) => {
    const applies = (saved: SavedEventFilter, f: EventsFilter) =>
      sameFilter(f, fromSavedFilter(saved.filter));

    const picked = items?.find((saved) => saved.id === pickedId);

    // Its fixed dates aside, which it saves without.
    if (
      picked &&
      applies(picked, { ...filter, from: undefined, to: undefined })
    ) {
      return picked;
    }

    return isFilterEmpty(filter)
      ? undefined
      : items?.find((saved) => applies(saved, filter));
  },
);
