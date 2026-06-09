import { authInitialState } from '@features/auth/model/reducer.js';
import { cookieConsentInitialState } from '@features/cookieConsent/model/reducer.js';
import { drawingSettingsInitialState } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { homeLocationInitialState } from '@features/homeLocation/model/reducer.js';
import { l10nInitialState } from '@features/l10n/model/reducer.js';
import { mapInitialState } from '@features/map/model/reducer.js';
import { mapDetailsInitialState } from '@features/mapDetails/model/reducer.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
import { trackViewerInitialState } from '@features/trackViewer/model/reducer.js';
import storage from 'local-storage-fallback';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getInitialState,
  PersistedAuthSchema,
  PersistedCookieConsentSchema,
  PersistedMapSchema,
} from './persistence.js';

/**
 * Characterization tests: these pin the CURRENT behavior of the persistence
 * rehydration layer. They are the safety net for an upcoming refactor that
 * collapses the split save/rehydrate logic into one table — so they assert
 * what the code does today, not what it "should" do.
 */

// A complete, valid persisted user (drives PersistedAuthSchema → UserSchema).
const validUser = {
  authProviders: ['osm'],
  authToken: 'tok',
  credits: 0,
  email: 'a@b.c',
  description: null,
  id: 1,
  isAdmin: false,
  coordinates: null,
  name: 'Tester',
  premiumExpiration: '2026-05-17T12:00:48.000Z',
  sendGalleryEmails: false,
  hasPicture: false,
};

function seed(blob: unknown) {
  storage.setItem('store', JSON.stringify(blob));
}

beforeEach(() => {
  storage.clear();
});

afterEach(() => {
  storage.clear();
});

describe('getInitialState — top-level blob handling', () => {
  it('returns an empty-ish initial state when nothing is persisted', () => {
    // No `store` key at all.
    expect(getInitialState()).toEqual({});
  });

  it('returns {} for an empty persisted object', () => {
    seed({});
    expect(getInitialState()).toEqual({});
  });

  it('does not throw on a non-JSON blob (try/catch around JSON.parse)', () => {
    storage.setItem('store', 'not json {{{');
    expect(getInitialState()).toEqual({});
  });
});

describe('getInitialState — legacy map migration { mapType, overlays } → { layers }', () => {
  it('builds layers from mapType + overlays', () => {
    seed({ map: { mapType: 'X', overlays: ['A', 'B'] } });

    const { map } = getInitialState();

    expect(map?.layers).toEqual(['X', 'A', 'B']);
    // Migrated slice still merges over the initial state.
    expect(map).toEqual({ ...mapInitialState, layers: ['X', 'A', 'B'] });
  });

  it('keeps other persisted map fields while migrating', () => {
    seed({
      map: { mapType: 'X', overlays: [], lat: 10, lon: 20, zoom: 12 },
    });

    const { map } = getInitialState();

    expect(map?.layers).toEqual(['X']);
    expect(map?.lat).toBe(10);
    expect(map?.lon).toBe(20);
    expect(map?.zoom).toBe(12);
  });

  it('does NOT migrate when overlays is missing (no partial match)', () => {
    // Only mapType present → migration guard fails, layers stays from blob/init.
    seed({ map: { mapType: 'X', layers: ['Y'] } });

    const { map } = getInitialState();

    // `mapType` is stripped (not in PersistedMapSchema); layers comes straight
    // from the blob, unmigrated.
    expect(map?.layers).toEqual(['Y']);
  });
});

describe('getInitialState — parseWithFallback (slices once stored under `main`)', () => {
  it('reads cookieConsent from its own top-level key', () => {
    seed({
      cookieConsent: {
        cookieConsentResult: true,
        analyticCookiesAllowed: false,
      },
    });

    expect(getInitialState().cookieConsent).toEqual({
      ...cookieConsentInitialState,
      cookieConsentResult: true,
      analyticCookiesAllowed: false,
    });
  });

  it('falls back to the legacy `main` location for cookieConsent', () => {
    seed({
      main: { cookieConsentResult: true, analyticCookiesAllowed: false },
    });

    expect(getInitialState().cookieConsent).toEqual({
      ...cookieConsentInitialState,
      cookieConsentResult: true,
      analyticCookiesAllowed: false,
    });
  });

  it('prefers the primary key over the `main` fallback', () => {
    seed({
      cookieConsent: { cookieConsentResult: true },
      main: { cookieConsentResult: false, analyticCookiesAllowed: false },
    });

    expect(getInitialState().cookieConsent?.cookieConsentResult).toBe(true);
    // analyticCookiesAllowed not in primary → stays at initial default (not the
    // fallback's value), because the primary parsed non-empty and wins wholesale.
    expect(getInitialState().cookieConsent?.analyticCookiesAllowed).toBe(
      cookieConsentInitialState.analyticCookiesAllowed,
    );
  });

  it('falls through an empty-object primary to the fallback (keys-length guard)', () => {
    seed({ cookieConsent: {}, main: { cookieConsentResult: true } });

    expect(getInitialState().cookieConsent?.cookieConsentResult).toBe(true);
  });

  it('reads homeLocation / drawingSettings from `main` fallback too', () => {
    seed({
      main: {
        homeLocation: { lat: 1, lon: 2 },
        locate: true,
        style: { color: '#ff0000' },
      },
    });

    const initial = getInitialState();

    expect(initial.homeLocation).toEqual({
      ...homeLocationInitialState,
      homeLocation: { lat: 1, lon: 2 },
    });
    // drawingSettings.style merges over the initial nested style.
    expect(initial.drawingSettings).toEqual({
      ...drawingSettingsInitialState,
      style: { ...drawingSettingsInitialState.style, color: '#ff0000' },
    });
  });

  it('does not rehydrate the `location` slice (no PERSIST entry)', () => {
    // `location` has no entry, so persisted blobs for it are ignored.
    seed({
      location: { locate: true },
      main: { locate: true, location: { lat: 1, lon: 2, accuracy: 5 } },
    });

    expect(getInitialState().location).toBeUndefined();
  });
});

describe('getInitialState — per-slice isolation', () => {
  it('a malformed slice does not nuke the other slices', () => {
    seed({
      map: 12345, // garbage → PersistedMapSchema.safeParse fails
      auth: { user: { authToken: 999 } }, // garbage user → auth parse fails
      l10n: { chosenLanguage: 'sk' }, // valid
      cookieConsent: { cookieConsentResult: true }, // valid
    });

    const initial = getInitialState();

    expect(initial.map).toBeUndefined();
    expect(initial.auth).toBeUndefined();
    expect(initial.l10n).toEqual({ ...l10nInitialState, chosenLanguage: 'sk' });
    expect(initial.cookieConsent?.cookieConsentResult).toBe(true);
  });
});

describe('getInitialState — merge over initialState', () => {
  it('merges a partial routePlanner blob over its initial state', () => {
    seed({
      routePlanner: {
        transportType: 'car',
        milestones: 'abs',
        preventHint: true,
      },
    });

    expect(getInitialState().routePlanner).toEqual({
      ...routePlannerInitialState,
      transportType: 'car',
      milestones: 'abs',
      preventHint: true,
    });
  });

  it('merges a partial trackViewer blob over its initial state', () => {
    seed({ trackViewer: { colorizeTrackBy: 'heartRate' } });

    expect(getInitialState().trackViewer).toEqual({
      ...trackViewerInitialState,
      colorizeTrackBy: 'heartRate',
    });
  });

  it('merges a partial mapDetails blob over its initial state', () => {
    seed({ mapDetails: { excludeSources: ['nominatim-reverse'] } });

    expect(getInitialState().mapDetails).toEqual({
      ...mapDetailsInitialState,
      excludeSources: ['nominatim-reverse'],
    });
  });

  it('rehydrates auth.user with premiumExpiration parsed to a Date', () => {
    seed({ auth: { user: validUser } });

    const user = getInitialState().auth?.user;

    expect(user?.name).toBe('Tester');
    expect(user?.premiumExpiration).toBeInstanceOf(Date);
    expect((user?.premiumExpiration as Date).toISOString()).toBe(
      '2026-05-17T12:00:48.000Z',
    );
  });

  it('defaults auth.user to the initial value when the auth blob has no user', () => {
    seed({ auth: {} });

    expect(getInitialState().auth).toEqual({
      ...authInitialState,
      user: authInitialState.user,
    });
  });
});

describe('Persisted*Schema — direct safeParse behavior', () => {
  it('PersistedMapSchema accepts a partial valid blob', () => {
    const r = PersistedMapSchema.safeParse({ lat: 1, lon: 2, zoom: 3 });

    expect(r.success).toBe(true);
    expect(r.data).toEqual({ lat: 1, lon: 2, zoom: 3 });
  });

  it('PersistedMapSchema rejects a wrong-typed field', () => {
    expect(PersistedMapSchema.safeParse({ lat: 'nope' }).success).toBe(false);
  });

  it('PersistedMapSchema rejects a non-object', () => {
    expect(PersistedMapSchema.safeParse(12345).success).toBe(false);
  });

  it('PersistedCookieConsentSchema accepts an empty object (all optional)', () => {
    const r = PersistedCookieConsentSchema.safeParse({});

    expect(r.success).toBe(true);
    expect(r.data).toEqual({});
  });

  it('PersistedAuthSchema parses premiumExpiration ISO string → Date', () => {
    const r = PersistedAuthSchema.safeParse({ user: validUser });

    expect(r.success).toBe(true);
    expect(r.data?.user?.premiumExpiration).toBeInstanceOf(Date);
  });

  it('PersistedAuthSchema drops invalid settings to undefined (catch), keeping the user', () => {
    const r = PersistedAuthSchema.safeParse({
      user: { ...validUser, settings: 'garbage' },
    });

    expect(r.success).toBe(true);
    expect(r.data?.user?.settings).toBeUndefined();
  });

  it('PersistedAuthSchema rejects a structurally invalid user', () => {
    expect(
      PersistedAuthSchema.safeParse({ user: { authToken: 999 } }).success,
    ).toBe(false);
  });
});
