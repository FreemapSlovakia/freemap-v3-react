import storage from 'local-storage-fallback';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getInitialState } from '../rootReducer.js';
import type { RootState } from '../store.js';
import { statePersistingMiddleware } from './statePersistingMiddleware.js';

/**
 * Characterization tests for the SAVE side. `persistSelectedState` is not
 * exported, so we drive it through the exported middleware and read back the
 * serialized `store` key. This pins exactly which fields get persisted — the
 * counterpart contract to `getInitialState`'s rehydration.
 */

const premiumDate = new Date('2026-05-17T12:00:48.000Z');

// Only the fields `persistSelectedState` reads need to be present; cast through
// `unknown` since we're deliberately building a partial RootState.
function makeState(): RootState {
  return {
    l10n: { chosenLanguage: 'sk', language: 'en' },
    main: { hiddenInfoBars: { foo: 1 } },
    homeLocation: { homeLocation: { lat: 1, lon: 2 } },
    // In state but not persisted (no PERSIST entry).
    location: { locate: true, location: { lat: 1, lon: 2, accuracy: 5 } },
    cookieConsent: { cookieConsentResult: true, analyticCookiesAllowed: false },
    drawingSettings: {
      style: {
        color: '#0000ff',
        fillColor: '#0000ff33',
        width: 4,
        markerType: 'pin',
        dashArray: [],
        lineCap: 'round',
        lineJoin: 'round',
      },
      recentColors: ['#ff0000'],
    },
    objects: { selectedIcon: 'pin' },
    routePlanner: {
      preventHint: true,
      transportType: 'hiking',
      milestones: false,
    },
    auth: {
      user: {
        authProviders: ['osm'],
        authToken: 'tok',
        credits: 0,
        email: 'a@b.c',
        description: null,
        id: 1,
        coordinates: null,
        name: 'Tester',
        premiumExpiration: premiumDate,
        sendGalleryEmails: false,
        hasPicture: false,
      },
    },
    map: {
      layersSettings: {},
      lat: 48,
      lon: 17,
      zoom: 8,
      layers: ['X'],
      customLayers: [],
      legacyMapWarningSuppressions: [],
      shading: { backgroundColor: [0, 0, 0, 1], components: [] },
      maxZoom: 20,
      resolutionScale: null,
      featureScale: 1,
      stravaHeatmapColor: 'purple',
    },
    gallery: {
      colorizeBy: null,
      showDirection: true,
      showLegend: true,
      recentTags: ['x'],
      premium: true,
    },
    mapDetails: { excludeSources: [] },
    trackViewer: { colorizeTrackBy: 'heartRate' },
  } as unknown as RootState;
}

// Invoke the middleware with a stubbed store API and an identity `next`.
function runMiddleware(state: RootState) {
  const api = {
    getState: () => state,
    dispatch: (action: unknown) => action,
  };

  return statePersistingMiddleware(api as never)((action: unknown) => action)({
    type: 'test',
  });
}

beforeEach(() => {
  storage.clear();
  window.fmEmbedded = false;
});

afterEach(() => {
  storage.clear();
  window.fmEmbedded = false;
});

describe('statePersistingMiddleware — what gets persisted', () => {
  it('serializes exactly the curated subset of state', () => {
    runMiddleware(makeState());

    const saved = JSON.parse(storage.getItem('store') ?? 'null');

    expect(saved).toEqual({
      l10n: { chosenLanguage: 'sk' },
      main: { hiddenInfoBars: { foo: 1 } },
      homeLocation: { homeLocation: { lat: 1, lon: 2 } },
      cookieConsent: {
        cookieConsentResult: true,
        analyticCookiesAllowed: false,
      },
      drawingSettings: {
        style: {
          color: '#0000ff',
          fillColor: '#0000ff33',
          width: 4,
          markerType: 'pin',
          dashArray: [],
          lineCap: 'round',
          lineJoin: 'round',
        },
        recentColors: ['#ff0000'],
      },
      objects: { selectedIcon: 'pin' },
      routePlanner: {
        preventHint: true,
        transportType: 'hiking',
        milestones: false,
      },
      auth: {
        user: {
          authProviders: ['osm'],
          authToken: 'tok',
          credits: 0,
          email: 'a@b.c',
          description: null,
          id: 1,
          coordinates: null,
          name: 'Tester',
          // Date serialized to ISO string (the toISOString() branch).
          premiumExpiration: '2026-05-17T12:00:48.000Z',
          sendGalleryEmails: false,
          hasPicture: false,
        },
      },
      map: {
        layersSettings: {},
        lat: 48,
        lon: 17,
        zoom: 8,
        layers: ['X'],
        customLayers: [],
        legacyMapWarningSuppressions: [],
        shading: { backgroundColor: [0, 0, 0, 1], components: [] },
        maxZoom: 20,
        resolutionScale: null,
        featureScale: 1,
        stravaHeatmapColor: 'purple',
      },
      gallery: {
        colorizeBy: null,
        showDirection: true,
        showLegend: true,
        recentTags: ['x'],
        premium: true,
      },
      mapDetails: { excludeSources: [] },
      trackViewer: { colorizeTrackBy: 'heartRate' },
    });
  });

  it('persists exactly this set of top-level slices (anti-drift guard)', () => {
    // If a new persisted slice is added, update `makeState` + the expected blob
    // above AND this list — otherwise this fails loudly instead of the snapshot
    // silently ignoring the new key.
    runMiddleware(makeState());

    const saved = JSON.parse(storage.getItem('store') ?? 'null');

    expect(Object.keys(saved).sort()).toEqual(
      [
        'auth',
        'cookieConsent',
        'drawingSettings',
        'gallery',
        'homeLocation',
        'l10n',
        'main',
        'map',
        'mapDetails',
        'objects',
        'routePlanner',
        'trackViewer',
      ].sort(),
    );
  });

  it('does NOT persist the `location` slice', () => {
    // `location` has no PERSIST entry, so it is neither saved nor rehydrated.
    runMiddleware(makeState());

    const saved = JSON.parse(storage.getItem('store') ?? 'null');

    expect(saved).not.toHaveProperty('location');
  });

  it('serializes a null premiumExpiration as null', () => {
    const state = makeState();

    (state.auth.user as { premiumExpiration: Date | null }).premiumExpiration =
      null;

    runMiddleware(state);

    const saved = JSON.parse(storage.getItem('store') ?? 'null');

    expect(saved.auth.user.premiumExpiration).toBeNull();
  });

  it('does NOT write while cookieConsentResult is null', () => {
    const state = makeState();

    (
      state.cookieConsent as { cookieConsentResult: boolean | null }
    ).cookieConsentResult = null;

    runMiddleware(state);

    expect(storage.getItem('store')).toBeNull();
  });

  it('does NOT write when embedded', () => {
    window.fmEmbedded = true;

    runMiddleware(makeState());

    expect(storage.getItem('store')).toBeNull();
  });
});

describe('save → rehydrate round-trip', () => {
  it('persisted slices survive a save followed by getInitialState', () => {
    runMiddleware(makeState());

    const initial = getInitialState();

    expect(initial.l10n?.chosenLanguage).toBe('sk');
    expect(initial.main?.hiddenInfoBars).toEqual({ foo: 1 });
    expect(initial.homeLocation?.homeLocation).toEqual({ lat: 1, lon: 2 });
    expect(initial.cookieConsent?.cookieConsentResult).toBe(true);
    expect(initial.objects?.selectedIcon).toBe('pin');
    expect(initial.routePlanner?.transportType).toBe('hiking');
    expect(initial.map?.layers).toEqual(['X']);
    expect(initial.map?.zoom).toBe(8);
    expect(initial.gallery?.recentTags).toEqual(['x']);
    // trackViewer.colorizeTrackBy round-trips through save → rehydrate.
    expect(initial.trackViewer?.colorizeTrackBy).toBe('heartRate');

    // premiumExpiration round-trips Date → ISO string → Date.
    expect(initial.auth?.user?.premiumExpiration).toBeInstanceOf(Date);
    expect((initial.auth?.user?.premiumExpiration as Date).toISOString()).toBe(
      premiumDate.toISOString(),
    );
  });
});
