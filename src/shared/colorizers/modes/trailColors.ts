import type { Colorizer } from '../colorize.js';
import { categoricalColorizer } from './pathDetail.js';

/**
 * One per bit of GraphHopper's `hiking_colours` / `bike_colours`, in the order
 * the encoded value assigns them — the order is the wire format, not a choice.
 * The colours are the outdoor map's `COLORS` (`src/render/layers/routes.rs`)
 * and `other` its `none`, so retuning either set means retuning both.
 */
const trailColors: { key: string; color: [number, number, number] }[] = [
  { key: 'red', color: [255, 48, 48] },
  { key: 'blue', color: [80, 80, 255] },
  { key: 'green', color: [0, 160, 0] },
  { key: 'yellow', color: [240, 240, 0] },
  { key: 'black', color: [0, 0, 0] },
  { key: 'orange', color: [255, 128, 0] },
  { key: 'purple', color: [192, 0, 192] },
  // Reads faintly — the casing under the route line is white too.
  { key: 'white', color: [255, 255, 255] },
  { key: 'other', color: [160, 160, 160] },
];

/** No colour in force yet, before the route reaches its first marked stretch. */
const NONE = -1;

/** The catch-all: a colour that could not be named. */
const OTHER = trailColors.length - 1;

/** The colours a mask holds, as indices into `trailColors`. */
function colorsOf(value: string): number[] {
  const mask = Number(value);

  if (!Number.isInteger(mask) || mask <= 0) {
    return [];
  }

  const colors = trailColors.flatMap((_, i) => (mask & (1 << i) ? [i] : []));

  // A bit above this table is the router's enum having grown past it. The way is
  // still marked, so it counts as `other` rather than as no marking at all.
  if (mask >>> trailColors.length && !colors.includes(OTHER)) {
    colors.push(OTHER);
  }

  // Never a choice beside a named colour, or it would win a shared stretch just
  // by being what the stretches around it are, leaving a red trail undrawn.
  return colors.length > 1 ? colors.filter((color) => color !== OTHER) : colors;
}

/** How a stretch was reached, painted in one colour. */
type Reached = { changes: number; score: number; from: number };

/**
 * Fewest colour changes; then the most metres given to the colours the route
 * follows furthest; then the change as late as it can fall, which only decides
 * a route whose colours run exactly as far as each other.
 */
function better(a: Reached, b: Reached, color: number): boolean {
  return a.changes !== b.changes
    ? a.changes < b.changes
    : a.score !== b.score
      ? a.score > b.score
      : b.from === color && a.from !== color;
}

type Stretch = { value: string; meters: number; detail: string };

/**
 * The colour of each stretch, resolved per waymark network: the walked and
 * ridden parts of a multimodal route merely share a palette, so neither the
 * colour in force nor the metres carry across the change of key.
 */
function continuousColors(stretches: Stretch[]): (string | undefined)[] {
  const keys: (string | undefined)[] = stretches.map(() => undefined);

  // By key, not by adjacency: a walk → ride → walk route is two networks, not
  // three, so the second walk resumes the trail the first was on.
  const byNetwork = new Map<string, number[]>();

  stretches.forEach(({ detail }, i) => {
    const at = byNetwork.get(detail);

    if (at) {
      at.push(i);
    } else {
      byNetwork.set(detail, [i]);
    }
  });

  for (const at of byNetwork.values()) {
    const colors = networkColors(at.map((i) => stretches[i]!));

    at.forEach((i, j) => {
      keys[i] = colors[j];
    });
  }

  return keys;
}

/**
 * The colour of each stretch of one network: fewest changes, then the shared
 * stretches to the trail followed furthest, then the change as late as it can
 * fall. An unmarked stretch is drawn as Unmarked but carries the colour across.
 */
function networkColors(stretches: Stretch[]): (string | undefined)[] {
  // Metres of the route each colour is marked on, which is what decides a
  // stretch that could be painted either way.
  const onRoute = new Map<number, number>();

  const options = stretches.map(({ value, meters }) => {
    const colors = colorsOf(value);

    for (const color of colors) {
      onRoute.set(color, (onRoute.get(color) ?? 0) + meters);
    }

    return colors;
  });

  // Per stretch, the best way to reach it with each colour in force. An
  // unmarked stretch carries every state through untouched.
  const table: Map<number, Reached>[] = [];

  for (const [i, { meters }] of stretches.entries()) {
    const previous = table[i - 1];

    const colors = options[i]!;

    if (colors.length === 0) {
      table.push(
        previous
          ? new Map(
              [...previous].map(([color, cell]) => [
                color,
                { ...cell, from: color },
              ]),
            )
          : new Map([[NONE, { changes: 0, score: 0, from: NONE }]]),
      );

      continue;
    }

    const reached = new Map<number, Reached>();

    for (const color of colors) {
      const gain = meters * (onRoute.get(color) ?? 0);

      if (!previous) {
        reached.set(color, { changes: 0, score: gain, from: NONE });

        continue;
      }

      let best: Reached | undefined;

      for (const [from, cell] of previous) {
        const candidate: Reached = {
          // Taking up a colour where none was in force is not a change.
          changes: cell.changes + (from === color || from === NONE ? 0 : 1),
          score: cell.score + gain,
          from,
        };

        if (!best || better(candidate, best, color)) {
          best = candidate;
        }
      }

      reached.set(color, best!);
    }

    table.push(reached);
  }

  let color: number | undefined;

  let end: Reached | undefined;

  // Ties fall to the first colour of the mask, the columns being built in that
  // order and only a strictly better cell replacing one.
  for (const [candidate, cell] of table.at(-1) ?? []) {
    if (
      !end ||
      cell.changes < end.changes ||
      (cell.changes === end.changes && cell.score > end.score)
    ) {
      color = candidate;

      end = cell;
    }
  }

  const keys: (string | undefined)[] = stretches.map(() => undefined);

  for (let i = table.length - 1; i >= 0 && color !== undefined; i--) {
    // The colour in force is not the colour painted: an unmarked stretch keeps
    // carrying one, and is still drawn as Unknown.
    keys[i] = options[i]!.length === 0 ? undefined : trailColors[color]?.key;

    color = table[i]!.get(color)?.from;
  }

  return keys;
}

/**
 * The colours of the waymarked routes a line follows. Which waymarks is the
 * profile's business: `pathDetailKeys` sends a walking profile `hiking_colours`
 * and a riding one `bike_colours`, and the line carries whichever it was sent.
 */
export const trailColorColorizer: Colorizer = categoricalColorizer({
  detail: ['hiking_colours', 'bike_colours'],
  categories: trailColors,
  resolve: continuousColors,
  // A car, OSRM or manual leg is sent neither mask; calling it Unmarked would
  // claim there is no trail where nobody looked.
  uncoveredIsNoData: true,
  // `other`'s grey at 50 %, blended rather than alpha: the Hotline palette has
  // no alpha channel, so a stop can only be an opaque colour.
  unknownColor: [208, 208, 208],
  labels: (cm) => cm.categories.trailColor,
});
