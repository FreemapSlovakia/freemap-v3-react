import { useAppSelector } from './useAppSelector.js';

/**
 * Whether the map is zoomed in far enough for `minZoom` to show every label.
 * Rounded as the label form shows the current zoom, for a fractional `zoomSnap`.
 */
export function useLabelsZoomedIn(minZoom: number | null): boolean {
  return useAppSelector(
    (state) => minZoom !== null && Math.round(state.map.zoom) >= minZoom,
  );
}
