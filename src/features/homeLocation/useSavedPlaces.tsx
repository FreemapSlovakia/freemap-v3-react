import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { type ReactElement, useCallback, useMemo } from 'react';
import { FaMapPin } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export type SavedPlace = {
  /** `place-<id>`; usable as a dropdown's event key. */
  key: string;
  label: string;
  icon: ReactElement;
  position: LatLon;
};

/**
 * The user's places, as a place picker offers them; `choosePlace` resolves the
 * chosen item's key (tracked under `where`), and `addPlace` is what to offer
 * while there are none: the account's places, or first the login.
 */
export function useSavedPlaces(): {
  places: SavedPlace[];
  choosePlace: (key: string | null, where: string) => LatLon | undefined;
  addPlace: () => void;
} {
  const dispatch = useDispatch();

  const places = useAppSelector((state) => state.homeLocation.places);

  const loggedIn = useAppSelector((state) => state.auth.user !== null);

  const saved = useMemo(
    () =>
      places.map((p) => ({
        key: `place-${p.id}`,
        label: p.name,
        icon: <FaMapPin />,
        position: { lat: p.lat, lon: p.lon },
      })),
    [places],
  );

  const choosePlace = useCallback(
    (key: string | null, where: string) => {
      const position = saved.find((p) => p.key === key)?.position;

      if (position) {
        trackMatomo(['trackEvent', 'Places', 'use', where]);
      }

      return position;
    },
    [saved],
  );

  // Places are the account's.
  const addPlace = useCallback(() => {
    dispatch(
      setActiveModal(
        loggedIn ? { type: 'account', section: 'places' } : { type: 'login' },
      ),
    );
  }, [dispatch, loggedIn]);

  return { places: saved, choosePlace, addPlace };
}
