import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import storage from 'local-storage-fallback';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

/** The panels stacked on the map, each under its own storage key; on a tie the first stays open. */
const PANELS = {
  shading: 'fm.shadingControl.collapsed',
  wmsLayers: 'fm.wmsLayersPanel.collapsed',
} as const;

export type MapPanel = keyof typeof PANELS;

const ORDER = Object.keys(PANELS) as MapPanel[];

let stored: Record<MapPanel, boolean> | undefined;

/** When each panel was last expanded here, to tell which of two open ones yields. */
const openedAt: Record<MapPanel, number> = { shading: 0, wmsLayers: 0 };

let clock = 0;

const shown = new Set<MapPanel>();

const listeners = new Set<() => void>();

function getStored(): Record<MapPanel, boolean> {
  stored ??= {
    shading: storage.getItem(PANELS.shading) === 'true',
    wmsLayers: storage.getItem(PANELS.wmsLayers) === 'true',
  };

  return stored;
}

/** Collapsed as stored, or yielding to another open panel on screen. */
function isCollapsed(panel: MapPanel): boolean {
  const s = getStored();

  return (
    s[panel] ||
    [...shown].some(
      (other) =>
        other !== panel &&
        !s[other] &&
        (openedAt[other] > openedAt[panel] ||
          (openedAt[other] === openedAt[panel] &&
            ORDER.indexOf(other) < ORDER.indexOf(panel))),
    )
  );
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Whether a map panel is collapsed, remembered across reloads. The panels
 * stack in one column, so of those on screen only one is expanded: the one
 * expanded last.
 */
export function useMapPanelCollapsed(
  panel: MapPanel,
): [boolean, (update: (collapsed: boolean) => boolean) => void] {
  const collapsed = useSyncExternalStore(subscribe, () => isCollapsed(panel));

  useEffect(() => {
    shown.add(panel);

    notify();

    return () => {
      shown.delete(panel);

      notify();
    };
  }, [panel]);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const setCollapsed = useCallback(
    (update: (collapsed: boolean) => boolean) => {
      const next = update(isCollapsed(panel));

      stored = { ...getStored(), [panel]: next };

      if (!next) {
        openedAt[panel] = ++clock;
      }

      if (cookiesEnabled) {
        storage.setItem(PANELS[panel], String(next));
      }

      notify();
    },
    [panel, cookiesEnabled],
  );

  return [collapsed, setCollapsed];
}
