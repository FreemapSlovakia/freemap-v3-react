import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isCompleteLine } from '../reducers/drawingLinesReducer.js';

/** Whether the selected line is one that never got enough points to be one. */
function partialLineSelected(state: RootState): boolean {
  const { selection } = state.main;

  const lineIndex =
    selection?.type === 'draw-line-poly'
      ? selection.id
      : selection?.type === 'line-point'
        ? selection.lineIndex
        : undefined;

  if (lineIndex === undefined) {
    return false;
  }

  const line = state.drawingLines.lines[lineIndex];

  return !line || !isCompleteLine(line);
}

/**
 * A drawing that ended with too few points to be a line is discarded. Clearing
 * the selection is what discards it — `selectFeature` drops every incomplete
 * line — and it has to go anyway, or it would address a line that is no longer
 * there.
 */
export const drawingDiscardPartialLineProcessor: Processor = {
  // The flag changed and is now off, so the drawing has just ended — whatever
  // ended it.
  stateChangePredicate: (state) => state.drawingLines.drawing,
  statePredicate: (state) =>
    !state.drawingLines.drawing && partialLineSelected(state),
  handle: ({ dispatch }) => {
    dispatch(selectFeature(null));
  },
};
