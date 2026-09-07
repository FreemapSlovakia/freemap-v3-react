import { useMessages } from '@features/l10n/l10nInjector.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { LatLon } from '@shared/types/common.js';
import type { LatLngLiteral, Marker as LeafletMarker } from 'leaflet';
import { type ReactElement, useCallback, useState } from 'react';
import { Tooltip } from 'react-leaflet';

/** How far a viewpoint fades once the pin has moved off the place it belongs to. */
const GHOST_OPACITY = 0.45;

/**
 * How high the eye stands, said the way every panel says it. The panorama's
 * standing figure and the viewshed's eye both wear it, and how a height is
 * written is one decision rather than two.
 */
export function ViewpointElevationTooltip({
  elevation,
}: {
  elevation: number;
}): ReactElement {
  const m = useMessages();

  // Plain, not the `meter` unit style: `general.masl` follows it and says both
  // the unit and what it is measured from.
  const nf = useNumberFormat({ maximumFractionDigits: 0 });

  return (
    <Tooltip direction="top">
      {m?.general.viewpoint}: {nf.format(elevation)} {m?.general.masl}
    </Tooltip>
  );
}

/**
 * Where a render was taken from, while the pin stands somewhere else: faded, so
 * it reads as the place the picture belongs to rather than as a second
 * viewpoint, and carrying the elevation the render answered for that place —
 * which is still true of it, whatever the pin has since been dragged over.
 */
export function GhostViewpointMarker({
  position,
  color,
  faIcon,
  elevation,
}: {
  position: LatLngLiteral;
  color: string;
  faIcon: ReactElement;
  elevation: number;
}): ReactElement {
  return (
    <RichMarker
      position={position}
      color={color}
      opacity={GHOST_OPACITY}
      draggable={false}
      // Under the live pin, for a drag that ends up nearly back where it began.
      zIndexOffset={-500}
      faIcon={faIcon}
    >
      <ViewpointElevationTooltip elevation={elevation} />
    </RichMarker>
  );
}

/**
 * A viewpoint pin that stages a place rather than committing to one: `dragging`
 * is what keeps the ghost up for the length of the gesture, since the store
 * hears nothing until it ends.
 *
 * Re-rendering inside the gesture is only safe because `RichMarker` keeps the
 * icon it has where nothing changed: rebuilding one reaches Leaflet's
 * `setIcon`, which replaces the drag handler and drops the gesture with it.
 */
export function useStagedViewpoint(onMove: (at: LatLon) => void): {
  dragging: boolean;
  handlers: {
    dragstart: () => void;
    dragend: (e: { target: unknown }) => void;
  };
} {
  const [dragging, setDragging] = useState(false);

  const dragstart = useCallback(() => setDragging(true), []);

  const dragend = useCallback(
    (e: { target: unknown }) => {
      setDragging(false);

      const { lat, lng } = (e.target as LeafletMarker).getLatLng();

      onMove({ lat, lon: lng });
    },
    [onMove],
  );

  return { dragging, handlers: { dragstart, dragend } };
}
