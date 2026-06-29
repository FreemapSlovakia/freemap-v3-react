import z from 'zod';
import { ColorizingModeSchema } from './index.js';

// Shared bits for the per-feature colorize settings slices (routePlanner,
// tracking, trackViewer). Only what is genuinely identical lives here: the
// legend-toggle semantics (`toggleColorizeLegend`, used by all three) and the
// persisted `{ colorizeBy, colorizeLegend }` shape (used by the two slices
// whose field is named `colorizeBy`). The colorize-mode *setter* stays inline
// in each reducer because trackViewer's field is `colorizeTrackBy` (matching
// its `track-colorize-by` URL param and `trackViewerColorizeTrackBy` action),
// so a shared setter would need a per-feature field accessor that saves nothing.

/**
 * Shared zod shape for a feature's persisted colorize preferences. Spread into
 * each feature's persisted-settings schema so the representation is defined
 * once (a feature may add its own fields, e.g. routePlanner's `preventHint`).
 */
export const ColorizeSettingsShape = {
  colorizeBy: ColorizingModeSchema.nullable(),
  colorizeLegend: z.boolean(),
};

/**
 * Applies a colorize-legend toggle in a settings reducer: sets the explicit
 * value, or flips the current one when the payload is omitted.
 */
export function toggleColorizeLegend(
  state: { colorizeLegend: boolean },
  payload: boolean | undefined,
): void {
  state.colorizeLegend = payload ?? !state.colorizeLegend;
}
