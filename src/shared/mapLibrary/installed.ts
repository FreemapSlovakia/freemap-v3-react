import type { LayerSettings } from '@features/map/model/actions.js';
import { currentSite } from '@shared/sites.js';
import type { Shortcut } from '@shared/types/common.js';
import { isCatalogId } from './catalogId.js';
import { mapIndex } from './mapIndex.js';

type LayersSettings = Readonly<Record<string, LayerSettings>>;

// Those marked so, and on freemap.eu the maps of Slovakia alone.
const uninstalledByDefault: ReadonlySet<string> = new Set(
  mapIndex
    .filter(
      ({ defaultInstalled, countries }) =>
        defaultInstalled === false ||
        (currentSite === 'eu' &&
          countries?.length === 1 &&
          countries[0] === 'sk'),
    )
    .map(({ type }) => type),
);

/** Whether a built-in map starts uninstalled, on this site. */
export const isUninstalledByDefault = (type: string): boolean =>
  uninstalledByDefault.has(type);

/**
 * Whether the user keeps a library map; uninstalling hides it but its links
 * still work. Built-in maps start installed, catalog maps not; see also
 * `uninstalledByDefault`, whose maps count as installed once the user has
 * set anything for them.
 */
export const isLayerInstalled = (
  layersSettings: LayersSettings,
  type: string,
): boolean => {
  const settings = layersSettings[type];

  return (
    settings?.installed ??
    (!isCatalogId(type) &&
      (!uninstalledByDefault.has(type) || settings !== undefined))
  );
};

/** A map's shortcut: the user's own, where cleared (`null`) none, else its default. */
export const effectiveShortcut = (
  layersSettings: LayersSettings,
  def: { type: string; shortcut?: Shortcut | null },
): Shortcut | null | undefined => {
  const own = layersSettings[def.type]?.shortcut;

  return own === undefined ? def.shortcut : own;
};

/** Whether a list should offer a library map: installed, or on the map anyway. */
export const isLayerOffered = (
  layersSettings: LayersSettings,
  layers: readonly string[],
  type: string,
): boolean => isLayerInstalled(layersSettings, type) || layers.includes(type);
