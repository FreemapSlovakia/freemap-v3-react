import type { LayerSettings } from '@features/map/model/actions.js';

type LayersSettings = Readonly<Record<string, LayerSettings>>;

/** Whether the user keeps a library map; uninstalling hides it but its links still work. */
export const isLayerInstalled = (
  layersSettings: LayersSettings,
  type: string,
): boolean => layersSettings[type]?.installed ?? true;

/** Whether a list should offer a library map: installed, or on the map anyway. */
export const isLayerOffered = (
  layersSettings: LayersSettings,
  layers: readonly string[],
  type: string,
): boolean => isLayerInstalled(layersSettings, type) || layers.includes(type);
