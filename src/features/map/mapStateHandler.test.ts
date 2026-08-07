import type { MyStore } from '@app/store/store.js';
import { CRS, type LatLng, type Map as LeafletMap, type Point } from 'leaflet';
import { describe, expect, it } from 'vitest';
import { fitMapToBbox } from './fitMapToBbox.js';
import { setMapLeafletElement } from './hooks/leafletElementHolder.js';
import { attachMapStateHandler } from './mapStateHandler.js';
import { mapRefocus } from './model/actions.js';
import { type MapState, mapInitialState, mapReducer } from './model/reducer.js';
import { duringProgrammaticMove } from './moveOrigin.js';

/**
 * Exercises `attachMapStateHandler` against a stand-in for the Leaflet map —
 * the handler only reads the center/zoom/container and subscribes to events, so
 * a plain emitter drives it without a real map or a layout in jsdom. Dispatches
 * go through the real `mapReducer`, since what these cases turn on is how the
 * handler's payloads land in the slice.
 */
function makeFakeMap(
  initialCenter: { lat: number; lng: number },
  initialZoom: number,
) {
  const handlers = new Map<string, (() => void)[]>();

  let center = initialCenter;

  let zoom = initialZoom;

  // A real element, so the handler's own `touchstart` listener and its
  // `isConnected` check both work as they do in the browser.
  const container = document.createElement('div');

  document.body.append(container);

  function fire(event: string) {
    for (const fn of handlers.get(event) ?? []) {
      fn();
    }
  }

  const map = {
    getContainer: () => container,
    getCenter: () => center,
    getZoom: () => zoom,
    getBounds: () => ({
      getWest: () => center.lng - 1,
      getSouth: () => center.lat - 1,
      getEast: () => center.lng + 1,
      getNorth: () => center.lat + 1,
    }),
    // The zoom an extent fits at depends on the viewport, which jsdom gives no
    // size; the projection either side of it is the real thing.
    getBoundsZoom: () => FIT_ZOOM,
    project: (latlng: LatLng, atZoom: number) =>
      CRS.EPSG3857.latLngToPoint(latlng, atZoom),
    unproject: (pt: Point, atZoom: number) =>
      CRS.EPSG3857.pointToLatLng(pt, atZoom),
    on(event: string, fn: () => void) {
      const list = handlers.get(event) ?? [];

      list.push(fn);

      handlers.set(event, list);

      return map;
    },
  };

  return {
    map: map as unknown as LeafletMap,
    moveTo(lat: number, lng: number) {
      center = { lat, lng };
    },
    zoomTo(newZoom: number) {
      zoom = newZoom;
    },
    setConnected(connected: boolean) {
      if (connected) {
        document.body.append(container);
      } else {
        container.remove();
      }
    },
    touchWith(fingers: number) {
      const event = new Event('touchstart');

      Object.defineProperty(event, 'touches', { value: { length: fingers } });

      container.dispatchEvent(event);
    },
    fire,
  };
}

const CENTER = { lat: 48.15, lng: 17.11 };

const ZOOM = 17;

// Comfortably past the handler's `5 / 2 ** zoom` threshold at ZOOM.
const AWAY = 0.001;

// The middle of the extent fitted below, and the zoom it fits at.
const ELSEWHERE = { lat: 49.06, lng: 20.14 };

const FIT_ZOOM = 12;

let mapState: MapState = mapInitialState;

const dispatched: { type: string; payload?: unknown }[] = [];

// Attached once: `attachMapStateHandler` subscribes for the lifetime of the
// page, so re-attaching per test would stack handlers on every later map.
const store = {
  getState: () => ({ map: mapState }),
  dispatch: (action: { type: string; payload?: unknown }) => {
    dispatched.push(action);

    mapState = mapReducer(mapState, action as Parameters<typeof mapReducer>[1]);

    return action;
  },
} as unknown as MyStore;

attachMapStateHandler(store);

function setup(gpsTracked = false) {
  mapState = {
    ...mapInitialState,
    lat: CENTER.lat,
    lon: CENTER.lng,
    zoom: ZOOM,
    gpsTracked,
  };

  dispatched.length = 0;

  const fake = makeFakeMap({ ...CENTER }, ZOOM);

  setMapLeafletElement(null);

  setMapLeafletElement(fake.map);

  return {
    ...fake,
    refocuses: () =>
      dispatched.filter((action) => action.type === mapRefocus.type),
  };
}

describe('attachMapStateHandler — moveend while GPS following', () => {
  it('ignores a moveend fired while the app is driving the view', () => {
    const { moveTo, fire, refocuses } = setup(true);

    // What Leaflet does when a new `setView` interrupts a running pan: it
    // completes the animation in place and fires `moveend` at that
    // intermediate center, well away from where the store already points.
    duringProgrammaticMove(() => {
      moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

      fire('moveend');
    });

    expect(refocuses()).toHaveLength(0);
    expect(mapState.gpsTracked).toBe(true);
  });

  it('keeps following when a zoom settles at a stale center', () => {
    const { zoomTo, fire, refocuses } = setup(true);

    // The +/- buttons refocus the store first, so by the time the map settles
    // both zooms already agree. Leaflet drops a `setView` issued while its
    // zoom animation runs, then ends that animation at the pre-zoom center —
    // which the fixes arriving meanwhile have left behind.
    mapState = { ...mapState, zoom: ZOOM + 1, lat: CENTER.lat + AWAY };

    zoomTo(ZOOM + 1);

    fire('moveend');

    expect(refocuses()).toHaveLength(0);
    expect(mapState.gpsTracked).toBe(true);
    // The store keeps the GPS position rather than rewinding to the map's.
    expect(mapState.lat).toBe(CENTER.lat + AWAY);
  });

  it('stops following on a zoom the map anchored elsewhere', () => {
    const { zoomTo, moveTo, fire, refocuses } = setup(true);

    // Wheel and pinch zoom toward the pointer, so the map changes the zoom
    // itself and carries the center along — a chosen spot to look at.
    fire('zoomstart');

    zoomTo(ZOOM + 2);

    moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

    fire('moveend');

    expect(refocuses()).toHaveLength(1);
    expect(refocuses()[0].payload).toEqual({
      lat: CENTER.lat + AWAY,
      lon: CENTER.lng + AWAY,
      zoom: ZOOM + 2,
    });
    expect(mapState.gpsTracked).toBe(false);
  });

  it('adopts a centered zoom, even with the map trailing the store', () => {
    const { zoomTo, fire, refocuses } = setup(true);

    // Leaflet's own `+`/`-` zoom around the map's center. The store is already
    // ahead of the map here, as it is throughout a move — measuring the shift
    // against the store rather than the map's pre-zoom center would read this
    // as a zoom-to-a-point and drop following.
    mapState = { ...mapState, lat: CENTER.lat + AWAY };

    fire('zoomstart');

    zoomTo(ZOOM + 2);

    fire('moveend');

    expect(refocuses()).toHaveLength(1);
    expect(refocuses()[0].payload).toEqual({
      zoom: ZOOM + 2,
      gpsTracked: true,
    });
    expect(mapState.gpsTracked).toBe(true);
    expect(mapState.lat).toBe(CENTER.lat + AWAY);
  });

  it('stops following once the user grabs the map', () => {
    const { moveTo, fire, refocuses } = setup(true);

    fire('dragstart');

    expect(mapState.gpsTracked).toBe(false);

    moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

    fire('moveend');

    expect(mapState.gpsTracked).toBe(false);
    expect(mapState.lat).toBe(CENTER.lat + AWAY);
    expect(refocuses()).toHaveLength(2);
  });

  it('stops following on a two-finger gesture that only panned', () => {
    const { touchWith, moveTo, fire, refocuses } = setup(true);

    // A second finger hands the gesture to Leaflet's touch-zoom handler, which
    // fires no `dragstart`; one that ends on the zoom it started from leaves no
    // zoom change either, so nothing else marks it as the user's doing.
    touchWith(2);

    expect(mapState.gpsTracked).toBe(false);

    moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

    fire('moveend');

    // The pan reaches the store, rather than being discarded and undone by the
    // next fix.
    expect(mapState.lat).toBe(CENTER.lat + AWAY);
    expect(refocuses()).toHaveLength(2);
  });

  it('keeps following through a single-finger touch', () => {
    const { touchWith } = setup(true);

    // Dragging is Leaflet's own `dragstart`; a lone touch says nothing yet.
    touchWith(1);

    expect(mapState.gpsTracked).toBe(true);
  });
});

/**
 * A `moveend` can land after the map is gone: Leaflet debounces the one a
 * container resize produces by 200 ms, and by then an unmount has detached the
 * container and removed the panes, so reading the center would throw.
 */
describe('attachMapStateHandler — moveend on a map that is gone', () => {
  it('ignores it instead of reading the dead map', () => {
    const { setConnected, moveTo, fire, refocuses } = setup();

    setConnected(false);

    moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

    fire('moveend');

    expect(refocuses()).toHaveLength(0);
  });
});

describe('attachMapStateHandler — moveend while not following', () => {
  it('syncs the store to a settled move', () => {
    const { moveTo, fire, refocuses } = setup();

    moveTo(CENTER.lat + AWAY, CENTER.lng + AWAY);

    fire('moveend');

    expect(refocuses()).toHaveLength(1);
    expect(refocuses()[0].payload).toEqual({
      lat: CENTER.lat + AWAY,
      lon: CENTER.lng + AWAY,
      zoom: ZOOM,
    });
  });

  it('stays quiet when the settled center already matches the store', () => {
    const { fire, refocuses } = setup();

    fire('moveend');

    expect(refocuses()).toHaveLength(0);
  });
});

/**
 * A fit points the map at an extent through the store, so what it must leave
 * behind is a slice that names that extent — anything that refocuses from the
 * store afterwards (the zoom buttons, an arrow key, the URL) reads it back.
 */
describe('fitMapToBbox', () => {
  it('refocuses the store onto the fitted extent', async () => {
    const { refocuses } = setup(true);

    await fitMapToBbox(store.dispatch, [
      ELSEWHERE.lng - 0.1,
      ELSEWHERE.lat - 0.1,
      ELSEWHERE.lng + 0.1,
      ELSEWHERE.lat + 0.1,
    ]);

    expect(refocuses()).toHaveLength(1);

    const { lat, lon, zoom, gpsTracked } = refocuses()[0].payload as {
      lat: number;
      lon: number;
      zoom: number;
      gpsTracked: boolean;
    };

    expect(lon).toBeCloseTo(ELSEWHERE.lng, 9);
    // The middle of the extent in projected pixels, which Mercator puts a few
    // metres poleward of the middle of its latitudes.
    expect(lat).toBeCloseTo(ELSEWHERE.lat, 3);
    expect(zoom).toBe(FIT_ZOOM);
    // A fit is a jump to something the user asked to see, so it ends following.
    expect(gpsTracked).toBe(false);
    expect(mapState.gpsTracked).toBe(false);
  });

  it('holds the fit to the zoom ceiling the caller named', async () => {
    const { refocuses } = setup();

    await fitMapToBbox(
      store.dispatch,
      [
        ELSEWHERE.lng - 0.001,
        ELSEWHERE.lat - 0.001,
        ELSEWHERE.lng + 0.001,
        ELSEWHERE.lat + 0.001,
      ],
      { maxZoom: FIT_ZOOM - 3 },
    );

    expect((refocuses()[0].payload as { zoom: number }).zoom).toBe(
      FIT_ZOOM - 3,
    );
  });
});
