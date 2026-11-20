import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Weather } from './forecast.js';
import { metSymbolCode } from './metSymbol.js';

const files = new Set(
  readdirSync('src/features/weatherForecast/icons').map((f) =>
    f.replace(/\.svg$/, ''),
  ),
);

describe('metSymbolCode', () => {
  it('names an icon file for every weather the API can send', () => {
    const missing: string[] = [];

    for (const day of [true, false]) {
      for (const sky of [
        'clear',
        'fair',
        'partlyCloudy',
        'cloudy',
        'fog',
      ] as const) {
        const code = metSymbolCode({
          sky,
          precipitation: null,
          thunder: false,
          day,
        });

        if (!files.has(code)) {
          missing.push(code);
        }
      }

      for (const type of ['rain', 'sleet', 'snow'] as const) {
        for (const intensity of ['light', 'moderate', 'heavy'] as const) {
          for (const showers of [false, true]) {
            for (const thunder of [false, true]) {
              const weather: Weather = {
                sky: showers ? 'partlyCloudy' : 'cloudy',
                precipitation: { type, intensity, showers },
                thunder,
                day,
              };

              const code = metSymbolCode(weather);

              if (!files.has(code)) {
                missing.push(code);
              }
            }
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
