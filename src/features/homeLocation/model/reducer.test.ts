import { authLogout } from '@features/auth/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  deletePlace,
  placeStored,
  savePlace,
  startPickingPlace,
} from './actions.js';
import { homeLocationInitialState, homeLocationReducer } from './reducer.js';

const cottage = { id: -1, name: 'Cottage', lat: 48, lon: 17 };

describe('places', () => {
  it('adds, changes and deletes a place', () => {
    const added = homeLocationReducer(
      homeLocationInitialState,
      savePlace(cottage),
    );

    const moved = homeLocationReducer(
      added,
      savePlace({ ...cottage, name: 'Hut', lat: 49 }),
    );

    expect(moved.places).toEqual([{ ...cottage, name: 'Hut', lat: 49 }]);

    expect(homeLocationReducer(moved, deletePlace(-1)).places).toEqual([]);
  });

  it("takes the account's id once stored, unless deleted meanwhile", () => {
    const added = homeLocationReducer(
      homeLocationInitialState,
      savePlace(cottage),
    );

    const stored = { ...cottage, id: 7 };

    expect(
      homeLocationReducer(added, placeStored({ localId: -1, place: stored }))
        .places,
    ).toEqual([stored]);

    const deleted = homeLocationReducer(added, deletePlace(-1));

    expect(
      homeLocationReducer(deleted, placeStored({ localId: -1, place: stored }))
        .places,
    ).toEqual([]);
  });

  it('saves a pick begun before the create finished under the new id', () => {
    const picking = homeLocationReducer(
      homeLocationReducer(homeLocationInitialState, savePlace(cottage)),
      startPickingPlace({ id: -1 }),
    );

    const stored = homeLocationReducer(
      picking,
      placeStored({ localId: -1, place: { ...cottage, id: 7 } }),
    );

    expect(stored.pickingPlace).toBe(7);

    const edited = homeLocationReducer(
      stored,
      savePlace({ ...cottage, id: 7, name: 'Hut' }),
    );

    expect(edited.places).toEqual([{ ...cottage, id: 7, name: 'Hut' }]);
  });

  it('picks an existing place from where it is, a new one from nothing', () => {
    const state = homeLocationReducer(
      homeLocationInitialState,
      savePlace(cottage),
    );

    expect(
      homeLocationReducer(state, startPickingPlace({ id: -1 })),
    ).toMatchObject({
      selectingHomeLocation: { lat: 48, lon: 17 },
      pickingPlace: -1,
      pickedPlaceName: 'Cottage',
    });

    expect(homeLocationReducer(state, startPickingPlace({}))).toMatchObject({
      selectingHomeLocation: null,
      pickingPlace: null,
      pickedPlaceName: '',
    });
  });

  it('forgets the places on logout', () => {
    const state = homeLocationReducer(
      homeLocationInitialState,
      savePlace(cottage),
    );

    expect(homeLocationReducer(state, authLogout()).places).toEqual([]);
  });
});
