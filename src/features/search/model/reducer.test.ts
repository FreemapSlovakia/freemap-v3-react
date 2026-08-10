import { clearMapFeatures } from '@app/store/actions.js';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
import type { FeatureId } from '@shared/types/featureId.js';
import { describe, expect, it } from 'vitest';
import {
  type SearchResult,
  searchClear,
  searchKeepResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
  searchUnselectResult,
} from './actions.js';
import { searchInitialState, searchReducer } from './reducer.js';
import { hasGeometry } from './resultUtils.js';

/**
 * Pure reducer tests for the search slice. Any number of results can be shown
 * on the map at once — one of them transiently, the rest because they were
 * kept. Which one is the active one lives in `main`, so this slice only
 * answers what is shown, in which order, and at which tier.
 */

const result = (id: FeatureId): SearchResult => ({
  source: 'osm' as never,
  geojson: {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: {},
  },
  id,
});

const osmId = (elementType: 'node' | 'way' | 'relation', id: number) =>
  ({ type: 'osm', elementType, id }) as const;

describe('searchReducer — query & results', () => {
  it('setQuery stores the query string', () => {
    const next = searchReducer(
      searchInitialState,
      searchSetQuery({ query: 'pub' }),
    );

    expect(next.query).toBe('pub');
  });

  it('setResults stores results and bumps searchSeq', () => {
    const next = searchReducer(
      searchInitialState,
      searchSetResults([result(osmId('node', 1))]),
    );

    expect(next.results).toHaveLength(1);
    expect(next.searchSeq).toBe(searchInitialState.searchSeq + 1);
  });

  it('searchClear / clearMapFeatures reset to initial', () => {
    const state = {
      ...searchInitialState,
      query: 'pub',
      selectedResults: [result(osmId('node', 5))],
    };

    expect(searchReducer(state, searchClear())).toEqual(searchInitialState);
    expect(searchReducer(state, clearMapFeatures())).toEqual(
      searchInitialState,
    );
  });
});

describe('searchReducer — osm load actions', () => {
  it('shows a geometry-less placeholder for the element being loaded', () => {
    const next = searchReducer(
      searchInitialState,
      osmLoadNode({ id: 1, focus: true }),
    );

    expect(next.selectedResults).toHaveLength(1);
    expect(next.selectedResults[0].id).toEqual(osmId('node', 1));
    expect(hasGeometry(next.selectedResults[0])).toBe(false);
    expect(next.previewId).toEqual(osmId('node', 1));
    expect(next.searchResultSeq).toBe(searchInitialState.searchResultSeq + 1);
  });

  it('keeps an element the URL asks for rather than previewing it', () => {
    const next = searchReducer(
      searchInitialState,
      osmLoadNode({ id: 1, focus: true, pin: true }),
    );

    expect(next.selectedResults).toHaveLength(1);
    expect(next.previewId).toBeNull();
  });

  it('loads several kept elements side by side', () => {
    let state = searchReducer(
      searchInitialState,
      osmLoadWay({ id: 2, focus: true, pin: true }),
    );

    state = searchReducer(
      state,
      osmLoadRelation({ id: 3, focus: true, pin: true }),
    );

    expect(state.selectedResults.map(({ id }) => id)).toEqual([
      osmId('way', 2),
      osmId('relation', 3),
    ]);
  });

  it('a second previewed element takes the place of the first', () => {
    let state = searchReducer(
      searchInitialState,
      osmLoadWay({ id: 2, focus: true }),
    );

    state = searchReducer(state, osmLoadRelation({ id: 3, focus: true }));

    expect(state.selectedResults.map(({ id }) => id)).toEqual([
      osmId('relation', 3),
    ]);
  });

  it('leaves an element that is already shown alone', () => {
    const shown = result(osmId('way', 2));

    const next = searchReducer(
      { ...searchInitialState, selectedResults: [shown] },
      osmLoadWay({ id: 2, focus: true }),
    );

    expect(next.selectedResults).toEqual([shown]);
    expect(next.searchResultSeq).toBe(searchInitialState.searchResultSeq);
  });
});

describe('searchReducer — selecting results', () => {
  it('shows the result and bumps searchResultSeq', () => {
    const r = result(osmId('way', 7));

    const next = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    expect(next.selectedResults).toEqual([r]);
    expect(next.searchResultSeq).toBe(searchInitialState.searchResultSeq + 1);
  });

  it('previews one result at a time, replacing the previous preview', () => {
    const first = result(osmId('way', 7));

    const second = result(osmId('node', 8));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: first }),
    );

    state = searchReducer(state, searchSelectResult({ result: second }));

    expect(state.selectedResults).toEqual([second]);
    expect(state.previewId).toEqual(osmId('node', 8));
  });

  it('leaves kept results alone when another is previewed', () => {
    const kept = result(osmId('way', 7));

    const previewed = result(osmId('node', 8));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: kept }),
    );

    state = searchReducer(state, searchKeepResult({ id: kept.id, keep: true }));

    state = searchReducer(state, searchSelectResult({ result: previewed }));

    expect(state.selectedResults).toEqual([kept, previewed]);
    expect(state.previewId).toEqual(osmId('node', 8));
  });

  it('picking a kept result again leaves it kept', () => {
    const r = result(osmId('way', 7));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    state = searchReducer(state, searchKeepResult({ id: r.id, keep: true }));

    state = searchReducer(state, searchSelectResult({ result: r }));

    expect(state.selectedResults).toEqual([r]);
    expect(state.previewId).toBeNull();
  });

  it('`keep` upgrades a result without moving it between tiers', () => {
    const kept = result(osmId('way', 7));

    const previewed = result(osmId('node', 8));

    const loaded = { ...kept, displayName: 'loaded' };

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: kept }),
    );

    state = searchReducer(state, searchKeepResult({ id: kept.id, keep: true }));

    state = searchReducer(state, searchSelectResult({ result: previewed }));

    state = searchReducer(
      state,
      searchSelectResult({ result: loaded, tier: 'keep' }),
    );

    expect(state.selectedResults).toEqual([loaded, previewed]);
    expect(state.previewId).toEqual(osmId('node', 8));
  });

  it('shows nothing when passed null', () => {
    const state = {
      ...searchInitialState,
      selectedResults: [result(osmId('node', 5))],
    };

    const next = searchReducer(state, searchSelectResult(null));

    expect(next.selectedResults).toEqual([]);
    expect(next.previewId).toBeNull();
  });

  it('unselects one result, leaving the rest shown', () => {
    const first = result(osmId('way', 7));

    const second = result(osmId('node', 8));

    const next = searchReducer(
      {
        ...searchInitialState,
        selectedResults: [first, second],
        previewId: osmId('way', 7),
      },
      searchUnselectResult(osmId('way', 7)),
    );

    expect(next.selectedResults).toEqual([second]);
    expect(next.previewId).toBeNull();
    expect(next.searchResultSeq).toBe(searchInitialState.searchResultSeq + 1);
  });

  it('hands a result no longer kept back to the preview place', () => {
    const kept = result(osmId('way', 7));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: kept }),
    );

    state = searchReducer(state, searchKeepResult({ id: kept.id, keep: true }));

    state = searchReducer(
      state,
      searchKeepResult({ id: kept.id, keep: false }),
    );

    expect(state.selectedResults).toEqual([kept]);
    expect(state.previewId).toEqual(osmId('way', 7));
  });

  it('keeping the previewed result stops it being transient', () => {
    const r = result(osmId('way', 7));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    expect(state.previewId).toEqual(osmId('way', 7));

    state = searchReducer(state, searchKeepResult({ id: r.id, keep: true }));

    expect(state.selectedResults).toEqual([r]);
    expect(state.previewId).toBeNull();
  });

  it('ignores keeping a result that is not shown', () => {
    expect(
      searchReducer(
        searchInitialState,
        searchKeepResult({ id: osmId('way', 7), keep: true }),
      ),
    ).toEqual(searchInitialState);
  });

  it('ignores unselecting a result that is not shown', () => {
    const state = {
      ...searchInitialState,
      selectedResults: [result(osmId('way', 7))],
    };

    expect(
      searchReducer(state, searchUnselectResult(osmId('node', 8))),
    ).toEqual(state);
  });
});
