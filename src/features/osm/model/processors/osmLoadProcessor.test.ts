import type { RootState } from '@app/store/store.js';
import {
  type SearchResult,
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { loadingResult } from '@features/search/model/resultUtils.js';
import { featureIdsEqual, type OsmFeatureId } from '@shared/types/featureId.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { osmLoad } from '../osmActions.js';
import type { OsmResult } from '../types.js';
import { osmLoadProcessor } from './osmLoadProcessor.js';

vi.mock('../fetchOsmElements.js', () => ({ fetchOsmElements: vi.fn() }));

const { fetchOsmElements } = await import('../fetchOsmElements.js');

const fetchMock = vi.mocked(fetchOsmElements);

/**
 * The processor loads any number of elements in one fetch, so what it has to
 * get right is which of them it answers for: each element is shown, dropped, or
 * reported on its own, out of the one response they share.
 */

const nodeId = (id: number): OsmFeatureId => ({
  type: 'osm',
  elementType: 'node',
  id,
});

const nodeElements = (...ids: number[]): OsmResult => ({
  elements: ids.map((id) => ({
    type: 'node' as const,
    id,
    lat: 48,
    lon: 17,
    tags: { amenity: 'pub' },
  })),
});

/** The shown results, mutable so a dispatch can be played back into them. */
function harness(initial: SearchResult[]) {
  let shown = initial;

  const dispatch = vi.fn((action) => {
    if (searchUnselectResult.match(action)) {
      shown = shown.filter(
        (result) => !featureIdsEqual(result.id, action.payload),
      );
    }

    return action;
  });

  const getState = () =>
    ({
      search: { selectedResults: shown },
      myMaps: {},
    }) as unknown as RootState;

  return {
    dispatch,
    getState,
    toastError: vi.fn(async () => {}),
    remove: (id: OsmFeatureId) => {
      shown = shown.filter((result) => !featureIdsEqual(result.id, id));
    },
    selected: () =>
      dispatch.mock.calls
        .map(([action]) => action)
        .filter(searchSelectResult.match)
        .map((action) => action.payload?.result.id),
  };
}

const run = (h: ReturnType<typeof harness>, ids: OsmFeatureId[]) =>
  osmLoadProcessor.handle?.({
    action: osmLoad({ ids, focus: false, pin: true }),
    prevState: h.getState(),
    getState: h.getState,
    dispatch: h.dispatch,
    toastError: h.toastError,
  });

beforeEach(() => {
  fetchMock.mockReset();
});

describe('osmLoadProcessor', () => {
  it('fetches the whole batch at once and shows every element', async () => {
    const ids = [nodeId(1), nodeId(2), nodeId(3)];

    fetchMock.mockResolvedValue(nodeElements(1, 2, 3));

    const h = harness(ids.map(loadingResult));

    await run(h, ids);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(ids);
    expect(h.selected()).toEqual(ids);
    expect(h.toastError).not.toHaveBeenCalled();
  });

  it('leaves an element taken off the map while the fetch ran off it', async () => {
    // One of a batch going doesn't cancel the fetch — the rest of it is still
    // wanted — so the answer must not put the removed one back on the map.
    const ids = [nodeId(1), nodeId(2)];

    const h = harness(ids.map(loadingResult));

    fetchMock.mockImplementation(async () => {
      h.remove(nodeId(1));

      return nodeElements(1, 2);
    });

    await run(h, ids);

    expect(h.selected()).toEqual([nodeId(2)]);
  });

  it('drops the elements the answer does not hold, and reports them once', async () => {
    const ids = [nodeId(1), nodeId(2), nodeId(3)];

    fetchMock.mockResolvedValue(nodeElements(2));

    const h = harness(ids.map(loadingResult));

    await run(h, ids);

    expect(h.selected()).toEqual([nodeId(2)]);

    expect(
      h.dispatch.mock.calls
        .map(([action]) => action)
        .filter(searchUnselectResult.match)
        .map((action) => action.payload),
    ).toEqual([nodeId(1), nodeId(3)]);

    expect(h.toastError).toHaveBeenCalledTimes(1);
  });

  it('drops only the element whose geometry does not add up', async () => {
    // A truncated answer leaves a way without the nodes it is made of, which
    // throws where it is assembled — the rest of the batch is fine and must
    // still land on the map.
    const ids = [
      nodeId(1),
      { type: 'osm', elementType: 'way', id: 9 } as const,
    ];

    fetchMock.mockResolvedValue({
      elements: [
        ...nodeElements(1).elements,
        { type: 'way', id: 9, nodes: [101, 102], tags: {} },
      ],
    });

    const h = harness(ids.map(loadingResult));

    await run(h, [...ids]);

    expect(h.selected()).toEqual([nodeId(1)]);
    expect(h.toastError).toHaveBeenCalledTimes(1);
  });

  it('takes the placeholders off when the fetch itself fails', async () => {
    const ids = [nodeId(1), nodeId(2)];

    fetchMock.mockRejectedValue(new Error('nope'));

    const h = harness(ids.map(loadingResult));

    await run(h, ids);

    expect(h.selected()).toEqual([]);

    expect(
      h.dispatch.mock.calls
        .map(([action]) => action)
        .filter(searchUnselectResult.match),
    ).toHaveLength(2);

    expect(h.toastError).toHaveBeenCalledTimes(1);
  });
});
