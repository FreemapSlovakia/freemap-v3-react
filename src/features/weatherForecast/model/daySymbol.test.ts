import { describe, expect, it } from 'vitest';
import { daySymbol, type Weather } from './forecast.js';

const sky = (s: Weather['sky']): Weather => ({
  sky: s,
  precipitation: null,
  thunder: false,
  day: true,
});

const rain = (thunder = false): Weather => ({
  sky: 'cloudy',
  precipitation: { type: 'rain', intensity: 'light', showers: false },
  thunder,
  day: true,
});

// 6:00 to 21:00: fifteen hours.
const day = (rest: Weather, ...first: Weather[]) => [
  ...first,
  ...Array.from({ length: 15 - first.length }, () => rest),
];

describe('daySymbol', () => {
  it('takes the most common sky, not the worst', () => {
    expect(daySymbol(day(sky('clear'), sky('cloudy'), sky('fog')))).toEqual(
      sky('clear'),
    );
  });

  it('shows a short rain as showers under a sunny sky', () => {
    expect(daySymbol(day(sky('clear'), rain(), rain(), rain()))).toEqual({
      ...sky('clear'),
      precipitation: { type: 'rain', intensity: 'light', showers: true },
    });
  });

  it('shows rain in more than a quarter of the hours as rain', () => {
    expect(
      daySymbol(day(sky('clear'), rain(), rain(), rain(), rain())),
    ).toEqual(rain());
  });

  it('shows a short rain under a cloudy sky as rain', () => {
    expect(daySymbol(day(sky('cloudy'), rain()))).toEqual(rain());
  });

  it('shows thunder in any hour', () => {
    expect(daySymbol(day(sky('clear'), rain(true)))).toEqual(rain(true));
  });
});
