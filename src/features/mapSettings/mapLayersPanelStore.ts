import type { RootState } from '@app/store/store.js';
import {
  mapByIdSelector,
  mapEntryOf,
} from '@features/mapLibrary/model/selectors.js';
import { getMinWidthForBreakpoint } from '@shared/breakpoints.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import storage from 'local-storage-fallback';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useStore } from 'react-redux';

const OPEN_KEY = 'fm.mapLayersPanel.open';

// From `sm` up, as the toolbar's own layout switch; below, the panel covers the map.
const WIDE = `(min-width: ${getMinWidthForBreakpoint('sm')}px)`;

/**
 * Where the panel is: the stack, a preset in it (`{ preset }`), the settings
 * of a map (`{ type }`, with `preset` a preset's copy of it), or the items of
 * a tool's features (`{ feature }`, a `useMapFeatureRows` id).
 */
export type PanelPlace = { preset?: string; type?: string; feature?: string };

/** Whether the panel leaves the map in view beside it. */
export const isWideScreen = () => window.matchMedia(WIDE).matches;

/**
 * Whether the Map layers panel is open, and where in it. `attention` marks its
 * button while it holds settings it didn't open for; `auto` is an opening for a
 * map just turned on, not the user's, which closes again with that map.
 */
type PanelState = {
  open: boolean;
  place: PanelPlace;
  attention: boolean;
  auto: boolean;
};

const TOP: PanelPlace = {};

let state: PanelState | undefined;

const listeners = new Set<() => void>();

function getState(): PanelState {
  state ??= {
    open: storage.getItem(OPEN_KEY) === 'true',
    place: TOP,
    attention: false,
    auto: false,
  };

  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function update(patch: Partial<PanelState>, persist: boolean) {
  state = { ...getState(), ...patch };

  if (persist && patch.open !== undefined) {
    storage.setItem(OPEN_KEY, String(patch.open));
  }

  for (const listener of listeners) {
    listener();
  }
}

/**
 * The Map layers panel's state, kept outside React so the toolbar button, the
 * panel and the hook opening it for a newly shown map share it.
 */
export function useMapLayersPanel() {
  const open = useSyncExternalStore(subscribe, () => getState().open);

  const place = useSyncExternalStore(subscribe, () => getState().place);

  const attention = useSyncExternalStore(subscribe, () => getState().attention);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const setOpen = useCallback(
    (open: boolean) =>
      update({ open, attention: false, auto: false }, cookiesEnabled),
    [cookiesEnabled],
  );

  // Moving in the panel makes it the user's.
  const setPlace = useCallback(
    (place: PanelPlace) => update({ place, auto: false }, false),
    [],
  );

  /**
   * Opens the panel on this map's settings; on a phone, where it would cover
   * the map, only points its button at them.
   */
  const reveal = useCallback(
    (type: string) => {
      const { open, auto } = getState();

      if (!isWideScreen()) {
        update({ place: { type }, attention: !open }, false);
      } else {
        update(
          { open: true, place: { type }, auto: !open || auto },
          cookiesEnabled,
        );
      }
    },
    [cookiesEnabled],
  );

  return { open, setOpen, place, setPlace, reveal, attention };
}

// The kinds of map whose settings are what turning one on is usually for.
const EDITABLE = new Set(['wms', 'parametricShading']);

const isEditable = (state: RootState, type: string) => {
  const ref = mapByIdSelector(state)[type];

  // An offline map's tiles are downloaded already.
  return (
    ref?.origin !== 'cached' && EDITABLE.has(mapEntryOf(ref)?.technology ?? '')
  );
};

/**
 * Opens the panel on a WMS or shading map just turned on. Judged by what joins
 * `map.layers`, not by what is known of it: a map on as the page loads, whose
 * catalog entry or custom def arrives later, leaves the panel as it was.
 */
export function useRevealEditableMaps(enabled: boolean): void {
  const layers = useAppSelector((state) => state.map.layers);

  const store = useStore<RootState>();

  const { reveal, setOpen } = useMapLayersPanel();

  const seen = useRef(layers);

  useEffect(() => {
    const before = seen.current;

    seen.current = layers;

    const { attention, auto, open, place } = getState();

    // The map it was opened or pointed at for is gone.
    if (place.type !== undefined && !layers.includes(place.type)) {
      if (auto && open) {
        setOpen(false);
      } else if (attention) {
        update({ attention: false }, false);
      }
    }

    if (!enabled) {
      return;
    }

    const added = layers.find(
      (type) => !before.includes(type) && isEditable(store.getState(), type),
    );

    if (added) {
      reveal(added);
    }
  }, [layers, enabled, reveal, setOpen, store]);
}
