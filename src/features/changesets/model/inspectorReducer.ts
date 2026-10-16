import { clearMapFeatures } from '@app/store/actions.js';
import { setDetailsShown } from '@features/objects/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { featureIdsEqual } from '@shared/types/featureId.js';
import {
  type Changeset,
  changesetsInspect,
  changesetsReturnToHistory,
  changesetsSetHistoryVersions,
  changesetsSetInspected,
  changesetsShowHistory,
  type DiffSource,
  type HistoryOf,
  type HistoryVersion,
} from './actions.js';
import type { DiffElement } from './changesetDiff.js';

/**
 * An inspection and the element history it may be led into from: neither
 * needs the Map changes tool, so its slice isn't reset with the tool's list.
 */
export interface ChangesetInspectorState {
  /** The changeset whose changes are on the map; `null`s while loading. */
  inspected: {
    id: number;
    changeset: Changeset | null;
    diff: DiffElement[] | null;
    /** Where the diff came from; `null` while it loads. */
    source: DiffSource | null;
    /** Why it `failed`. */
    error?: string;
  } | null;
  /**
   * The element whose versions lead into inspections: listed in its details
   * toast, drilled into in the inspector's, with its element selected.
   */
  history:
    | (HistoryOf & {
        /** Kept for drilling back to them. */
        versions?: HistoryVersion[];
        /** Why they couldn't be read. */
        error?: string;
      })
    | null;
}

export const initialState: ChangesetInspectorState = {
  inspected: null,
  history: null,
};

export const changesetInspectorReducer = createReducer(
  initialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => initialState)
      .addCase(changesetsReturnToHistory, (state, { payload }) => {
        state.inspected = null;

        if (state.history) {
          // Maybe another way to it now, its object gone from the layer.
          state.history.selection = payload.selection;
        }
      })
      .addCase(changesetsShowHistory, (state, action) => {
        state.history = action.payload;

        // Opened anew, none of its versions is inspected yet.
        if (action.payload) {
          state.inspected = null;
        }
      })
      .addCase(changesetsSetHistoryVersions, (state, { payload }) => {
        if (state.history && featureIdsEqual(state.history.id, payload.id)) {
          if ('versions' in payload) {
            state.history.versions = payload.versions;
          } else {
            state.history.error = payload.error;
          }
        }
      })
      // Its details closed (× or their toggle): the whole drill goes with them.
      .addCase(setDetailsShown, (state, action) => {
        if (!action.payload && state.history) {
          state.history = null;

          state.inspected = null;
        }
      })
      .addCase(changesetsInspect, (state, action) => {
        // One from the map or a link isn't under it, even among its versions.
        if (action.payload !== null && !action.meta.fromHistory) {
          state.history = null;
        }

        state.inspected =
          action.payload === null
            ? null
            : {
                id: action.payload,
                changeset: null,
                diff: null,
                source: null,
              };
      })
      .addCase(changesetsSetInspected, (state, { payload }) => {
        if (state.inspected?.id === payload.changeset.id) {
          Object.assign(state.inspected, payload);
        }
      }),
);
