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
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from './actions.js';
import { searchInitialState, searchReducer } from './reducer.js';

/**
 * Pure reducer tests for the search slice. The OSM id fields are derived from
 * the selected result's `id` (an `OsmFeatureId`), and the various load actions
 * keep only one of node/way/relation set at a time.
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
    const state = { ...searchInitialState, query: 'pub', osmNodeId: 5 };

    expect(searchReducer(state, searchClear())).toEqual(searchInitialState);
    expect(searchReducer(state, clearMapFeatures())).toEqual(
      searchInitialState,
    );
  });
});

describe('searchReducer — osm load actions', () => {
  it('osmLoadNode sets only osmNodeId', () => {
    const state = { ...searchInitialState, osmWayId: 9 };

    const next = searchReducer(state, osmLoadNode({ id: 1, focus: true }));

    expect(next.osmNodeId).toBe(1);
    expect(next.osmWayId).toBeNull(); // reset via searchInitialState0
    expect(next.osmRelationId).toBeNull();
  });

  it('osmLoadWay sets only osmWayId', () => {
    const next = searchReducer(
      searchInitialState,
      osmLoadWay({ id: 2, focus: true }),
    );

    expect(next.osmWayId).toBe(2);
    expect(next.osmNodeId).toBeNull();
  });

  it('osmLoadRelation sets only osmRelationId', () => {
    const next = searchReducer(
      searchInitialState,
      osmLoadRelation({ id: 3, focus: true }),
    );

    expect(next.osmRelationId).toBe(3);
  });
});

describe('searchReducer — selectResult derives osm ids', () => {
  it('stores the selected result and bumps searchResultSeq', () => {
    const r = result(osmId('way', 7));

    const next = searchReducer(
      searchInitialState,
      searchSelectResult({ result: r }),
    );

    expect(next.selectedResult).toBe(r);
    expect(next.searchResultSeq).toBe(searchInitialState.searchResultSeq + 1);
  });

  it('derives osmWayId from an osm way result', () => {
    const next = searchReducer(
      searchInitialState,
      searchSelectResult({ result: result(osmId('way', 7)) }),
    );

    expect(next.osmWayId).toBe(7);
    expect(next.osmNodeId).toBeNull();
    expect(next.osmRelationId).toBeNull();
  });

  it('leaves all osm ids null for a non-osm result', () => {
    const next = searchReducer(
      searchInitialState,
      searchSelectResult({ result: result({ type: 'other', id: 'x' }) }),
    );

    expect(next.osmNodeId).toBeNull();
    expect(next.osmWayId).toBeNull();
    expect(next.osmRelationId).toBeNull();
    expect(next.selectedResult).not.toBeNull();
  });

  it('clears the selection and osm ids when passed null', () => {
    const state = { ...searchInitialState, osmNodeId: 5 };

    const next = searchReducer(state, searchSelectResult(null));

    expect(next.selectedResult).toBeNull();
    expect(next.osmNodeId).toBeNull();
  });
});
