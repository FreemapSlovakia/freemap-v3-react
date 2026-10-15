/**
 * Where the sun and the moon stand in the sky. Meeus' low-precision series:
 * hundredths of a degree for the sun, a few for the moon — under a pixel of
 * the finest panorama, and seconds of time at the horizon.
 */

const RAD = Math.PI / 180;

const sin = (deg: number) => Math.sin(deg * RAD);

const cos = (deg: number) => Math.cos(deg * RAD);

export type SkyBody = 'sun' | 'moon';

/** Apparent topocentric position: bearing from north, altitude above level. */
export type SkyPosition = {
  azimuth: number;
  altitude: number;
  /** Angular radius, degrees. */
  radius: number;
};

type Equatorial = {
  /** Right ascension and declination, degrees. */
  ra: number;
  dec: number;
  /** Equatorial horizontal parallax, degrees; what a near body shifts by. */
  parallax: number;
  radius: number;
};

/** Julian centuries since J2000. UT stands in for TT: ΔT moves the moon 0.01°. */
function centuries(time: number): number {
  return (time / 86_400_000 + 2_440_587.5 - 2_451_545) / 36_525;
}

function obliquity(t: number): number {
  return 23.439291 - 0.0130042 * t + 0.00256 * cos(125.04 - 1934.136 * t);
}

function eclipticToEquatorial(
  lambda: number,
  beta: number,
  t: number,
): { ra: number; dec: number } {
  const e = obliquity(t);

  return {
    ra:
      Math.atan2(
        sin(lambda) * cos(e) - Math.tan(beta * RAD) * sin(e),
        cos(lambda),
      ) / RAD,
    dec: Math.asin(sin(beta) * cos(e) + cos(beta) * sin(e) * sin(lambda)) / RAD,
  };
}

/** Apparent ecliptic longitude of the sun, degrees (Meeus ch. 25). */
function sunLongitude(t: number): number {
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;

  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;

  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(m) +
    (0.019993 - 0.000101 * t) * sin(2 * m) +
    0.000289 * sin(3 * m);

  return l0 + c - 0.00569 - 0.00478 * sin(125.04 - 1934.136 * t);
}

function sunEquatorial(t: number): Equatorial {
  return {
    ...eclipticToEquatorial(sunLongitude(t), 0, t),
    parallax: 0.00244,
    radius: 0.2666,
  };
}

// Meeus table 47.A/B, truncated past 4000 µ°: [D, M, M', F, Σl, Σr].
const MOON_LR: [number, number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
];

const MOON_B: [number, number, number, number, number][] = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
];

/** Geocentric ecliptic longitude, latitude and distance (km) of the moon. */
export function moonEcliptic(time: number): {
  lambda: number;
  beta: number;
  distance: number;
} {
  const t = centuries(time);

  const lp = 218.3164477 + 481267.88123421 * t;

  const d = 297.8501921 + 445267.1114034 * t;

  const m = 357.5291092 + 35999.0502909 * t;

  const mp = 134.9633964 + 477198.8675055 * t;

  const f = 93.272095 + 483202.0175233 * t;

  // The sun's anomaly weakens as the Earth's orbit circularises.
  const e = 1 - 0.002516 * t;

  let sl = 0;

  let sr = 0;

  for (const [cd, cm, cmp, cf, l, r] of MOON_LR) {
    const arg = cd * d + cm * m + cmp * mp + cf * f;

    const ef = e ** Math.abs(cm);

    sl += l * ef * sin(arg);

    sr += r * ef * cos(arg);
  }

  let sb = 0;

  for (const [cd, cm, cmp, cf, b] of MOON_B) {
    sb += b * e ** Math.abs(cm) * sin(cd * d + cm * m + cmp * mp + cf * f);
  }

  const a1 = 119.75 + 131.849 * t;

  sl += 3958 * sin(a1) + 1962 * sin(lp - f);

  sb += -2235 * sin(lp) + 382 * sin(313.45 + 481266.484 * t);

  return {
    lambda: lp + sl / 1e6,
    beta: sb / 1e6,
    distance: 385000.56 + sr / 1000,
  };
}

function moonEquatorial(t: number, time: number): Equatorial {
  const { lambda, beta, distance } = moonEcliptic(time);

  return {
    ...eclipticToEquatorial(lambda, beta, t),
    parallax: Math.asin(6378.14 / distance) / RAD,
    radius: Math.asin(1737.4 / distance) / RAD,
  };
}

/**
 * Degrees the atmosphere lifts a body at true altitude `h` (Sæmundsson). Held
 * at its −1° value below that, where the formula turns over; a summit's horizon
 * can sit that low.
 */
export function refraction(h: number): number {
  const at = Math.max(h, -1);

  return 1.02 / Math.tan((at + 10.3 / (at + 5.11)) * RAD) / 60;
}

/** Where a body stands in the sky at `time` (epoch ms), seen from `lat`/`lon`. */
export function skyPosition(
  body: SkyBody,
  time: number,
  lat: number,
  lon: number,
): SkyPosition {
  const t = centuries(time);

  const eq = body === 'sun' ? sunEquatorial(t) : moonEquatorial(t, time);

  const days = t * 36_525;

  const gmst = 280.46061837 + 360.98564736629 * days + 0.000387933 * t * t;

  const h = gmst + lon - eq.ra;

  const geocentric =
    Math.asin(sin(lat) * sin(eq.dec) + cos(lat) * cos(eq.dec) * cos(h)) / RAD;

  // Seen from the surface rather than the Earth's centre — a degree for the
  // moon at the horizon, nothing worth the name for the sun.
  const topocentric =
    geocentric - Math.asin(sin(eq.parallax) * cos(geocentric)) / RAD;

  const azimuth =
    Math.atan2(
      -cos(eq.dec) * sin(h),
      sin(eq.dec) * cos(lat) - cos(eq.dec) * cos(h) * sin(lat),
    ) / RAD;

  return {
    azimuth: (azimuth + 360) % 360,
    altitude: topocentric + refraction(topocentric),
    radius: eq.radius,
  };
}

/**
 * The moon's age as its ecliptic longitude past the sun's: 0 new, 90 first
 * quarter, 180 full, 270 last quarter. Waxing below 180.
 */
export function moonAge(time: number): number {
  const age = moonEcliptic(time).lambda - sunLongitude(centuries(time));

  return ((age % 360) + 360) % 360;
}

/**
 * Which way the moon's lit side faces, in degrees clockwise from straight up
 * towards rising azimuth: the direction of the sun from the moon across the sky.
 */
export function brightLimbAngle(
  time: number,
  lat: number,
  lon: number,
): number {
  const moon = skyPosition('moon', time, lat, lon);

  const sun = skyPosition('sun', time, lat, lon);

  const dA = sun.azimuth - moon.azimuth;

  return (
    Math.atan2(
      sin(dA) * cos(sun.altitude),
      cos(moon.altitude) * sin(sun.altitude) -
        sin(moon.altitude) * cos(sun.altitude) * cos(dA),
    ) / RAD
  );
}

/** Lit fraction of the moon's disc, 0 (new) to 1 (full). */
export function moonIllumination(time: number): number {
  const t = centuries(time);

  const { lambda, beta } = moonEcliptic(time);

  // Elongation from the sun; the phase angle is its supplement, near enough.
  const elongation = Math.acos(cos(beta) * cos(lambda - sunLongitude(t)));

  return (1 - Math.cos(elongation)) / 2;
}
