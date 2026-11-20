import { makeSlot } from '@shared/storeSlot.js';
import type { LatLon } from '@shared/types/common.js';
import type { Maneuver } from './model/maneuvers.js';

/** A row hovered in the route panel, marked on the map. */
export type HoverSpot = LatLon &
  (
    | { kind: 'maneuver'; maneuver: Maneuver; left: boolean }
    | { kind: 'weather' }
  );

const slot = makeSlot<HoverSpot>(() => false);

export const setHoverSpot = slot.set;

export const useHoverSpot = slot.useValue;
