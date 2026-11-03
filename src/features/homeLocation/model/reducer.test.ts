import { authSetUser } from '@features/auth/model/actions.js';
import { authReducer } from '@features/auth/model/reducer.js';
import type { User } from '@features/auth/model/types.js';
import { describe, expect, it } from 'vitest';
import { homeLocationSent, saveHomeLocation } from './actions.js';
import { homeLocationInitialState, homeLocationReducer } from './reducer.js';

const user = (coordinates: User['coordinates']) =>
  authSetUser({ coordinates } as User);

const here = { lat: 48, lon: 17 };

const there = { lat: 49, lon: 18 };

describe('home location sync', () => {
  it("takes the account's, removal included, when nothing is unsent", () => {
    const state = { ...homeLocationInitialState, homeLocation: here };

    expect(homeLocationReducer(state, user(there)).homeLocation).toEqual(there);

    expect(homeLocationReducer(state, user(null)).homeLocation).toBeNull();
  });

  it('keeps an unsent change over the account', () => {
    const saved = homeLocationReducer(
      homeLocationInitialState,
      saveHomeLocation(here),
    );

    expect(saved.unsent).toBe(true);

    expect(homeLocationReducer(saved, user(there)).homeLocation).toEqual(here);

    const removed = homeLocationReducer(saved, saveHomeLocation(null));

    expect(homeLocationReducer(removed, user(there)).homeLocation).toBeNull();
  });

  it("updates the logged-in user's copy once sent", () => {
    const loggedIn = authReducer(
      undefined,
      authSetUser({ coordinates: here } as User),
    );

    expect(
      authReducer(loggedIn, homeLocationSent(null)).user?.coordinates,
    ).toBeNull();
  });

  it('counts as sent only what is still current', () => {
    const saved = homeLocationReducer(
      homeLocationInitialState,
      saveHomeLocation(there),
    );

    expect(homeLocationReducer(saved, homeLocationSent(here)).unsent).toBe(
      true,
    );

    expect(homeLocationReducer(saved, homeLocationSent(there)).unsent).toBe(
      false,
    );
  });
});
