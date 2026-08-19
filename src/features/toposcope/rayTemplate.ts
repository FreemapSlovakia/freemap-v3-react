import { PROPERTY_PREFIX } from '@features/drawing/interpolateLabel.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { renderTemplate } from '@features/drawing/renderTemplate.js';

/** Metres to feet, for `{elevation_ft}`. */
const FEET_PER_METER = 3.28084;

/** Metres to statute miles, for `{distance_mi}`. */
const METERS_PER_MILE = 1609.344;

/**
 * What a ray's two template lines can name. Everything the dial works out for
 * itself, plus `{p:<name>}` for anything the point happens to carry.
 */
export type RayValues = {
  /** The point's own label, its own `{key}` references already resolved. */
  label: string;
  elevation?: string;
  elevation_ft?: string;
  distance: string;
  distance_mi: string;
  azimuth: string;
  location: string;
  props?: DrawingProps;
};

/**
 * What the template asked for, or `undefined` when it named something the dial
 * has never heard of — which is left on screen rather than swallowed, exactly
 * as a drawing label leaves it. A name the dial does know but has no value for
 * this ray (a point with no elevation) is empty instead, and takes any `[…]`
 * group around it with it.
 */
function resolve(key: string, values: RayValues): string | undefined {
  if (key.startsWith(PROPERTY_PREFIX)) {
    const name = key.slice(PROPERTY_PREFIX.length);

    // Own keys only: `{p:constructor}` must read as a property nobody
    // set, not as what every object inherits under that name.
    return values.props && Object.hasOwn(values.props, name)
      ? values.props[name]!
      : '';
  }

  switch (key) {
    case 'label':
      return values.label;
    case 'elevation':
      return values.elevation ?? '';
    case 'elevation_ft':
      return values.elevation_ft ?? '';
    case 'distance':
      return values.distance;
    case 'distance_mi':
      return values.distance_mi;
    case 'azimuth':
      return values.azimuth;
    case 'location':
      return values.location;
    default:
      return undefined;
  }
}

/**
 * Fills one of the dial's line templates, in the same language a drawing label
 * is written in: `{name}` for a value, `[…]` around a part to write only when
 * everything in it has something to say. `[{elevation} · ]{distance}` on a
 * point with no elevation reads as the distance alone rather than as
 * `· 12,3 km`.
 *
 * A name the dial doesn't know at all stays as written, the way a drawing label
 * leaves one — a template is applied to every ray at once, so a typo swallowed
 * here would be a typo swallowed everywhere.
 *
 * A value that carries newlines of its own — a multi-line point label,
 * `{location}` — keeps them, so a ray is written the way the label reads.
 */
export function fillRayTemplate(template: string, values: RayValues): string {
  return renderTemplate(template, (key) => resolve(key, values));
}

/** The elevation in feet, for a template that asks for it. */
export function metersToFeet(meters: number): number {
  return meters * FEET_PER_METER;
}

/** The distance in miles, likewise. */
export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}
