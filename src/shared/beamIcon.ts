import { type DivIcon, divIcon } from 'leaflet';

export interface BeamIconOptions {
  /** Half the angle the wedge spans, degrees; anything up to a full circle. */
  halfAngle: number;
  /** Marker box, which must hold the wedge whichever way it is turned. */
  size: number;
  radius: number;
  color: string;
  /** Where the fade starts, as a fraction of the radius. */
  innerStop: number;
  innerOpacity: number;
  /** Two beams on one map must not share a gradient id. */
  gradientId: string;
}

/**
 * A wedge fading outwards from its apex, drawn pointing north; the caller turns
 * the marker element to the bearing, so a pan only rewrites one transform.
 *
 * Used both for where a device is facing and for the slice of horizon a
 * panorama holds — same geometry, different size and colour.
 */
export function makeBeamIcon({
  halfAngle,
  size,
  radius,
  color,
  innerStop,
  innerOpacity,
  gradientId,
}: BeamIconOptions): DivIcon {
  const half = (Math.min(halfAngle, 179.95) * Math.PI) / 180;

  const x1 = (radius * Math.sin(-half)).toFixed(2);

  const y1 = (-radius * Math.cos(-half)).toFixed(2);

  const x2 = (radius * Math.sin(half)).toFixed(2);

  const y2 = (-radius * Math.cos(half)).toFixed(2);

  // `display:block` on the svg is load-bearing: inline it would sit on the text
  // baseline, leaving the wrapper taller than the svg (`.leaflet-container` sets
  // `line-height: 1.5`) so `transform-origin: 50% 50%` would rotate about a
  // point below the marker anchor and swing the apex off the position.
  //
  // The arc's flags are large-arc then sweep, in that order — past half the
  // circle the short way round is the wrong one, and the two swapped draw a
  // spindle through the apex.
  return divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="transform-origin:50% 50%">
      <svg style="display:block" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-size / 2} ${-size / 2} ${size} ${size}">
        <radialGradient id="${gradientId}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${radius}">
          <stop offset="${innerStop}" stop-color="${color}" stop-opacity="${innerOpacity}"/>
          <stop offset="1" stop-color="${color}" stop-opacity="0"/>
        </radialGradient>
        <path fill="url(#${gradientId})" d="M0 0L${x1} ${y1}A${radius} ${radius} 0 ${halfAngle > 90 ? 1 : 0} 1 ${x2} ${y2}Z"/>
      </svg>
    </div>`,
  });
}
