import { isToolOpen } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { createSelector } from 'reselect';
import { type DiffElement, elementKey, hasBbox } from './changesetDiff.js';

/**
 * The changesets found, and the inspected one where a link brought it from
 * outside them — but not an empty one, which has no place on the map.
 */
export const listedChangesetsSelector = createSelector(
  (state: RootState) => state.changesets.changesets,
  (state: RootState) => state.changesetInspector.inspected?.changeset,
  (changesets, inspected) =>
    inspected &&
    hasBbox(inspected) &&
    !changesets.some((changeset) => changeset.id === inspected.id)
      ? [...changesets, inspected]
      : changesets,
);

/** The inspected changeset's elements by `elementKey`, built once per diff. */
const diffByKeySelector = createSelector(
  (state: RootState) => state.changesetInspector.inspected?.diff,
  (diff) =>
    new Map<string, DiffElement>(
      diff?.map((element) => [elementKey(element), element]),
    ),
);

/** The selected element of the inspected changeset, if one is. */
export const selectedDiffElementSelector = (
  state: RootState,
): DiffElement | undefined => {
  const { selection } = state.main;

  return selection?.type === 'changeset-element'
    ? diffByKeySelector(state).get(selection.id)
    : undefined;
};

/** Inspected without the tool open, the one changeset there is of it. */
export const loneInspectionSelector = (state: RootState): boolean =>
  state.changesetInspector.inspected !== null &&
  !isToolOpen(state, 'changesets');
