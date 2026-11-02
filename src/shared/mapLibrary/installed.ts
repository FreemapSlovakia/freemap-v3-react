import type { LayerSettings } from '@features/map/model/actions.js';
import { currentSite } from '@shared/sites.js';
import type { Shortcut } from '@shared/types/common.js';
import { isCatalogId } from './catalogId.js';
import { mapIndex, mapIndexById } from './mapIndex.js';

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

/** Catalog maps installed until the user uninstalls them, on this site. */
export const catalogInstalledByDefault: readonly string[] =
  currentSite === 'sk'
    ? // RÚ mobile coverage, one per operator.
      ['FSK18', 'FSK19', 'FSK20', 'FSK21']
    : [];

/** Whether a built-in map starts uninstalled, on this site. */
export const isUninstalledByDefault = (type: string): boolean =>
  uninstalledByDefault.has(type);

/**
 * Whether the user keeps a library map; uninstalling hides it but its links
 * still work. Built-in maps start installed, catalog maps not but for
 * `catalogInstalledByDefault`; see also `uninstalledByDefault`, whose maps
 * count as installed once the user has set anything for them.
 */
export const isLayerInstalled = (
  layersSettings: LayersSettings,
  type: string,
): boolean => {
  const settings = layersSettings[type];

  return (
    settings?.installed ??
    (isCatalogId(type)
      ? catalogInstalledByDefault.includes(type)
      : !uninstalledByDefault.has(type) || settings !== undefined)
  );
};

const sameShortcut = (a: Shortcut, b: Shortcut) =>
  a.code === b.code &&
  Boolean(a.shift) === Boolean(b.shift) &&
  Boolean(a.ctrl) === Boolean(b.ctrl) &&
  Boolean(a.alt) === Boolean(b.alt) &&
  Boolean(a.meta) === Boolean(b.meta);

export type UserShortcut = { type: string; shortcut: Shortcut };

/** The shortcuts the user gave maps and presets: in their settings, and a custom map's own. */
export const userShortcuts = (
  layersSettings: LayersSettings,
  customLayers: readonly { type: string; shortcut?: Shortcut }[],
): UserShortcut[] => [
  ...Object.entries(layersSettings).flatMap(([type, { shortcut }]) =>
    shortcut ? [{ type, shortcut }] : [],
  ),
  ...customLayers.flatMap(({ type, shortcut }) =>
    shortcut && layersSettings[type]?.shortcut === undefined
      ? [{ type, shortcut }]
      : [],
  ),
];

/**
 * A map's shortcut: the user's own, where cleared (`null`) none, else its
 * default — but a built-in map's default yields to the same keys the user gave
 * another map or preset, so a map added with a new default can't take them.
 */
export const effectiveShortcut = (
  layersSettings: LayersSettings,
  def: { type: string; shortcut?: Shortcut | null },
  taken: readonly UserShortcut[],
): Shortcut | null | undefined => {
  const own = layersSettings[def.type]?.shortcut;

  if (own !== undefined) {
    return own;
  }

  const { shortcut } = def;

  return shortcut &&
    def.type in mapIndexById &&
    taken.some((t) => t.type !== def.type && sameShortcut(t.shortcut, shortcut))
    ? null
    : shortcut;
};

/** Whether a list should offer a library map: installed, or on the map anyway. */
export const isLayerOffered = (
  layersSettings: LayersSettings,
  layers: readonly string[],
  type: string,
): boolean => isLayerInstalled(layersSettings, type) || layers.includes(type);
