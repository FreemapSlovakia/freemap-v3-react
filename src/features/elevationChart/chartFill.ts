import {
  type Colorizer,
  NO_DATA_COLOR,
  paletteColorAt,
  rgbCss,
} from '@shared/colorizers/colorize.js';
import { lowerBound } from '@shared/geoutils.js';
import { clamp } from '@shared/mathUtils.js';
import type { ColorizedAtDistance } from './hooks/useChartColorize.js';

export interface FillStop {
  /** Where along the plot, from 0 at its left edge to 1 at its right. */
  offset: number;
  color: string;
}

/** A stretch of one colour, in metres along the profile. */
export interface FillBand {
  from: number;
  to: number;
  color: string;
}

/**
 * The fill for a mode that names categories rather than measuring a scale:
 * one band per stretch of a value, painted solid.
 *
 * Not a gradient with a colour change at each boundary, though the stops say
 * exactly that: a browser rasterizes a wide gradient through a lookup table of
 * its own size, so every hard step comes out smeared over several pixels — which
 * on an unzoomed chart, where a stretch is a dozen pixels wide, turns a road
 * surface into a wash. Solid shapes cannot blend.
 */
export function buildFillBands(
  colorizer: Colorizer | null,
  stops: ColorizedAtDistance[],
  vFrom: number,
  vTo: number,
): FillBand[] | null {
  if (!colorizer || stops.length < 2 || !(vTo > vFrom)) {
    return null;
  }

  const bands: FillBand[] = [];

  for (const stop of stops) {
    const color = colorOf(colorizer, stop);

    const last = bands.at(-1);

    if (last?.color === color) {
      last.to = stop.distance;
    } else {
      // A boundary is one distance with a colour on each side, so the next band
      // starts where the last one ended rather than at its own first stop.
      bands.push({
        from: last ? last.to : stop.distance,
        to: stop.distance,
        color,
      });
    }
  }

  const visible = bands
    .map((band) => ({
      ...band,
      from: Math.max(band.from, vFrom),
      to: Math.min(band.to, vTo),
    }))
    .filter((band) => band.to > band.from);

  return visible.length ? visible : null;
}

const colorOf = (colorizer: Colorizer, stop: ColorizedAtDistance) =>
  stop.gap
    ? NO_DATA_COLOR
    : rgbCss(paletteColorAt(colorizer.palette, stop.color));

/**
 * The gradient the profile's fill is painted with, for the stretch of it on
 * screen — for the modes that measure a scale; a categorical one is banded
 * instead (see {@link buildFillBands}). `null` where there is nothing to paint.
 *
 * Two rules earn their keep here: a run of one colour is written as its two
 * ends, not once, or it would blur into whatever follows; and at most one stop
 * per pixel column is written, since the list is rebuilt on every frame of a
 * drag and a vertex apiece would be thousands of elements for a gradient the
 * screen shows one colour per pixel of.
 */
export function buildFillStops(
  colorizer: Colorizer | null,
  stops: ColorizedAtDistance[],
  vFrom: number,
  vTo: number,
  plotWidth: number,
): FillStop[] | null {
  if (!colorizer || stops.length < 2 || !(vTo > vFrom)) {
    return null;
  }

  // The visible run, and the stop straddling each edge so the ends are coloured
  // by what actually reaches them. Bisected: zoomed into the far end of a long
  // profile, a walk would cross the whole of it on every frame.
  const first = Math.max(
    0,
    lowerBound(stops.length, (i) => stops[i]!.distance > vFrom) - 1,
  );

  const last = Math.min(
    stops.length - 1,
    lowerBound(stops.length, (i) => stops[i]!.distance >= vTo),
  );

  const out: FillStop[] = [];

  // The end of an unbroken run of one colour, held back until the colour
  // changes.
  let pending: FillStop | null = null;

  const pixelOf = (i: number) =>
    Math.round(
      clamp((stops[i]!.distance - vFrom) / (vTo - vFrom), 0, 1) * plotWidth,
    );

  // The last vertex in a pixel column is the one written — the last rather than
  // the first because a categorical mode changes value between two coincident
  // points, and the second of that pair is the new category.
  let pixel = pixelOf(first);

  for (let i = first; i <= last; i++) {
    const next = i < last ? pixelOf(i + 1) : Number.NaN;

    if (i < last && next === pixel) {
      continue;
    }

    const stop = stops[i]!;

    const color = colorOf(colorizer, stop);

    const offset = clamp((stop.distance - vFrom) / (vTo - vFrom), 0, 1);

    pixel = next;

    const previous = out.at(-1);

    if (previous?.color === color) {
      pending = { offset, color };

      continue;
    }

    if (pending) {
      out.push(pending);

      pending = null;
    }

    out.push({ offset, color });
  }

  if (pending) {
    out.push(pending);
  }

  return out.length > 1 ? out : null;
}
