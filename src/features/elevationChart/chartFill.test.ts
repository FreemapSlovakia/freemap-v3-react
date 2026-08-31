import type { Colorizer, HotlinePalette } from '@shared/colorizers/colorize.js';
import { NO_DATA_COLOR } from '@shared/colorizers/colorize.js';
import { describe, expect, it } from 'vitest';
import { buildFillBands, buildFillStops } from './chartFill.js';
import type { ColorizedAtDistance } from './hooks/useChartColorize.js';

// Black at one end, white at the other, so a palette position reads back as a
// grey level and an expectation says which colour without arithmetic.
const palette: HotlinePalette = [
  { r: 0, g: 0, b: 0, t: 0 },
  { r: 255, g: 255, b: 255, t: 1 },
];

const smooth = { palette } as Colorizer;

const categorical = { palette, spanBased: true } as Colorizer;

const at = (distance: number, color: number, gap = false) =>
  ({ distance, color, gap }) satisfies ColorizedAtDistance;

/** A plot 100 px wide, so an offset is a percentage of it. */
const PLOT = 100;

describe('buildFillStops', () => {
  it('paints nothing without a colorizer, or with one stop', () => {
    expect(
      buildFillStops(null, [at(0, 0), at(100, 1)], 0, 100, PLOT),
    ).toBeNull();

    expect(buildFillStops(smooth, [at(0, 0)], 0, 100, PLOT)).toBeNull();
  });

  it('spreads the palette across the visible window', () => {
    expect(
      buildFillStops(smooth, [at(0, 0), at(100, 1)], 0, 100, PLOT),
    ).toEqual([
      { offset: 0, color: 'rgb(0 0 0)' },
      { offset: 1, color: 'rgb(255 255 255)' },
    ]);
  });

  it('measures offsets against the window, not the whole line', () => {
    // Zoomed into the second half: the stop at 150 sits in the middle of it.
    const stops = buildFillStops(
      smooth,
      [at(0, 0), at(150, 0.5), at(200, 1)],
      100,
      200,
      PLOT,
    );

    expect(stops).toEqual([
      { offset: 0, color: 'rgb(0 0 0)' },
      { offset: 0.5, color: 'rgb(128 128 128)' },
      { offset: 1, color: 'rgb(255 255 255)' },
    ]);
  });

  it('keeps the stop before the window, which is what colours its left edge', () => {
    // Nothing is written between 0 and 50, so the colour reaching the edge is
    // the one at 0 — dropped, the fill would start at the wrong grey.
    const stops = buildFillStops(smooth, [at(0, 0), at(100, 1)], 50, 100, PLOT);

    expect(stops?.[0]).toEqual({ offset: 0, color: 'rgb(0 0 0)' });
  });

  it('holds a run of one colour to its end instead of blurring into what follows', () => {
    // Written once, the gradient would fade from black at 0 all the way to
    // white at 300 rather than turning at 200.
    expect(
      buildFillStops(
        smooth,
        [at(0, 0), at(100, 0), at(200, 0), at(300, 1)],
        0,
        300,
        PLOT,
      ),
    ).toEqual([
      { offset: 0, color: 'rgb(0 0 0)' },
      { offset: 2 / 3, color: 'rgb(0 0 0)' },
      { offset: 1, color: 'rgb(255 255 255)' },
    ]);
  });

  it('paints a stretch the mode cannot value in the map’s own grey', () => {
    const stops = buildFillStops(
      smooth,
      [at(0, 0), at(100, 0, true), at(200, 0, true), at(300, 1)],
      0,
      300,
      PLOT,
    );

    expect(stops?.map(({ color }) => color)).toEqual([
      'rgb(0 0 0)',
      NO_DATA_COLOR,
      NO_DATA_COLOR,
      'rgb(255 255 255)',
    ]);
  });

  it('writes at most one stop per pixel column', () => {
    // A thousand vertices across a hundred pixels: a stop apiece would be a
    // thousand elements rebuilt on every frame of a drag.
    const dense = Array.from({ length: 1000 }, (_, i) => at(i, (i % 2) / 1000));

    const stops = buildFillStops(smooth, dense, 0, 999, PLOT);

    expect(stops!.length).toBeLessThanOrEqual(PLOT + 2);

    // Still spans the window. The first stop is the last vertex inside the
    // leftmost pixel column rather than the very first vertex — a sub-pixel
    // difference the gradient's own padding covers — while the last vertex is
    // always written, so the right edge is exact.
    expect(stops!.at(0)!.offset).toBeLessThanOrEqual(1 / PLOT);

    expect(stops!.at(-1)?.offset).toBe(1);
  });
});

// A gradient cannot hold a hard edge: a browser rasterizes a wide one through a
// lookup table of its own size, smearing every step over several pixels. So a
// mode that names categories is painted as solid bands instead.
describe('buildFillBands', () => {
  it('gives each stretch of one value a band, meeting at the boundary', () => {
    expect(
      buildFillBands(
        categorical,
        [at(0, 0), at(150, 0), at(150, 1), at(300, 1)],
        0,
        300,
      ),
    ).toEqual([
      { from: 0, to: 150, color: 'rgb(0 0 0)' },
      { from: 150, to: 300, color: 'rgb(255 255 255)' },
    ]);
  });

  it('keeps a band narrower than a pixel, which is what a gradient washed away', () => {
    const bands = buildFillBands(
      categorical,
      [at(0, 0), at(100, 0), at(100, 1), at(105, 1), at(105, 0), at(300, 0)],
      0,
      300,
    );

    expect(bands).toHaveLength(3);

    expect(bands![1]).toEqual({
      from: 100,
      to: 105,
      color: 'rgb(255 255 255)',
    });
  });

  it('clips to what is on screen and drops what is off it', () => {
    expect(
      buildFillBands(
        categorical,
        [at(0, 0), at(150, 0), at(150, 1), at(300, 1)],
        200,
        300,
      ),
    ).toEqual([{ from: 200, to: 300, color: 'rgb(255 255 255)' }]);
  });

  it('bands a stretch the mode cannot value in the map’s own grey', () => {
    expect(
      buildFillBands(
        categorical,
        [at(0, 0), at(100, 0), at(100, 0, true), at(300, 0, true)],
        0,
        300,
      )?.at(-1),
    ).toEqual({ from: 100, to: 300, color: NO_DATA_COLOR });
  });

  it('paints nothing without a colorizer or a second stop', () => {
    expect(buildFillBands(null, [at(0, 0), at(100, 1)], 0, 100)).toBeNull();

    expect(buildFillBands(categorical, [at(0, 0)], 0, 100)).toBeNull();
  });
});
