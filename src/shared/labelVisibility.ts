import z from 'zod';

export const LabelVisibilitySchema = z.enum(['always', 'hover', 'selected']);

export type LabelVisibility = z.infer<typeof LabelVisibilitySchema>;

export type LabelTooltipMode = 'permanent' | 'hover';

/**
 * How a feature's label tooltip is mounted, or `undefined` for none. A Leaflet
 * tooltip can't switch `permanent` in place, so the caller keys it on this.
 */
export function labelTooltipMode(
  visibility: LabelVisibility,
  selected: boolean,
): LabelTooltipMode | undefined {
  return visibility === 'hover'
    ? 'hover'
    : visibility === 'always' || selected
      ? 'permanent'
      : undefined;
}
