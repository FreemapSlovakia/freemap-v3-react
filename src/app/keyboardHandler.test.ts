import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { setMapLeafletElement } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { mapAreaSelectCancel } from '@features/mapArea/model/actions.js';
import { toposcopeSetPickingCenter } from '@features/toposcope/model/actions.js';
import {
  CRS,
  type LatLngExpression,
  type Map as LeafletMap,
  latLng,
  type PointExpression,
  point,
} from 'leaflet';
import { beforeAll, describe, expect, it } from 'vitest';
import { handleEvent, handleMapKey } from './keyboardHandler.js';
import type { RootState } from './store/store.js';

/**
 * Unit tests for the global map keys. The real projection is used so the pan
 * assertions are about geography rather than about the stand-in's arithmetic;
 * no map instance is needed for it.
 */

const CENTER = { lat: 48.15, lng: 17.11 };

const ZOOM = 12;

const MIN_ZOOM = 5;

const MAX_ZOOM = 19;

beforeAll(() => {
  setMapLeafletElement({
    getCenter: () => latLng(CENTER),
    getZoom: () => ZOOM,
    getMinZoom: () => MIN_ZOOM,
    getMaxZoom: () => MAX_ZOOM,
    project: (ll: LatLngExpression, z?: number) =>
      CRS.EPSG3857.latLngToPoint(latLng(ll), z ?? ZOOM),
    unproject: (p: PointExpression, z?: number) =>
      CRS.EPSG3857.pointToLatLng(point(p), z ?? ZOOM),
  } as unknown as LeafletMap);
});

function makeState(overrides: Record<string, unknown> = {}): RootState {
  return {
    map: { zoom: ZOOM },
    main: { activeModal: null },
    gallery: {
      activeImageId: null,
      pickingPositionForId: null,
      showPosition: false,
    },
    wiki: { preview: null, loading: false },
    homeLocation: { selectingHomeLocation: false },
    mapArea: { selecting: null },
    toposcope: { pickingCenter: false },
    elevationChart: { target: null },
    drawingLines: { joinWith: undefined, drawing: false },
    ...overrides,
  } as unknown as RootState;
}

function press(key: string, init: KeyboardEventInit = {}) {
  return new KeyboardEvent('keydown', { key, ...init });
}

describe('handleMapKey — zooming', () => {
  it('steps the zoom one level per press', () => {
    expect(handleMapKey(press('+'), makeState())).toEqual(
      mapRefocus({ zoom: ZOOM + 1 }),
    );

    expect(handleMapKey(press('-'), makeState())).toEqual(
      mapRefocus({ zoom: ZOOM - 1 }),
    );
  });

  // On most layouts `+` is shift-`=` and `_` is shift-`-`, so shift here says
  // nothing about intent and must not be read as the arrows' triple-step.
  it('steps by one whether or not the layout needed shift', () => {
    for (const key of ['+', '=']) {
      expect(handleMapKey(press(key, { shiftKey: true }), makeState())).toEqual(
        mapRefocus({ zoom: ZOOM + 1 }),
      );
    }

    for (const key of ['-', '_']) {
      expect(handleMapKey(press(key, { shiftKey: true }), makeState())).toEqual(
        mapRefocus({ zoom: ZOOM - 1 }),
      );
    }
  });

  // Carries no coordinates, so the reducer leaves GPS following on — the whole
  // point of routing these through the store rather than straight to the map.
  it('leaves the center out of the refocus', () => {
    expect(handleMapKey(press('='), makeState())?.payload).toEqual({
      zoom: ZOOM + 1,
    });
  });

  it('clamps to the map instead of running past its limits', () => {
    expect(
      handleMapKey(press('+'), makeState({ map: { zoom: MAX_ZOOM } })),
    ).toBeUndefined();

    expect(
      handleMapKey(press('-'), makeState({ map: { zoom: MIN_ZOOM } })),
    ).toBeUndefined();

    expect(
      handleMapKey(press('+'), makeState({ map: { zoom: MAX_ZOOM - 1 } })),
    ).toEqual(mapRefocus({ zoom: MAX_ZOOM }));
  });
});

describe('handleMapKey — panning', () => {
  it('moves the map in the direction of the key', () => {
    const right = handleMapKey(press('ArrowRight'), makeState())?.payload as {
      lat: number;
      lon: number;
    };

    expect(right.lon).toBeGreaterThan(CENTER.lng);
    expect(right.lat).toBeCloseTo(CENTER.lat, 10);

    const up = handleMapKey(press('ArrowUp'), makeState())?.payload as {
      lat: number;
      lon: number;
    };

    expect(up.lat).toBeGreaterThan(CENTER.lat);
    expect(up.lon).toBeCloseTo(CENTER.lng, 10);

    const left = handleMapKey(press('ArrowLeft'), makeState())?.payload as {
      lon: number;
    };

    const down = handleMapKey(press('ArrowDown'), makeState())?.payload as {
      lat: number;
    };

    expect(left.lon).toBeLessThan(CENTER.lng);
    expect(down.lat).toBeLessThan(CENTER.lat);
  });

  it('triples the step with shift', () => {
    const plain = handleMapKey(press('ArrowRight'), makeState())?.payload as {
      lon: number;
    };

    const shifted = handleMapKey(
      press('ArrowRight', { shiftKey: true }),
      makeState(),
    )?.payload as { lon: number };

    expect(shifted.lon - CENTER.lng).toBeCloseTo(
      (plain.lon - CENTER.lng) * 3,
      10,
    );
  });

  // Coordinates without an explicit flag are what the map reducer reads as the
  // user having taken over, which panning away deliberately is.
  it('carries coordinates, ending GPS following', () => {
    expect(
      Object.keys(handleMapKey(press('ArrowUp'), makeState())?.payload ?? {}),
    ).toEqual(['lat', 'lon']);
  });
});

describe('handleMapKey — when the keys are not the map’s', () => {
  it('ignores keys aimed at a form field', () => {
    const event = press('+');

    Object.defineProperty(event, 'target', {
      value: document.createElement('input'),
    });

    expect(handleMapKey(event, makeState())).toBeUndefined();
  });

  it('ignores modified keys, leaving browser zoom and shortcuts alone', () => {
    expect(handleMapKey(press('+', { ctrlKey: true }), makeState())).toBe(
      undefined,
    );

    expect(handleMapKey(press('ArrowUp', { altKey: true }), makeState())).toBe(
      undefined,
    );
  });

  it('ignores everything while a modal owns the keys', () => {
    const state = makeState({ main: { activeModal: 'account' } });

    expect(handleMapKey(press('+'), state)).toBeUndefined();
    expect(handleMapKey(press('ArrowUp'), state)).toBeUndefined();
  });

  it('still moves the map under a picking overlay, which keeps it live', () => {
    const state = makeState({
      main: { activeModal: 'account' },
      mapArea: { selecting: 'export' },
    });

    expect(handleMapKey(press('+'), state)).toEqual(
      mapRefocus({ zoom: ZOOM + 1 }),
    );
  });

  // The handler is attached in the capture phase, so without this an open
  // dropdown never receives the arrow keys it navigates itself with.
  it('leaves the keys to an open dropdown', () => {
    const toggle = document.createElement('button');

    toggle.setAttribute('aria-expanded', 'true');

    document.body.append(toggle);

    try {
      expect(handleMapKey(press('ArrowDown'), makeState())).toBeUndefined();
      expect(handleMapKey(press('+'), makeState())).toBeUndefined();
    } finally {
      toggle.remove();
    }

    // ...and takes them back once the menu is closed.
    expect(handleMapKey(press('ArrowDown'), makeState())).toBeDefined();
  });

  it('passes other keys through', () => {
    expect(handleMapKey(press('KeyG'), makeState())).toBeUndefined();
  });
});

describe('handleEvent — Escape', () => {
  const esc = () => press('Escape', { code: 'Escape' });

  it('closes the elevation chart when nothing is above it', () => {
    expect(
      handleEvent(esc(), makeState({ elevationChart: { target: {} } })),
    ).toEqual(elevationChartClose());
  });

  it('leaves the toposcope centre picking before anything else', () => {
    // The map is in a mode of its own; Escape must end that rather than close a
    // panel or clear the selection and leave the map waiting for a click.
    expect(
      handleEvent(
        esc(),
        makeState({
          toposcope: { pickingCenter: true },
          elevationChart: { target: {} },
        }),
      ),
    ).toEqual(toposcopeSetPickingCenter(false));
  });

  // The modal closes itself on its own document listener, which runs only
  // while the key has not been claimed here first.
  it('leaves the key to a modal in the foreground', () => {
    expect(
      handleEvent(
        esc(),
        makeState({
          main: { activeModal: { type: 'map-preferences' } },
          elevationChart: { target: {} },
        }),
      ),
    ).toBeUndefined();
  });

  it('cancels a picking overlay even though its modal is open', () => {
    expect(
      handleEvent(
        esc(),
        makeState({
          main: { activeModal: { type: 'offline-map-export' } },
          mapArea: { selecting: 'export' },
        }),
      ),
    ).toEqual(mapAreaSelectCancel());
  });
});
