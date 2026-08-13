import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
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
  searchKeepResults,
  searchSelectResult,
  searchSetHover,
  searchSetQuery,
  searchSetResults,
  searchUnselectResult,
  searchUnsetHover,
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

  it('setResults stores the results', () => {
    const next = searchReducer(
      searchInitialState,
      searchSetResults([result(osmId('node', 1))]),
    );

    expect(next.results).toHaveLength(1);
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
  });
});

describe('searchReducer — pointing at a result', () => {
  it('holds the result the pointer rests on, and lets it go', () => {
    const r = result(osmId('way', 7));

    const state = searchReducer(searchInitialState, searchSetHover(r));

    expect(state.hoverResult).toBe(r);
    // Pointing at a result shows it and says nothing else about it.
    expect(state.selectedResults).toEqual([]);
    expect(state.previewId).toBeNull();

    expect(searchReducer(state, searchSetHover(null)).hoverResult).toBeNull();
  });

  it('leaves the shown row alone when another is let go of', () => {
    // The pointer and the keyboard focus rest on different rows and hand over
    // in either order, so a row leaving says nothing about the one shown.
    const pointed = result(osmId('way', 7));

    const state = searchReducer(
      { ...searchInitialState, hoverResult: pointed },
      searchUnsetHover(osmId('node', 8)),
    );

    expect(state.hoverResult).toBe(pointed);

    expect(
      searchReducer(state, searchUnsetHover(osmId('way', 7))).hoverResult,
    ).toBeNull();
  });

  it('lets go when the list it points into is replaced', () => {
    const state = searchReducer(
      { ...searchInitialState, hoverResult: result(osmId('way', 7)) },
      searchSetResults([]),
    );

    expect(state.hoverResult).toBeNull();
  });

  it('lets go when a result is picked — the list closes under the pointer', () => {
    const r = result(osmId('way', 7));

    const state = searchReducer(
      { ...searchInitialState, hoverResult: r },
      searchSelectResult({ result: r }),
    );

    expect(state.hoverResult).toBeNull();
  });
});

describe('searchReducer — selecting results', () => {
  it('shows the result', () => {
    const r = result(osmId('way', 7));

    const next = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    expect(next.selectedResults).toEqual([r]);
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

    state = searchReducer(state, searchKeepResult(kept.id));

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

    state = searchReducer(state, searchKeepResult(r.id));

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

    state = searchReducer(state, searchKeepResult(kept.id));

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
  });

  it('takes a batch of results, all of them kept', () => {
    const state = searchReducer(
      searchInitialState,
      searchKeepResults([result(osmId('way', 7)), result(osmId('node', 8))]),
    );

    expect(state.selectedResults.map(({ id }) => id)).toEqual([
      osmId('way', 7),
      osmId('node', 8),
    ]);

    expect(state.previewId).toBeNull();
    // The batch is not the result list; that holds whatever it held.
    expect(state.results).toEqual([]);
  });

  it('leaves a result the batch names alone, but stops it being transient', () => {
    const loaded = { ...result(osmId('way', 7)), displayName: 'loaded' };

    const state = searchReducer(
      {
        ...searchInitialState,
        selectedResults: [loaded],
        previewId: osmId('way', 7),
      },
      searchKeepResults([result(osmId('way', 7))]),
    );

    expect(state.selectedResults).toEqual([loaded]);
    expect(state.previewId).toBeNull();
  });

  it('keeping the previewed result stops it being transient', () => {
    const r = result(osmId('way', 7));

    let state = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    expect(state.previewId).toEqual(osmId('way', 7));

    state = searchReducer(state, searchKeepResult(r.id));

    expect(state.selectedResults).toEqual([r]);
    expect(state.previewId).toBeNull();
  });

  it('ignores keeping a result that is not shown', () => {
    expect(
      searchReducer(searchInitialState, searchKeepResult(osmId('way', 7))),
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

describe('searchReducer — a map opening', () => {
  const loaded = (results: SearchResult[], merge?: boolean) =>
    mapsLoaded({
      merge,
      meta: {} as never,
      data: { search: { results: results as never } },
    });

  it('shows the results the map carries', () => {
    const state = searchReducer(
      searchInitialState,
      loaded([result(osmId('node', 1))]),
    );

    expect(state.selectedResults).toEqual([result(osmId('node', 1))]);
    expect(state.previewId).toBeNull();
  });

  it('replaces what the map before it was showing', () => {
    const before = {
      ...searchInitialState,
      selectedResults: [result(osmId('way', 7))],
      previewId: osmId('way', 7),
    };

    const state = searchReducer(before, loaded([result(osmId('node', 1))]));

    expect(state.selectedResults).toEqual([result(osmId('node', 1))]);
    expect(state.previewId).toBeNull();
  });

  it('a map carrying an empty list takes the pins off', () => {
    const before = {
      ...searchInitialState,
      selectedResults: [result(osmId('way', 7))],
    };

    expect(searchReducer(before, loaded([])).selectedResults).toEqual([]);
  });

  // A map saved before pins were stored says nothing about them, so it must not
  // take off what the URL restored — the loads it started land after this.
  it('a map that says nothing about pins leaves them alone', () => {
    const before = {
      ...searchInitialState,
      selectedResults: [result(osmId('way', 7))],
      previewId: osmId('way', 7),
    };

    expect(
      searchReducer(before, mapsLoaded({ meta: {} as never, data: {} })),
    ).toEqual(before);
  });

  // A map carries no previewed result, so one it names is kept — leaving it
  // transient would have the next thing looked at take it off again.
  it('merging keeps a result it names that was only being looked at', () => {
    const shown = result(osmId('way', 7));

    const before = {
      ...searchInitialState,
      selectedResults: [shown],
      previewId: osmId('way', 7),
    };

    const state = searchReducer(
      before,
      loaded([result(osmId('way', 7))], true),
    );

    expect(state.selectedResults).toEqual([shown]);
    expect(state.previewId).toBeNull();
  });

  it('merging adds what is not shown and leaves the rest alone', () => {
    const shown = result(osmId('way', 7));

    const before = { ...searchInitialState, selectedResults: [shown] };

    const state = searchReducer(
      before,
      loaded([result(osmId('way', 7)), result(osmId('node', 1))], true),
    );

    expect(state.selectedResults).toEqual([shown, result(osmId('node', 1))]);
  });
});
