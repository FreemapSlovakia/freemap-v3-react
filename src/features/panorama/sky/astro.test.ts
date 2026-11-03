import { describe, expect, it } from 'vitest';
import {
  brightLimbAngle,
  moonAge,
  moonEcliptic,
  moonIllumination,
  refraction,
  skyPosition,
} from './astro.js';

const BRATISLAVA = { lat: 48.1486, lon: 17.1077 };

describe('moonEcliptic', () => {
  // Meeus, example 47.a: 1992-04-12 0h TD.
  it('matches the worked example', () => {
    const { lambda, beta, distance } = moonEcliptic(
      Date.UTC(1992, 3, 12) - 59_000,
    );

    expect(((lambda % 360) + 360) % 360).toBeCloseTo(133.1627, 1);

    expect(beta).toBeCloseTo(-3.2291, 1);

    expect(distance).toBeGreaterThan(368_300);

    expect(distance).toBeLessThan(368_500);
  });
});

describe('skyPosition', () => {
  // Sunrise and sunset over a level horizon, 2026-06-21: 04:51 and 20:55 CEST.
  it('puts the sun on the horizon at sunrise and sunset', () => {
    for (const time of [
      Date.UTC(2026, 5, 21, 2, 51),
      Date.UTC(2026, 5, 21, 18, 55),
    ]) {
      const { altitude, radius } = skyPosition(
        'sun',
        time,
        BRATISLAVA.lat,
        BRATISLAVA.lon,
      );

      expect(Math.abs(altitude + radius)).toBeLessThan(0.25);
    }
  });

  it('puts the solstice noon sun due south at 90° − φ + ε', () => {
    const { azimuth, altitude } = skyPosition(
      'sun',
      Date.UTC(2026, 5, 21, 10, 53),
      BRATISLAVA.lat,
      BRATISLAVA.lon,
    );

    expect(azimuth).toBeCloseTo(180, 0);

    expect(altitude).toBeCloseTo(90 - BRATISLAVA.lat + 23.44, 0);
  });
});

describe('refraction', () => {
  it('is about half a degree at the horizon and nothing overhead', () => {
    expect(refraction(0)).toBeCloseTo(0.48, 1);

    expect(refraction(89)).toBeLessThan(0.001);
  });
});

describe('moonAge', () => {
  it('is about 180 at a full moon and 0 at a new one', () => {
    expect(moonAge(Date.UTC(2024, 3, 23, 23, 49))).toBeCloseTo(180, 0);

    const atNew = moonAge(Date.UTC(2024, 3, 8, 18, 21));

    expect(Math.min(atNew, 360 - atNew)).toBeLessThan(1);
  });

  it('is waxing a week after a new moon', () => {
    expect(moonAge(Date.UTC(2024, 3, 15, 18))).toBeGreaterThan(60);

    expect(moonAge(Date.UTC(2024, 3, 15, 18))).toBeLessThan(120);
  });
});

describe('brightLimbAngle', () => {
  const { lat, lon } = BRATISLAVA;

  it('points down at an evening crescent over the set sun', () => {
    // Three days after new moon, an hour past sunset: the sun is below the moon.
    const angle = brightLimbAngle(Date.UTC(2024, 3, 11, 18, 30), lat, lon);

    expect(Math.abs(angle)).toBeGreaterThan(120);
  });

  it('points left at a morning last quarter, the sun rising in the east', () => {
    const angle = brightLimbAngle(Date.UTC(2024, 4, 1, 6), lat, lon);

    expect(angle).toBeLessThan(-30);

    expect(angle).toBeGreaterThan(-150);
  });
});

describe('moonIllumination', () => {
  it('is near full at a full moon and near zero at a new one', () => {
    // Full moon 2024-04-23 23:49 UTC, new moon 2024-04-08 18:21 UTC.
    expect(moonIllumination(Date.UTC(2024, 3, 23, 23, 49))).toBeGreaterThan(
      0.99,
    );

    expect(moonIllumination(Date.UTC(2024, 3, 8, 18, 21))).toBeLessThan(0.01);
  });
});
