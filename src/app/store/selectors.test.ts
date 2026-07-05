import type { FeatureCollection } from 'geojson';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  activeMapToolSelector,
  askingCookieConsentSelector,
  drawingLinePolys,
  mouseCursorSelector,
  pickingModeSelector,
  selectingModeSelector,
  showGalleryPickerSelector,
  showGalleryViewerSelector,
  trackGeojsonIsSuitableForElevationChart,
  trackingActiveTrackIdSelector,
  trackingTrackSelector,
} from './selectors.js';
import type { RootState } from './store.js';

/**
 * Pure selector tests. Each selector takes `RootState`; `makeState` builds a
 * minimal slice set with overridable per-test fields. Under Vitest the cursor
 * SVG imports resolve to '' (asset stub), so the pencil/marker cursors are
 * `url() <offset>, crosshair` — asserted by their distinctive offsets.
 */

type Overrides = Partial<Record<keyof RootState, Record<string, unknown>>>;

function makeState(o: Overrides = {}): RootState {
  // Convenience: a `tool` override sets it as the single open + active tool.
  const { tool, ...mainRest } = (o.main ?? {}) as { tool?: string };

  return {
    main: {
      tools: tool ? [tool] : [],
      activeTool: tool ?? null,
      selection: undefined,
      ...mainRest,
    },
    map: { layers: [], ...o.map },
    homeLocation: { selectingHomeLocation: false, ...o.homeLocation },
    routePlanner: { pickMode: null, ...o.routePlanner },
    gallery: {
      pickingPositionForId: null,
      showPosition: false,
      activeImageId: null,
      ...o.gallery,
    },
    drawingLines: { drawing: false, ...o.drawingLines },
    mapArea: { selecting: null, ...o.mapArea },
    tracking: { tracks: [], ...o.tracking },
    trackViewer: { trackGeojson: null, ...o.trackViewer },
    toasts: { toasts: {}, ...o.toasts },
  } as unknown as RootState;
}

beforeEach(() => {
  window.fmEmbedded = false;
});

afterEach(() => {
  window.fmEmbedded = false;
});

describe('pickingModeSelector', () => {
  it('is false by default', () => {
    expect(pickingModeSelector(makeState())).toBe(false);
  });

  it('is true while selecting a home location', () => {
    const state = makeState({ homeLocation: { selectingHomeLocation: true } });

    expect(pickingModeSelector(state)).toBe(true);
  });

  it('is true while picking a gallery photo position', () => {
    const state = makeState({ gallery: { pickingPositionForId: 5 } });

    expect(pickingModeSelector(state)).toBe(true);
  });

  it('is true while showing a gallery photo position', () => {
    const state = makeState({ gallery: { showPosition: true } });

    expect(pickingModeSelector(state)).toBe(true);
  });

  it('is true while selecting a map area', () => {
    const state = makeState({ mapArea: { selecting: 'export' } });

    expect(pickingModeSelector(state)).toBe(true);
  });
});

describe('activeMapToolSelector', () => {
  it('returns the selected tool when no picking mode is active', () => {
    const state = makeState({ main: { tool: 'draw-points' } });

    expect(activeMapToolSelector(state)).toBe('draw-points');
  });

  it('masks the tool to null while a picking mode owns the map', () => {
    const state = makeState({
      main: { tool: 'draw-points' },
      homeLocation: { selectingHomeLocation: true },
    });

    expect(activeMapToolSelector(state)).toBeNull();
  });
});

describe('showGalleryPickerSelector', () => {
  it('shows the picker with the gallery overlay on and no active map-click tool', () => {
    const state = makeState({
      map: { layers: ['X', 'I'] },
    });

    expect(showGalleryPickerSelector(state)).toBe(true);
  });

  it('hides the picker without the gallery overlay', () => {
    const state = makeState({
      map: { layers: ['X'] },
    });

    expect(showGalleryPickerSelector(state)).toBe(false);
  });

  it('hides the picker for an unrelated tool', () => {
    const state = makeState({
      main: { tool: 'route-planner' },
      map: { layers: ['I'] },
    });

    expect(showGalleryPickerSelector(state)).toBe(false);
  });

  it('hides the picker while a gallery position is being picked', () => {
    const state = makeState({
      main: { tool: 'photos' },
      map: { layers: ['I'] },
      gallery: { pickingPositionForId: 1 },
    });

    expect(showGalleryPickerSelector(state)).toBe(false);
  });
});

describe('showGalleryViewerSelector', () => {
  it('is true with an active image and no picking/showing in progress', () => {
    const state = makeState({ gallery: { activeImageId: 7 } });

    expect(showGalleryViewerSelector(state)).toBe(true);
  });

  it('is false without an active image', () => {
    expect(showGalleryViewerSelector(makeState())).toBe(false);
  });

  it('is false while showing a position', () => {
    const state = makeState({
      gallery: { activeImageId: 7, showPosition: true },
    });

    expect(showGalleryViewerSelector(state)).toBe(false);
  });
});

describe('mouseCursorSelector', () => {
  it('returns auto while showing a gallery position', () => {
    const state = makeState({ gallery: { showPosition: true } });

    expect(mouseCursorSelector(state)).toBe('auto');
  });

  it('returns crosshair while selecting a home location', () => {
    const state = makeState({ homeLocation: { selectingHomeLocation: true } });

    expect(mouseCursorSelector(state)).toBe('crosshair');
  });

  it('returns the pencil cursor while actively drawing a line', () => {
    const state = makeState({ drawingLines: { drawing: true } });

    expect(mouseCursorSelector(state)).toContain('1.5 20'); // pencil offset
  });

  it('returns the marker cursor for the draw-points tool', () => {
    const state = makeState({ main: { tool: 'draw-points' } });

    expect(mouseCursorSelector(state)).toContain('13.5 26'); // marker offset
  });

  it('returns help for the map-details tool', () => {
    const state = makeState({ main: { tool: 'map-details' } });

    expect(mouseCursorSelector(state)).toBe('help');
  });

  it('returns crosshair for route-planner only while a pick mode is active', () => {
    const picking = makeState({
      main: { tool: 'route-planner' },
      routePlanner: { pickMode: 'start' },
    });
    expect(mouseCursorSelector(picking)).toBe('crosshair');

    const idle = makeState({ main: { tool: 'route-planner' } });
    expect(mouseCursorSelector(idle)).toBe('auto');
  });

  it('returns auto by default', () => {
    expect(mouseCursorSelector(makeState())).toBe('auto');
  });
});

describe('tracking selectors', () => {
  it('trackingActiveTrackIdSelector reads the id from a tracking selection', () => {
    const state = makeState({
      main: { selection: { type: 'tracking', id: 'tok-1' } },
    });

    expect(trackingActiveTrackIdSelector(state)).toBe('tok-1');
  });

  it('trackingActiveTrackIdSelector is undefined for a non-tracking selection', () => {
    const state = makeState({
      main: { selection: { type: 'draw-points', id: 0 } },
    });

    expect(trackingActiveTrackIdSelector(state)).toBeUndefined();
  });

  it('trackingTrackSelector finds the active track by token', () => {
    const state = makeState({
      main: { selection: { type: 'tracking', id: 'b' } },
      tracking: {
        tracks: [
          { token: 'a', trackPoints: [] },
          { token: 'b', trackPoints: [] },
        ],
      },
    });

    expect(trackingTrackSelector(state)?.token).toBe('b');
  });

  it('trackingTrackSelector is undefined when nothing is selected', () => {
    const state = makeState({
      tracking: { tracks: [{ token: 'a', trackPoints: [] }] },
    });

    expect(trackingTrackSelector(state)).toBeUndefined();
  });
});

describe('selectingModeSelector', () => {
  it('is true for the null tool in a non-embedded, non-picking state', () => {
    expect(selectingModeSelector(makeState())).toBe(true);
  });

  it('is false when embedded', () => {
    window.fmEmbedded = true;

    expect(selectingModeSelector(makeState())).toBe(false);
  });

  it('is false for a map-interaction tool like draw-points', () => {
    const state = makeState({ main: { tool: 'draw-points' } });

    expect(selectingModeSelector(state)).toBe(false);
  });

  it('is true for route-planner only when not in a pick mode', () => {
    const idle = makeState({ main: { tool: 'route-planner' } });
    expect(selectingModeSelector(idle)).toBe(true);

    const picking = makeState({
      main: { tool: 'route-planner' },
      routePlanner: { pickMode: 'start' },
    });
    expect(selectingModeSelector(picking)).toBe(false);
  });
});

describe('drawingLinePolys', () => {
  it('is true for the active draw-lines and draw-polygons tools', () => {
    expect(drawingLinePolys(makeState({ main: { tool: 'draw-lines' } }))).toBe(
      true,
    );
    expect(
      drawingLinePolys(makeState({ main: { tool: 'draw-polygons' } })),
    ).toBe(true);
  });

  it('is false when the drawing tool is open but not active', () => {
    expect(
      drawingLinePolys(
        makeState({ main: { tools: ['draw-lines'], activeTool: null } }),
      ),
    ).toBe(false);
  });

  it('is true while a drawing is in progress even with no active tool', () => {
    // Continuing an existing line, or a line whose tool was deactivated/closed,
    // keeps capturing clicks so points can still be appended.
    expect(
      drawingLinePolys(
        makeState({
          main: { tools: [], activeTool: null },
          drawingLines: { drawing: true },
        }),
      ),
    ).toBe(true);
  });

  it('is false while a picking mode owns the map', () => {
    const state = makeState({
      main: { tool: 'draw-lines' },
      homeLocation: { selectingHomeLocation: true },
    });

    expect(drawingLinePolys(state)).toBe(false);
  });

  it('is false while a drawing is in progress but a picking mode owns the map', () => {
    // The in-progress drawing must go inert while picking, otherwise the pick
    // click would also append a point to the line.
    const state = makeState({
      drawingLines: { drawing: true },
      homeLocation: { selectingHomeLocation: true },
    });

    expect(drawingLinePolys(state)).toBe(false);
  });

  it('is false for an unrelated active tool', () => {
    expect(drawingLinePolys(makeState({ main: { tool: 'objects' } }))).toBe(
      false,
    );
  });
});

describe('trackGeojsonIsSuitableForElevationChart', () => {
  const fc = (geometryType: string): FeatureCollection => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: geometryType, coordinates: [] } as never,
      },
    ],
  });

  it('is true when the first feature is a LineString', () => {
    const state = makeState({
      trackViewer: { trackGeojson: fc('LineString') },
    });

    expect(trackGeojsonIsSuitableForElevationChart(state)).toBe(true);
  });

  it('is false for a non-LineString first feature', () => {
    const state = makeState({ trackViewer: { trackGeojson: fc('Point') } });

    expect(trackGeojsonIsSuitableForElevationChart(state)).toBe(false);
  });

  it('is false when there is no track geojson', () => {
    expect(trackGeojsonIsSuitableForElevationChart(makeState())).toBe(false);
  });
});

describe('askingCookieConsentSelector', () => {
  it('is true when a cookieConsent toast is present', () => {
    const state = makeState({
      toasts: { toasts: { cookieConsent: { id: 'cookieConsent' } } },
    });

    expect(askingCookieConsentSelector(state)).toBe(true);
  });

  it('is false otherwise', () => {
    expect(askingCookieConsentSelector(makeState())).toBe(false);
  });
});
