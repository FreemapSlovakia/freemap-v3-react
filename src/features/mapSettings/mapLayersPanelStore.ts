import type { RootState } from '@app/store/store.js';
import { libraryIndexByIdSelector } from '@features/mapLibrary/model/selectors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import storage from 'local-storage-fallback';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useStore } from 'react-redux';

const OPEN_KEY = 'fm.mapLayersPanel.open';

/** Whether the Map layers panel is open, and which of its rows is expanded. */
type PanelState = { open: boolean; expanded: string | null };

let state: PanelState | undefined;

const listeners = new Set<() => void>();

function getState(): PanelState {
  state ??= { open: storage.getItem(OPEN_KEY) === 'true', expanded: null };

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

  const expanded = useSyncExternalStore(subscribe, () => getState().expanded);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const setOpen = useCallback(
    (open: boolean) => update({ open }, cookiesEnabled),
    [cookiesEnabled],
  );

  const setExpanded = useCallback(
    (expanded: string | null) => update({ expanded }, false),
    [],
  );

  /** Opens the panel on this map's row. */
  const reveal = useCallback(
    (type: string) => update({ open: true, expanded: type }, cookiesEnabled),
    [cookiesEnabled],
  );

  return { open, setOpen, expanded, setExpanded, reveal };
}

// The kinds of map whose settings are what turning one on is usually for.
const EDITABLE = new Set(['wms', 'parametricShading']);

const isEditable = (state: RootState, type: string) =>
  EDITABLE.has(
    libraryIndexByIdSelector(state)[type]?.technology ??
      state.map.customLayers.find((def) => def.type === type)?.technology ??
      '',
  );

/**
 * Opens the panel on a WMS or shading map just turned on. Judged by what joins
 * `map.layers`, not by what is known of it: a map on as the page loads, whose
 * catalog entry or custom def arrives later, leaves the panel as it was.
 */
export function useRevealEditableMaps(enabled: boolean): void {
  const layers = useAppSelector((state) => state.map.layers);

  const store = useStore<RootState>();

  const { reveal } = useMapLayersPanel();

  const seen = useRef(layers);

  useEffect(() => {
    const before = seen.current;

    seen.current = layers;

    if (!enabled) {
      return;
    }

    const added = layers.find(
      (type) => !before.includes(type) && isEditable(store.getState(), type),
    );

    if (added) {
      reveal(added);
    }
  }, [layers, enabled, reveal, store]);
}
