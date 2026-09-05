/**
 * How much wider than the line every halo is drawn — the track viewer's
 * selection halo, the route's casing, the elevation chart's range band — so
 * each reads as the same ring, whatever it is drawn around.
 */
export const HALO_WIDTH = 6;

/** The ink a selection halo is drawn in, the route's casing included. */
export const HALO_COLOR = '#fff';

/**
 * The one pane every halo is drawn into, below the lines it rings (overlayPane
 * is 400). Its `opacity` fades the whole group in a single composite, so each
 * halo paints opaque and overlapping ones never double up into a darker ring.
 * A feature needing its own dimming nests a sub-pane here — the opacities
 * multiply, so a nested one can only fade further.
 */
export const HALO_PANE = 'fm-halo';

export const HALO_PANE_Z = 398;

/**
 * What a sub-pane of `HALO_PANE` must set to sit under or over the halos drawn
 * straight into it. Leaflet's CSS gives every pane `z-index: 400` and each
 * pane's own renderer 200, so a nested pane that leaves z-index unset lands on
 * top of everything in the group instead of falling back to document order.
 */
export const HALO_UNDER_Z = 100;
export const HALO_OVER_Z = 300;

/** How much of the map shows through a halo. */
export const HALO_OPACITY = 2 / 3;

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
