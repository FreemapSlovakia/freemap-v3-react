import type { Messages } from '@/translations/messagesInterface.js';

/**
 * A map's name: a custom or catalog map's own, else a built-in one's
 * translation; `undefined` for a nameless custom map or while messages load.
 */
export const layerName = (
  def: { type: string; name?: string },
  m: Messages | undefined,
): string | undefined => def.name || m?.mapLayers.letters[def.type];

/** {@link layerName}, or "Custom map X" for a map that has none. */
export const layerLabel = (
  def: { type: string; name?: string },
  m: Messages | undefined,
): string =>
  layerName(def, m) ?? `${m?.mapLayers.customBase ?? ''} ${def.type}`;
