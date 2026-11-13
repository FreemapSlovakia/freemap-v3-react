import { describe, expect, it } from 'vitest';
import {
  type CssGradientStop,
  gradientCss,
  parseGradientCss,
} from './gradientCss.js';

const stops: CssGradientStop[] = [
  { rgba: [10, 20, 30, 1], pct: 0 },
  { rgba: [40, 50, 60, 0.5], pct: 37.5 },
  { rgba: [70, 80, 90, 1], pct: 100 },
];

describe('gradientCss / parseGradientCss', () => {
  it('round-trips the stops and the selected one', () => {
    expect(parseGradientCss(gradientCss(stops, 1))).toEqual({
      stops,
      active: 1,
    });
  });

  it('reads a stop dragged past either end', () => {
    expect(
      parseGradientCss(
        'linear-gradient(90deg, rgba(1,2,3,1) -5%, RGBA(4,5,6,1) 105%)',
      ),
    ).toEqual({
      stops: [
        { rgba: [1, 2, 3, 1], pct: -5 },
        { rgba: [4, 5, 6, 1], pct: 105 },
      ],
      active: 1,
    });
  });

  it('reads any spacing, and rgb as opaque', () => {
    expect(
      parseGradientCss(
        'linear-gradient(90deg, rgba( 1, 2 ,3, 0.5 )  0%, rgb(4,5,6)\t100%)',
      )?.stops,
    ).toEqual([
      { rgba: [1, 2, 3, 0.5], pct: 0 },
      { rgba: [4, 5, 6, 1], pct: 100 },
    ]);
  });

  it('skips a stop not written as numbers', () => {
    expect(
      parseGradientCss(
        'linear-gradient(90deg, rgba(1,2,3,50%) 0%, rgba(1 2 3 / 0.5) 50%, rgba(4,5,6,1) 100%)',
      )?.stops,
    ).toEqual([{ rgba: [4, 5, 6, 1], pct: 100 }]);
  });

  it('answers nothing for a plain colour, or a gradient it cannot read', () => {
    expect(parseGradientCss('rgba(1,2,3,1)')).toBeNull();

    expect(
      parseGradientCss('linear-gradient(90deg, #ff0000 0%, #00ff00 100%)'),
    ).toBeNull();
  });
});
