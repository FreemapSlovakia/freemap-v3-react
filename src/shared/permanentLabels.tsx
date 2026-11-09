import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Tooltip, type TooltipProps } from 'react-leaflet';

/** From this zoom, markers that can crowd a view (notes, changesets) keep their tooltips open; below it, on hover. */
const PERMANENT_LABELS_FROM_ZOOM = 14;

export const usePermanentLabels = () =>
  useAppSelector((state) => state.map.zoom >= PERMANENT_LABELS_FROM_ZOOM);

/** A tooltip that may switch between permanent and on hover. */
export function SwitchableTooltip({
  permanent,
  ...props
}: TooltipProps): ReactElement {
  // Leaflet reads `permanent` only when the tooltip is bound.
  return <Tooltip key={String(permanent)} permanent={permanent} {...props} />;
}
