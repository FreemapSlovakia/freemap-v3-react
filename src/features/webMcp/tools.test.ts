import { readFileSync } from 'node:fs';
import type { MyStore, RootState } from '@app/store/store.js';
import { objectCategories } from '@features/objects/objectCategories.js';
import { routeKey } from '@features/routePlanner/model/actions.js';
import { elevationStats } from '@shared/geoutils.js';
import { describe, expect, it, vi } from 'vitest';

// The tag-to-name mappings are generated files loaded by dynamic import; the
// naming they drive is their own concern, not these tools'.
// Synthetic terrain, so the derivatives have a known answer. Eastward by
// default; a test wanting another shape swaps `terrain`.
let terrain = ([, lon]: [number, number]) =>
  Math.round(lon * 111320 * Math.cos(0.85)) % 100000;

vi.mock('@shared/elevation.js', () => ({
  fetchElevations: async (pts: [number, number][]) =>
    pts.map((p) => terrain(p)),
}));

vi.mock('@app/httpRequest.js', () => ({
  httpRequest: async ({ url }: { url: string }) => {
    lastOsmApiQuery = new URLSearchParams(url.slice(url.indexOf('?') + 1));

    return {
      json: async () => ({
        truncated: false,
        features: [
          {
            type: 'Feature',
            id: 'node/1',
            bbox: [19.5, 48.5, 19.5, 48.5],
            geometry: { type: 'Point', coordinates: [19.5, 48.5] },
            properties: { name: 'Jaskyňa', natural: 'cave_entrance' },
          },
        ],
      }),
    };
  },
}));

let lastOsmApiQuery = new URLSearchParams();

vi.mock('@shared/saveBlob.js', () => ({
  saveBlob: async (blob: Blob, name: string) => {
    saved = { name, bytes: blob.size };
  },
}));

let saved: { name: string; bytes: number } | undefined;

vi.mock('@osm/osmNameResolver.js', () => ({
  getOsmMapping: async () => ({
    osmTagToNameMapping: {
      amenity: { drinking_water: 'Drinking water' },
      natural: { cave_entrance: 'Cave entrance' },
    },
    colorNames: {},
  }),
  getGenericNameFromOsmElementSync: () => '',
  getNameFromOsmElement: (tags: Record<string, string>) => tags['name'] ?? '',
}));

import { fetchObjects } from '@features/objects/objectsQuery.js';
import z from 'zod';
import { defineTool } from './tool.js';
import { drawingTools } from './tools/drawingTools.js';
import { guideTools } from './tools/guideTools.js';
import { mapTools } from './tools/mapTools.js';
import { objectTools } from './tools/objectTools.js';
import { routeTools } from './tools/routeTools.js';
import { searchTools } from './tools/searchTools.js';
import { terrainTools } from './tools/terrainTools.js';

function fakeStore(initial: unknown) {
  const listeners = new Set<() => void>();

  let state = initial as RootState;

  const dispatched: unknown[] = [];

  return {
    dispatched,
    // Merges, so a test that advances one slice keeps the rest of the state it
    // started from.
    setState(next: object) {
      state = { ...state, ...next } as RootState;

      for (const l of listeners) {
        l();
      }
    },
    store: {
      getState: () => state,
      dispatch: (action: unknown) => {
        dispatched.push(action);

        return action;
      },
      subscribe: (l: () => void) => {
        listeners.add(l);

        return () => listeners.delete(l);
      },
    } as unknown as MyStore,
  };
}

const ctx = (store: MyStore) => ({ store });

function text(result: ModelContextToolResult) {
  return result.content[0].text;
}

describe('defineTool', () => {
  const tool = defineTool({
    name: 'x',
    description: 'd',
    input: z.object({ n: z.number() }),
    execute: ({ n }) => ({ doubled: n * 2 }),
  });

  it('derives a JSON schema', () => {
    expect(tool.inputSchema).toMatchObject({
      type: 'object',
      properties: { n: { type: 'number' } },
      required: ['n'],
    });
  });

  it('rejects bad arguments without running the body', async () => {
    const result = await tool.execute({ n: 'x' }, ctx({} as MyStore));

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('Invalid arguments');
  });

  it('JSON-encodes what the body returns', async () => {
    expect(text(await tool.execute({ n: 21 }, ctx({} as MyStore)))).toBe(
      '{"doubled":42}',
    );
  });

  it('turns a throw into an error result', async () => {
    const boom = defineTool({
      name: 'b',
      description: 'd',
      input: z.object({}),
      execute: () => {
        throw new Error('nope');
      },
    });

    const result = await boom.execute({}, ctx({} as MyStore));

    expect(result.isError).toBe(true);
    expect(text(result)).toBe('nope');
  });
});

describe('map tools', () => {
  const state = {
    map: {
      lat: 48.7,
      lon: 19.1,
      zoom: 12,
      layers: ['X', 'I'],
      bounds: [18, 48, 20, 49],
      customLayers: [],
      cachedMaps: [],
    },
  };

  it('reports the view', async () => {
    const { store } = fakeStore(state);

    const tool = mapTools.find((t) => t.name === 'get-map-view')!;

    expect(JSON.parse(text(await tool.execute({}, ctx(store))))).toMatchObject({
      center: { lat: 48.7, lon: 19.1 },
      zoom: 12,
      bounds: { west: 18, south: 48, east: 20, north: 49 },
      layers: ['X', 'I'],
    });
  });

  it('lists layers with their codes', async () => {
    const { store } = fakeStore(state);

    const tool = mapTools.find((t) => t.name === 'list-map-layers')!;

    const layers = JSON.parse(text(await tool.execute({}, ctx(store))));

    expect(layers.find((l: { code: string }) => l.code === 'X')).toMatchObject({
      kind: 'base',
    });
  });

  it('turns off an overlay that is on and refuses an unknown code', async () => {
    const { store, dispatched } = fakeStore(state);

    const tool = mapTools.find((t) => t.name === 'set-map-layers')!;

    await tool.execute({ overlays: [] }, ctx(store));

    expect(dispatched).toEqual([
      { type: 'MAP_TOGGLE_LAYER', payload: { type: 'I', enable: false } },
    ]);

    expect((await tool.execute({ base: 'nope' }, ctx(store))).isError).toBe(
      true,
    );
  });
});

describe('search-places', () => {
  it('waits for the results of its own query', async () => {
    const { store, setState } = fakeStore({
      search: { query: '', results: [], more: false },
      toasts: { toasts: {} },
      l10n: { language: 'en' },
    });

    const tool = searchTools.find((t) => t.name === 'search-places')!;

    const promise = tool.execute({ query: 'Bratislava' }, ctx(store));

    // a stale answer for the previous query must not be read as this one's
    setState({
      toasts: { toasts: {} },
      search: {
        query: '',
        results: [{ id: 1, displayName: 'old' }],
        more: false,
      },
    });

    setState({
      search: {
        query: 'Bratislava',
        results: [
          {
            id: { type: 'osm', elementType: 'node', id: 1 },
            displayName: 'Bratislava',
            geojson: {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [17.1, 48.1] },
              properties: {},
            },
            source: 'nominatim-forward',
          },
        ],
        more: false,
      },
    });

    const answer = JSON.parse(text(await promise));

    expect(answer.results).toHaveLength(1);
    expect(answer.results[0]).toMatchObject({
      name: 'Bratislava',
      lat: 48.1,
      lon: 17.1,
    });
  });
});

describe('get-app-guide', () => {
  const llms = readFileSync('src/static/llms.txt', 'utf8');

  const tool = guideTools[0];

  it('lists the sections of the real llms.txt', async () => {
    vi.stubGlobal('fetch', async () => new Response(llms));

    const listing = JSON.parse(
      text(await tool.execute({}, ctx({} as MyStore))),
    );

    expect(listing.sections).toContain('In-page agent tools (WebMCP)');
    expect(listing.summary).toContain('Freemap.sk');
  });

  it('returns one section with its subsections', async () => {
    vi.stubGlobal('fetch', async () => new Response(llms));

    const body = text(
      await tool.execute({ section: 'Deep links' }, ctx({} as MyStore)),
    );

    expect(body).toContain('## Deep links (building map URLs)');
    expect(body).not.toContain('## Map Layers');
  });
});

describe('drawing tools', () => {
  const state = {
    drawingSettings: { style: { color: '#f00', markerType: 'pin', width: 3 } },
    drawingPoints: { points: [{ coords: { lat: 1, lon: 2 } }] },
    drawingLines: { lines: [] },
  };

  it('adds a marker after the ones already drawn, in the default style', async () => {
    const { store, dispatched } = fakeStore(state);

    const tool = drawingTools.find((t) => t.name === 'add-marker')!;

    await tool.execute({ lat: 48.1, lon: 17.1, label: 'here' }, ctx(store));

    expect(dispatched[0]).toMatchObject({
      type: 'DRAWING_POINT_ADD',
      payload: {
        coords: { lat: 48.1, lon: 17.1 },
        label: 'here',
        color: '#f00',
        markerType: 'pin',
        id: 1,
      },
    });
  });

  it('numbers the points of a drawn line', async () => {
    const { store, dispatched } = fakeStore(state);

    const tool = drawingTools.find((t) => t.name === 'draw-line')!;

    await tool.execute(
      {
        points: [
          { lat: 1, lon: 2 },
          { lat: 3, lon: 4 },
        ],
      },
      ctx(store),
    );

    expect(dispatched[0]).toMatchObject({
      type: 'DRAWING_LINE_ADD',
      payload: {
        type: 'line',
        points: [
          { lat: 1, lon: 2, id: 0 },
          { lat: 3, lon: 4, id: 1 },
        ],
      },
    });
  });

  it('refuses to remove what is not there', async () => {
    const { store } = fakeStore(state);

    const tool = drawingTools.find((t) => t.name === 'remove-drawing')!;

    const result = await tool.execute({ kind: 'line', index: 0 }, ctx(store));

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('there are 0');
  });
});

describe('objectCategories', () => {
  it('names each leaf by its comma-joined tags', () => {
    expect(
      objectCategories({
        osmTagToNameMapping: {
          amenity: { drinking_water: 'Drinking water', shelter: '{} Shelter' },
        },
      } as never),
    ).toEqual([
      {
        name: 'Drinking water',
        key: 'amenity=drinking_water',
        tags: [{ key: 'amenity', value: 'drinking_water' }],
      },
      {
        name: 'Shelter',
        key: 'amenity=shelter',
        tags: [{ key: 'amenity', value: 'shelter' }],
      },
    ]);
  });
});

describe('elevationStats', () => {
  it('sums climb and drop over points far enough apart', () => {
    // ~110 m apart each, so every step counts
    const stats = elevationStats({
      type: 'LineString',
      coordinates: [
        [17, 48, 100],
        [17, 48.001, 150],
        [17, 48.002, 120],
      ],
    });

    // the first point sets the reference but is not itself an extreme
    expect(stats.minEle).toBe(120);
    expect(stats.maxEle).toBe(150);
    expect(Math.round(stats.ascent)).toBe(50);
    expect(Math.round(stats.descent)).toBe(30);
  });

  it('says nothing where there is no elevation', () => {
    expect(
      elevationStats({
        type: 'LineString',
        coordinates: [
          [17, 48],
          [17, 48.001],
        ],
      }).minEle,
    ).toBeNull();
  });
});

describe('waiting for a processor', () => {
  const searching = searchTools.find((t) => t.name === 'search-places')!;

  it('reports what a failed processor said instead of timing out', async () => {
    // the same array the wait started with: a failed search dispatches no
    // results, only a toast
    const results: unknown[] = [];

    const { store, setState } = fakeStore({
      search: { query: '', results, more: false },
      toasts: { toasts: {} },
      l10n: { language: 'en' },
    });

    const promise = searching.execute({ query: 'Bratislava' }, ctx(store));

    setState({
      search: { query: 'Bratislava', results, more: false },
      toasts: {
        toasts: {
          x: { style: 'danger', messageKey: 'search.fetchingError' },
        },
      },
    });

    const result = await promise;

    expect(result.isError).toBe(true);
    // no messages are loaded in the test, so the key stands in for its text
    expect(text(result)).toBe('search.fetchingError');
  });

  it('gives up at once on an already-aborted signal', async () => {
    const { store } = fakeStore({
      search: { query: '', results: [], more: false },
      toasts: { toasts: {} },
      l10n: { language: 'en' },
    });

    const result = await searching.execute(
      { query: 'Bratislava' },
      { store, signal: AbortSignal.abort() },
    );

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('aborted');
  });
});

describe('plan-route', () => {
  it('says a route was not found rather than waiting it out', async () => {
    const routePlanner = {
      points: [
        { lat: 1, lon: 2 },
        { lat: 3, lon: 4 },
      ],
      mode: 'route' as const,
      transportType: 'hiking' as const,
      roundtripParams: { distance: 5000, seed: 0 },
      alternatives: [],
      waypoints: [],
      activeAlternativeIndex: 0,
      resultKey: null,
    };

    const { store, setState } = fakeStore({
      routePlanner,
      toasts: { toasts: {} },
    });

    const tool = routeTools.find((t) => t.name === 'plan-route')!;

    const promise = tool.execute(
      {
        points: [
          { lat: 1, lon: 2 },
          { lat: 3, lon: 4 },
        ],
      },
      ctx(store),
    );

    // what the router answers when it cannot join the points
    setState({
      toasts: { toasts: {} },
      routePlanner: { ...routePlanner, resultKey: routeKey(routePlanner) },
    });

    const result = await promise;

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('No route was found');
  });
});

describe('show-objects', () => {
  it('refetches even when the categories are already on', async () => {
    const stale = [
      { id: 1, coords: { lat: 40, lon: 10 }, tags: { name: 'far away' } },
    ];

    const state = {
      objects: { active: ['amenity=drinking_water'], objects: stale },
      map: { zoom: 15 },
      toasts: { toasts: {} },
      l10n: { language: 'en' },
    };

    const { store, setState, dispatched } = fakeStore(state);

    const tool = objectTools.find((t) => t.name === 'show-objects')!;

    const promise = tool.execute(
      { categories: ['amenity=drinking_water'] },
      ctx(store),
    );

    // the categories are checked first, so the dispatches land a tick later
    await vi.waitFor(() => expect(dispatched).toHaveLength(3));

    // the filter is dropped and set again, so the fetch is edge-triggered anew
    expect(dispatched.map((a) => (a as { type: string }).type)).toEqual([
      'OPEN_TOOL',
      'OBJECTS_SET_FILTER',
      'OBJECTS_SET_FILTER',
    ]);

    const fresh = [
      {
        id: 2,
        coords: { lat: 48, lon: 17 },
        tags: { name: 'Studnička', amenity: 'drinking_water' },
      },
    ];

    setState({ ...state, objects: { ...state.objects, objects: fresh } });

    const answer = JSON.parse(text(await promise));

    expect(answer.objects).toEqual([
      { name: 'Studnička', lat: 48, lon: 17, tags: fresh[0].tags },
    ]);
  });
});

describe('set-map-layers', () => {
  it('refuses a base map named as an overlay', async () => {
    const { store } = fakeStore({
      map: { layers: ['X'], customLayers: [], cachedMaps: [] },
    });

    const tool = mapTools.find((t) => t.name === 'set-map-layers')!;

    const result = await tool.execute({ overlays: ['X'] }, ctx(store));

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('is a base map, not an overlay');
  });
});

describe('describe-place', () => {
  it('answers "nothing here" when the lookup found none', async () => {
    const results: unknown[] = [];

    const { store, setState } = fakeStore({
      search: { query: '', results, more: false },
      toasts: { toasts: {} },
      l10n: { language: 'en' },
    });

    const tool = objectTools.find((t) => t.name === 'describe-place')!;

    const promise = tool.execute({ lat: 48, lon: 17 }, ctx(store));

    // what the map-details handler leaves behind with nothing to report
    setState({
      search: { query: '@48,17', results, more: false },
      toasts: {
        toasts: { 'mapDetails.detail': { style: 'warning', messageKey: 'x' } },
      },
    });

    expect(JSON.parse(text(await promise))).toEqual({ found: [] });
  });
});

describe('a repeated processor failure', () => {
  it('is noticed though its toast keeps the same id', async () => {
    const results: unknown[] = [];

    const failed = { style: 'danger', messageKey: 'search.fetchingError' };

    const { store, setState } = fakeStore({
      search: { query: '', results, more: false },
      toasts: { toasts: { search: failed } },
      l10n: { language: 'en' },
    });

    const tool = searchTools.find((t) => t.name === 'search-places')!;

    const promise = tool.execute({ query: 'Bratislava' }, ctx(store));

    // the same processor failing again re-raises under the same key
    setState({
      search: { query: 'Bratislava', results, more: false },
      toasts: { toasts: { search: { ...failed } } },
    });

    expect((await promise).isError).toBe(true);
  });
});

describe('sample-elevation-grid', () => {
  const tool = terrainTools.find((t) => t.name === 'sample-elevation-grid')!;

  const { store } = fakeStore({ l10n: { language: 'en' } });

  it('lays the grid out row-major from the north-west corner', async () => {
    const grid = JSON.parse(
      text(
        await tool.execute(
          {
            west: 19.5,
            south: 48.5,
            east: 19.503,
            north: 48.502,
            spacing: 100,
          },
          ctx(store),
        ),
      ),
    );

    expect(grid.cols).toBeGreaterThan(1);
    expect(grid.rows).toBeGreaterThan(1);
    expect(grid.elevations).toHaveLength(grid.rows * grid.cols);
    // the grid it actually covers sits inside the box asked for
    expect(grid.north).toBe(48.502);
    expect(grid.south).toBeGreaterThanOrEqual(48.5);
    expect(grid.east).toBeLessThanOrEqual(19.503);
  });

  it('reads slope and aspect off an eastward ramp', async () => {
    const grid = JSON.parse(
      text(
        await tool.execute(
          {
            west: 19.5,
            south: 48.5,
            east: 19.503,
            north: 48.502,
            spacing: 100,
            derivatives: true,
          },
          ctx(store),
        ),
      ),
    );

    // rising 1 m per metre east: 45 degrees, falling away to the west
    expect(grid.slope[0]).toBeCloseTo(45, 0);
    expect(grid.aspect[0]).toBeCloseTo(270, 0);
  });

  it('faces a slope rising to the north southward', async () => {
    const eastward = terrain;

    // 1 m up per metre north
    terrain = ([lat]) => Math.round(lat * 111320) % 100000;

    try {
      const grid = JSON.parse(
        text(
          await tool.execute(
            {
              west: 19.5,
              south: 48.5,
              east: 19.503,
              north: 48.502,
              spacing: 100,
              derivatives: true,
            },
            ctx(store),
          ),
        ),
      );

      expect(grid.slope[0]).toBeCloseTo(45, 0);
      expect(grid.aspect[0]).toBeCloseTo(180, 0);
    } finally {
      terrain = eastward;
    }
  });

  it('refuses a grid too big to sample', async () => {
    const result = await tool.execute(
      { west: 19, south: 48, east: 20, north: 49, spacing: 10 },
      ctx(store),
    );

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('at most 50000');
  });
});

describe('find-objects-in-area', () => {
  const tool = terrainTools.find((t) => t.name === 'find-objects-in-area')!;

  const { store } = fakeStore({ l10n: { language: 'en' } });

  it('queries the box it was given and reports what came back', async () => {
    const answer = JSON.parse(
      text(
        await tool.execute(
          {
            categories: ['natural=cave_entrance'],
            west: 19.5,
            south: 48.5,
            east: 19.6,
            north: 48.6,
            limit: 50,
          },
          ctx(store),
        ),
      ),
    );

    expect(lastOsmApiQuery.get('bbox')).toBe('19.5,48.5,19.6,48.6');
    expect(lastOsmApiQuery.get('limit')).toBe('50');
    expect(answer.objects[0]).toMatchObject({ name: 'Jaskyňa', lat: 48.5 });
    expect(answer.complete).toBe(true);
  });

  it('refuses more ground than one query may cover', async () => {
    const result = await tool.execute(
      {
        categories: ['natural=cave_entrance'],
        west: 10,
        south: 45,
        east: 20,
        north: 50,
      },
      ctx(store),
    );

    expect(result.isError).toBe(true);
    expect(text(result)).toContain('km²');
  });
});

describe('fetchObjects', () => {
  it('sends one filter per category, and the box in GeoJSON order', async () => {
    const { objects } = await fetchObjects(
      {
        active: ['amenity=drinking_water', 'natural=spring,drinking_water=yes'],
        bounds: { south: 1, west: 2, north: 3, east: 4 },
        limit: 10,
      },
      { getState: fakeStore({}).store.getState },
    );

    expect(lastOsmApiQuery.getAll('f')).toEqual([
      'amenity=drinking_water',
      'natural=spring,drinking_water=yes',
    ]);

    expect(lastOsmApiQuery.get('bbox')).toBe('2,1,4,3');

    expect(lastOsmApiQuery.get('limit')).toBe('10');

    expect(objects[0]).toMatchObject({
      id: { type: 'osm', elementType: 'node', id: 1 },
      coords: { lat: 48.5, lon: 19.5 },
    });
  });
});

describe('deliver: download', () => {
  it('writes the grid to a file and answers with where it went', async () => {
    const tool = terrainTools.find((t) => t.name === 'sample-elevation-grid')!;

    const answer = JSON.parse(
      text(
        await tool.execute(
          {
            west: 19.5,
            south: 48.5,
            east: 19.503,
            north: 48.502,
            spacing: 100,
            deliver: 'download',
          },
          ctx(fakeStore({ l10n: { language: 'en' } }).store),
        ),
      ),
    );

    expect(answer.elevations).toBeUndefined();
    expect(answer.savedAs).toMatch(/^freemap-elevation-grid-.*\.json$/);
    expect(answer.rows * answer.cols).toBeGreaterThan(0);
    expect(saved?.bytes).toBe(answer.bytes);
  });
});
