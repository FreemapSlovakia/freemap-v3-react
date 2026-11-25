import { createReducer } from '@reduxjs/toolkit';
import {
  type MyMapsOwnerFilter,
  type MyMapsSort,
  mapsSetOwnerFilter,
  mapsSetSort,
  mapsToggleHiddenTag,
} from './actions.js';

export interface MyMapsSettingsState {
  sort: MyMapsSort;
  ownerFilter: MyMapsOwnerFilter;
  /** A map with any of these is left out of the list, whatever is picked. */
  // TODO never pruned: a tag gone from every map stays hidden, unlisted in the
  // menu, and hides a map tagged with it again later. Per browser, not account.
  hiddenTags: string[];
}

export const myMapsSettingsInitialState: MyMapsSettingsState = {
  sort: 'name',
  ownerFilter: 'all',
  hiddenTags: [],
};

export const myMapsSettingsReducer = createReducer(
  myMapsSettingsInitialState,
  (builder) =>
    builder
      .addCase(mapsSetSort, (state, { payload }) => {
        state.sort = payload;
      })
      .addCase(mapsSetOwnerFilter, (state, { payload }) => {
        state.ownerFilter = payload;
      })
      .addCase(mapsToggleHiddenTag, (state, { payload }) => {
        state.hiddenTags = state.hiddenTags.includes(payload)
          ? state.hiddenTags.filter((tag) => tag !== payload)
          : [...state.hiddenTags, payload];
      }),
);
