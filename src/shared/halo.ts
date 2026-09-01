/**
 * How much wider than the line every halo is drawn — the track viewer's
 * selection halo, the route's casing, the elevation chart's range band — so
 * each reads as the same ring, whatever it is drawn around.
 */
export const HALO_WIDTH = 6;

/** The ink a selection halo is drawn in, the route's casing included. */
export const HALO_COLOR = '#fff';

/**
 * What a selected feature's halo, and the route's casing under a selected leg,
 * are drawn in: Bootstrap's `primary`, the ink the selected menu item and the
 * selection toolbar's border already carry. Spelled out because some of it
 * reaches Leaflet as a color to parse (`splitColorAlpha`), which takes hex.
 */
export const SELECTION_COLOR = '#0d6efd';

/**
 * The second halo, for the one place two must be told apart: the far half of a
 * pending cut. Bootstrap's `warning`, spelled out for the same reason.
 */
export const SECOND_SELECTION_COLOR = '#ffc107';
