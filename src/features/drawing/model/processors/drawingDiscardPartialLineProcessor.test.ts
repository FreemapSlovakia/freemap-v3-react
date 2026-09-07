import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import type { Point } from '../actions/drawingLineActions.js';
import { drawingDiscardPartialLineProcessor } from './drawingDiscardPartialLineProcessor.js';

/**
 * The predicates only read the drawing flag, `main.selection` and the selected
 * line's points, so a minimal cast state is enough.
 */
const state = (drawing: boolean, pointCount: number): RootState =>
  ({
    main: { selection: { type: 'draw-line-poly', id: 0 } },
    drawingLines: {
      drawing,
      lines: [
        {
          type: 'line',
          points: Array.from(
            { length: pointCount },
            (_, id): Point => ({ id, lat: id, lon: id }),
          ),
        },
      ],
    },
  }) as unknown as RootState;

const { statePredicate, stateChangePredicate } =
  drawingDiscardPartialLineProcessor;

describe('drawingDiscardPartialLineProcessor', () => {
  it('runs on the drawing flag changing, whatever changed it', () => {
    expect(stateChangePredicate?.(state(true, 1))).toBe(true);
    expect(stateChangePredicate?.(state(false, 1))).toBe(false);
  });

  it('discards a drawing that ended with too few points to be a line', () => {
    expect(statePredicate?.(state(false, 1))).toBe(true);
  });

  it('keeps a line that is one', () => {
    expect(statePredicate?.(state(false, 2))).toBe(false);
  });

  it('leaves a drawing that is starting alone', () => {
    expect(statePredicate?.(state(true, 1))).toBe(false);
  });
});
