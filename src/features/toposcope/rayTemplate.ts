import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';

/** Metres to feet, for `{elevation_ft}`. */
const FEET_PER_METER = 3.28084;

/** Metres to statute miles, for `{distance_mi}`. */
const METERS_PER_MILE = 1609.344;

/**
 * What a ray's two template lines can name. Everything the dial works out for
 * itself, plus `{property:<name>}` for anything the point happens to carry.
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
 * A template a piece at a time: the text the user wrote between the braces, and
 * what each `{name}` resolved to. Kept apart because only the written pieces are
 * punctuation the dial may take back — a value is a value, and `St. Peter` keeps
 * its full stop wherever it lands.
 */
type Piece = { text: string; written: boolean };

/** A written piece that is nothing but the marks holding two values apart. */
const SEPARATORS_ONLY = /^[ \t·,.;\-–—/|]*$/;

function resolve(key: string, values: RayValues): string {
  if (key.startsWith('property:')) {
    const name = key.slice('property:'.length);

    // Own keys only: `{property:constructor}` must read as a property nobody
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
      return '';
  }
}

/**
 * Fills one of the dial's line templates. Unlike a drawing label — where an
 * unknown `{key}` stays on screen so a typo is visible — a template lists
 * optional facts, so a name it can't answer expands to nothing and the line
 * closes up around it: `{elevation} · {distance}` on a point with no elevation
 * reads as the distance alone rather than as `· 12,3 km`.
 *
 * That closing up is done on the template's own punctuation and never on a
 * value's, so `{label}` holding `Poprad, Slovakia` comes through untouched.
 *
 * A value that carries newlines of its own — a multi-line point label,
 * `{location}` — keeps them, so a ray is written the way the label reads.
 */
export function fillRayTemplate(template: string, values: RayValues): string {
  const pieces: Piece[] = [];

  let at = 0;

  for (const match of template.matchAll(/\{([^{}]*)\}/g)) {
    if (match.index > at) {
      pieces.push({ text: template.slice(at, match.index), written: true });
    }

    pieces.push({ text: resolve(match[1]!, values), written: false });

    at = match.index + match[0].length;
  }

  if (at < template.length) {
    pieces.push({ text: template.slice(at), written: true });
  }

  // What a value left behind when it came out empty: the marks that had been
  // holding it to its neighbours. Dropped where they now sit against an end of
  // the line, and collapsed where two of them met in the middle.
  const kept = pieces.filter((piece) => piece.text);

  const says = (piece: Piece) =>
    !piece.written || !SEPARATORS_ONLY.test(piece.text);

  const out: string[] = [];

  let emittedSomething = false;

  let lastWasSeparator = false;

  for (const [i, piece] of kept.entries()) {
    if (says(piece)) {
      out.push(piece.text);

      emittedSomething = true;

      lastWasSeparator = false;

      continue;
    }

    const somethingFollows = kept.slice(i + 1).some(says);

    if (emittedSomething && somethingFollows && !lastWasSeparator) {
      out.push(piece.text);

      lastWasSeparator = true;
    }
  }

  return out.join('');
}

/** The elevation in feet, for a template that asks for it. */
export function metersToFeet(meters: number): number {
  return meters * FEET_PER_METER;
}

/** The distance in miles, likewise. */
export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}
