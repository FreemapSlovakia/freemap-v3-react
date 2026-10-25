import type { RootState } from '@app/store/store.js';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataViewerSetRenderGeojson } from './actions.js';
import {
  buildLines,
  markOverridden,
  publish,
  shownLines,
} from './renderLines.js';

/** The terrain answers 100 everywhere, and credits one model. */
const enrichElevations = vi.hoisted(() =>
  vi.fn(
    async (
      features: Feature<LineString>[],
      _mode: string,
      _getState: unknown,
      _cancel: unknown,
      credits?: { attributions: Map<string, unknown> },
    ) => {
      credits?.attributions.set('dem', { name: 'DEM' });

      return features.map((f) => ({
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: f.geometry.coordinates.map((p) =>
            p.length > 2 ? p : [p[0]!, p[1]!, 100],
          ),
        },
      }));
    },
  ),
);

vi.mock('@shared/elevation.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/elevation.js')>()),
  enrichElevations,
  // Nothing to subdivide: the lines here are short.
  densifyGeometry: (f: Feature) => f,
}));

const line = (
  coordinates: number[][],
  properties: Record<string, unknown> = {},
): Feature<LineString> => ({
  type: 'Feature',
  properties,
  geometry: { type: 'LineString', coordinates },
});

const drawn = line([
  [17, 48, 300],
  [17.001, 48],
]);

const recording = line(
  [
    [17, 48, 500],
    [17.001, 48, 510],
  ],
  {
    coordinateProperties: {
      times: ['2026-01-01T00:00:00Z', '2026-01-01T00:01:00Z'],
    },
  },
);

let state: {
  trackViewer: Record<string, unknown>;
  trackViewerSettings: Record<string, unknown>;
  elevationChart: Record<string, unknown>;
  toasts: { toasts: Record<string, unknown> };
  elevationSettings: { despikeWindow: number; ditchFillWindow: number };
};

const getState = () => state as unknown as RootState;

/** Only the render copy is reduced. */
const dispatch = ((action: unknown) => {
  if (dataViewerSetRenderGeojson.match(action)) {
    state.trackViewer['renderTrackGeojson'] = action.payload;
  }
}) as never;

const collection = (...features: Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

const rendered = () =>
  (state.trackViewer['renderTrackGeojson'] as FeatureCollection | null)
    ?.features;

beforeEach(() => {
  state = {
    trackViewer: {
      trackGeojson: collection(drawn, recording),
      renderTrackGeojson: null,
      elevationDecision: 'undecided',
      activeTrackIndex: null,
    },
    trackViewerSettings: { colorizeTrackBy: null },
    elevationChart: { target: null },
    toasts: { toasts: {} },
    elevationSettings: { despikeWindow: 0, ditchFillWindow: 0 },
  };

  enrichElevations.mockClear();
});

describe('render lines', () => {
  it('draws a non-recording from the terrain, a recording as stored', async () => {
    await buildLines(getState, dispatch, [0, 1]);

    const [terrain, kept] = rendered()!;

    // The stored 300 is not drawn; the terrain's 100 is, at every vertex.
    expect((terrain!.geometry as LineString).coordinates).toEqual([
      [17, 48, 100],
      [17.001, 48, 100],
    ]);

    expect(terrain!.properties?.['fm:elevationAttributions']).toEqual([
      { name: 'DEM' },
    ]);

    // Untouched, so credited to no model.
    expect(kept).toBe(recording);
  });

  it('asks once for every line of a build, and never again for them', async () => {
    const other = line([
      [18, 48],
      [18.001, 48],
    ]);

    state.trackViewer['trackGeojson'] = collection(drawn, other);

    await buildLines(getState, dispatch, [0, 1]);

    await buildLines(getState, dispatch, [0, 1]);

    expect(enrichElevations).toHaveBeenCalledTimes(1);
  });

  it("keeps a line's copy when another line is edited", async () => {
    await buildLines(getState, dispatch, [0]);

    const terrain = rendered()![0];

    const edited = line([
      [19, 48],
      [19.001, 48],
    ]);

    state.trackViewer['trackGeojson'] = collection(drawn, edited);

    state.trackViewer['renderTrackGeojson'] = null;

    publish(getState, dispatch);

    expect(rendered()![0]).toBe(terrain);

    // Not fetched yet: drawn as stored meanwhile.
    expect(rendered()![1]).toBe(edited);
  });

  it('fills a recording only once the choice says so', async () => {
    const gappy = line(
      [
        [17, 48, 500],
        [17.001, 48],
      ],
      recording.properties!,
    );

    state.trackViewer['trackGeojson'] = collection(gappy);

    await buildLines(getState, dispatch, [0]);

    expect(enrichElevations).not.toHaveBeenCalled();

    state.trackViewer['elevationDecision'] = 'missing';

    await buildLines(getState, dispatch, [0]);

    expect((rendered()![0]!.geometry as LineString).coordinates[1]).toEqual([
      17.001, 48, 100,
    ]);

    // Its measurements stay its own.
    expect(
      rendered()![0]!.properties?.['fm:elevationAttributions'],
    ).toBeUndefined();
  });

  it('keeps a restyled line its copy, with its new properties', async () => {
    await buildLines(getState, dispatch, [0]);

    const asked = enrichElevations.mock.calls.length;

    const restyled = { ...drawn, properties: { name: 'Renamed' } };

    state.trackViewer['trackGeojson'] = collection(restyled, recording);

    state.trackViewer['renderTrackGeojson'] = null;

    publish(getState, dispatch);

    await buildLines(getState, dispatch, [0]);

    // Its geometry is the same, so nothing is asked again.
    expect(enrichElevations).toHaveBeenCalledTimes(asked);

    const shown = rendered()![0]!;

    expect(shown.properties?.['name']).toBe('Renamed');

    expect((shown.geometry as LineString).coordinates[0]).toEqual([
      17, 48, 100,
    ]);
  });

  it('draws a recording overridden alone as overridden', async () => {
    const overriddenAlone = line(
      [
        [17, 48],
        [17.001, 48],
      ],
      recording.properties!,
    );

    markOverridden(overriddenAlone.geometry);

    state.trackViewer['trackGeojson'] = collection(overriddenAlone);

    await buildLines(getState, dispatch, [0]);

    expect(rendered()![0]!.properties?.['fm:elevationAttributions']).toEqual([
      { name: 'DEM' },
    ]);
  });

  it('builds only what is shown', () => {
    expect(shownLines(getState())).toEqual([]);

    state.trackViewerSettings['colorizeTrackBy'] = 'elevation';

    expect(shownLines(getState())).toEqual([0, 1]);
  });
});
