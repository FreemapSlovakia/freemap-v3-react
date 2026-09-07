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
  /**
   * The wedge is grabbed and swung. A shape of its own takes the press — the
   * marker's box is square, and the wedge itself fades to nothing well before
   * its rim, so either would catch presses over bare map. The marker must stay
   * **non**-interactive for that: Leaflet's own interactivity is the whole box,
   * and its absence is what leaves this the only way in. Written as a style
   * rather than left to the class beside it, which several Leaflet rules of
   * two classes would outrank.
   */
  grabbable?: boolean;
}

/**
 * How far out a grabbable wedge takes presses, as a fraction of its radius.
 * The gradient reaches nothing at the rim, so past this it is map to look at
 * and would be a swing to press.
 */
const GRAB_REACH = 0.65;

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
  grabbable,
}: BeamIconOptions): DivIcon {
  const half = (Math.min(halfAngle, 179.95) * Math.PI) / 180;

  const wedge = (r: number) =>
    `M0 0L${(r * Math.sin(-half)).toFixed(2)} ${(-r * Math.cos(-half)).toFixed(2)}A${r} ${r} 0 ${halfAngle > 90 ? 1 : 0} 1 ${(r * Math.sin(half)).toFixed(2)} ${(-r * Math.cos(half)).toFixed(2)}Z`;

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
        <path fill="url(#${gradientId})" d="${wedge(radius)}"/>${
          grabbable
            ? `\n        <path class="fm-beam-grab" style="pointer-events:all;cursor:grab" fill="none" d="${wedge(radius * GRAB_REACH)}"/>`
            : ''
        }
      </svg>
    </div>`,
  });
}
