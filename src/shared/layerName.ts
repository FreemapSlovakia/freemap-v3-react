import type { Messages } from '@/translations/messagesInterface.js';

/**
 * A map's name: a custom or catalog map's own, else a built-in one's
 * translation; `undefined` for a nameless custom map or while messages load.
 */
export const layerName = (
  def: { type: string; name?: string },
  m: Messages | undefined,
): string | undefined => def.name || m?.mapLayers.letters[def.type];
