import type { Selection } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import type { Feature } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import { dataViewerExplodeTrack, dataViewerSplitTrack } from '../actions.js';
import { dataViewerSplitSelectionProcessor } from './dataViewerSplitSelectionProcessor.js';

const state = (features: number, selection: Selection | null) =>
  ({
    trackViewer: {
      trackGeojson: {
        type: 'FeatureCollection',
        features: Array.from({ length: features }, () => ({}) as Feature),
      },
    },
    main: { selection },
  }) as unknown as RootState;

const run = (
  action: ReturnType<
    typeof dataViewerSplitTrack | typeof dataViewerExplodeTrack
  >,
  before: number,
  after: number,
  selection: Selection,
) => {
  const dispatch = vi.fn();

  void dataViewerSplitSelectionProcessor.handle!({
    prevState: state(before, selection),
    getState: () => state(after, selection),
    dispatch,
    action,
    toastError: vi.fn(),
  });

  return dispatch.mock.calls[0]?.[0]?.payload;
};

describe('the selection across a cut', () => {
  const split = dataViewerSplitTrack({
    featureIndex: 1,
    segmentIndex: 0,
    pointIndex: 3,
  });

  it('moves a later feature down by what was added', () => {
    expect(
      run(dataViewerExplodeTrack(1), 3, 5, { type: 'feature', id: 2 }),
    ).toEqual({ type: 'feature', id: 4 });
  });

  it('selects the cut feature as its first piece', () => {
    expect(
      run(split, 3, 4, { type: 'vertex', id: 1, part: 0, vertex: 3 }),
    ).toEqual({ type: 'feature', id: 1 });
  });

  it('leaves an earlier feature, and a cut that cut nothing, alone', () => {
    expect(run(split, 3, 4, { type: 'feature', id: 0 })).toBeUndefined();

    expect(run(split, 3, 3, { type: 'feature', id: 2 })).toBeUndefined();
  });
});
