import { hasRole } from '@features/auth/model/types.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { type CatalogEntry, loadLibraryCatalog } from './catalog.js';

/**
 * The catalog, loaded once `wanted`, or why it failed to load; wanted again,
 * it is asked again.
 */
export function useLibraryCatalog(wanted = true): {
  catalog: CatalogEntry[] | undefined;
  error: unknown;
} {
  const [catalog, setCatalog] = useState<CatalogEntry[]>();

  const [error, setError] = useState<unknown>();

  // Asked again, an old failure no longer stands.
  const [wasWanted, setWasWanted] = useState(wanted);

  if (wanted !== wasWanted) {
    setWasWanted(wanted);

    if (wanted) {
      setError(undefined);
    }
  }

  useEffect(() => {
    if (!wanted) {
      return;
    }

    let live = true;

    loadLibraryCatalog().then(
      (entries) => {
        if (live) {
          setCatalog(entries);
        }
      },
      (err: unknown) => {
        if (live) {
          setError(err);
        }
      },
    );

    return () => {
      live = false;
    };
  }, [wanted]);

  return { catalog, error };
}

/** `isLayerInstalled`, kept while only other settings change. */
export function useIsInstalled(): (type: string) => boolean {
  // The maps whose settings make them differ from their default install state,
  // so an opacity or a tick doesn't refilter the catalog.
  const overridden = useAppSelector(
    (state) =>
      Object.keys(state.map.layersSettings).filter(
        (type) =>
          isLayerInstalled(state.map.layersSettings, type) !==
          isLayerInstalled({}, type),
      ),
    shallowEqual,
  );

  return useMemo(() => {
    const flipped = new Set(overridden);

    return (type) => isLayerInstalled({}, type) !== flipped.has(type);
  }, [overridden]);
}

/** Whether the user may see a library map: one in preview needs the role. */
export function useCanSee(): (entry: CatalogEntry) => boolean {
  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  return useMemo(
    () => (entry) => canPreviewLayers || !entry.index?.layerPreview,
    [canPreviewLayers],
  );
}

/** Whether a library map can still be added: not installed, and not hidden. */
export function useIsAvailable(): (entry: CatalogEntry) => boolean {
  const canSee = useCanSee();

  const isInstalled = useIsInstalled();

  return useMemo(
    () => (entry) => !isInstalled(entry.type) && canSee(entry),
    [isInstalled, canSee],
  );
}
