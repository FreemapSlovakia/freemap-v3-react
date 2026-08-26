/**
 * The national projections some geoportals take instead of WGS84. Only the
 * forward direction, and only to the metre or two a map view needs.
 */

const D = Math.PI / 180;

/**
 * Snyder's Transverse Mercator series, exact to millimetres within a few
 * degrees of the central meridian. The GRS80 and WGS84 ellipsoids differ by
 * less than a millimetre here, so both datums use the one below.
 */
function transverseMercator(
  lat: number,
  lon: number,
  lon0: number,
  k0: number,
  fe: number,
  fn: number,
): [number, number] {
  const a = 6378137;

  const f = 1 / 298.257223563;

  const e2 = 2 * f - f * f;

  const ep2 = e2 / (1 - e2);

  const phi = lat * D;

  const A = (lon - lon0) * D * Math.cos(phi);

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);

  const T = Math.tan(phi) ** 2;

  const C = ep2 * Math.cos(phi) ** 2;

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) *
        Math.sin(2 * phi) +
      ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 ** 3) / 3072) * Math.sin(6 * phi));

  return [
    fe +
      k0 *
        N *
        (A +
          ((1 - T + C) * A ** 3) / 6 +
          ((5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5) / 120),
    fn +
      k0 *
        (M +
          N *
            Math.tan(phi) *
            (A ** 2 / 2 +
              ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
              ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720)),
  ];
}

/** WGS84 to Slovenia's D96/TM (EPSG:3794) — ETRS89, so nothing has to be shifted. */
export function toD96tm(lat: number, lon: number): [number, number] {
  return transverseMercator(lat, lon, 15, 0.9999, 500000, -5000000);
}

/**
 * WGS84 to UTM zone 33N (EPSG:32633), which the Italian viewer takes. Norway's
 * ETRS89 flavour of it (EPSG:25833) agrees to within a centimetre.
 */
export function toUtm33n(lat: number, lon: number): [number, number] {
  return transverseMercator(lat, lon, 15, 0.9996, 500000, 0);
}

/** WGS84 to SWEREF 99 TM (EPSG:3006) — the national grid, not a local zone. */
export function toSweref99tm(lat: number, lon: number): [number, number] {
  return transverseMercator(lat, lon, 15, 0.9996, 500000, 0);
}

/** WGS84 to ETRS-TM35FIN (EPSG:3067). */
export function toTm35fin(lat: number, lon: number): [number, number] {
  return transverseMercator(lat, lon, 27, 0.9996, 500000, 0);
}

/** WGS84 to HTRS96 / Croatia TM (EPSG:3765). */
export function toHtrs96tm(lat: number, lon: number): [number, number] {
  return transverseMercator(lat, lon, 16.5, 0.9999, 500000, 0);
}

/**
 * WGS84 to Belgian Lambert 2008 (EPSG:3812). Snyder's conformal conic with two
 * standard parallels; ETRS89, so nothing has to be shifted.
 */
export function toLambert2008(lat: number, lon: number): [number, number] {
  const a = 6378137;

  const f = 1 / 298.257222101;

  const e = Math.sqrt(2 * f - f * f);

  const m = (phi: number) =>
    Math.cos(phi) / Math.sqrt(1 - (e * Math.sin(phi)) ** 2);

  const t = (phi: number) =>
    Math.tan(Math.PI / 4 - phi / 2) /
    ((1 - e * Math.sin(phi)) / (1 + e * Math.sin(phi))) ** (e / 2);

  const p1 = 49.8333333333 * D;

  const p2 = 51.1666666667 * D;

  const p0 = 50.797815 * D;

  const n =
    (Math.log(m(p1)) - Math.log(m(p2))) / (Math.log(t(p1)) - Math.log(t(p2)));

  const F = m(p1) / (n * t(p1) ** n);

  const rho = a * F * t(lat * D) ** n;

  const theta = n * (lon - 4.359215) * D;

  return [
    649328 + rho * Math.sin(theta),
    665262 + a * F * t(p0) ** n - rho * Math.cos(theta),
  ];
}

/** Kadaster's polynomial for RD New: `[p, q, coefficient]` for easting, then northing. */
const RD_E = [
  [0, 1, 190094.945],
  [1, 1, -11832.228],
  [2, 1, -114.221],
  [0, 3, -32.391],
  [1, 0, -0.705],
  [3, 1, -2.34],
  [1, 3, -0.608],
  [0, 2, -0.008],
  [2, 3, 0.148],
];

const RD_N = [
  [1, 0, 309056.544],
  [0, 2, 3638.893],
  [2, 0, 73.077],
  [1, 2, -157.984],
  [3, 0, 59.788],
  [0, 1, 0.433],
  [2, 2, -6.439],
  [1, 1, -0.032],
  [0, 4, 0.092],
  [1, 4, -0.054],
];

/**
 * WGS84 to Amersfoort / RD New (EPSG:28992). Kadaster's own polynomial rather
 * than the oblique stereographic it approximates — a quarter of a metre over
 * the Netherlands, and no Bessel datum shift to get wrong.
 */
export function toRdNew(lat: number, lon: number): [number, number] {
  const dPhi = (lat - 52.1551744) * 0.36;

  const dLam = (lon - 5.38720621) * 0.36;

  const sum = (terms: number[][]) =>
    terms.reduce((acc, [p, q, c]) => acc + c * dPhi ** p * dLam ** q, 0);

  return [155000 + sum(RD_E), 463000 + sum(RD_N)];
}

/** WGS84 geodetic to S-JTSK geodetic on Bessel 1841 — EPSG:5239 run backwards. */
function toBessel(lat: number, lon: number): [number, number] {
  const a = 6378137;

  const f = 1 / 298.257223563;

  const e2 = 2 * f - f * f;

  const phi = lat * D;

  const lam = lon * D;

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);

  const X = N * Math.cos(phi) * Math.cos(lam);

  const Y = N * Math.cos(phi) * Math.sin(lam);

  const Z = N * (1 - e2) * Math.sin(phi);

  // S-JTSK to ETRS89 is +572.213/+85.334/+461.940 m, −4.9732″/−1.5292″/−5.2484″,
  // +3.5378 ppm; the way back negates all of it.
  const rx = (4.9732 / 3600) * D;

  const ry = (1.5292 / 3600) * D;

  const rz = (5.2484 / 3600) * D;

  const s = 1 - 3.5378e-6;

  const Xb = -572.213 + s * (X + rz * Y - ry * Z);

  const Yb = -85.334 + s * (-rz * X + Y + rx * Z);

  const Zb = -461.94 + s * (ry * X - rx * Y + Z);

  const ab = 6377397.155;

  const fb = 1 / 299.1528128;

  const eb2 = 2 * fb - fb * fb;

  const p = Math.hypot(Xb, Yb);

  let phib = Math.atan2(Zb, p * (1 - eb2));

  for (let i = 0; i < 8; i++) {
    const Nb = ab / Math.sqrt(1 - eb2 * Math.sin(phib) ** 2);

    const h = p / Math.cos(phib) - Nb;

    phib = Math.atan2(Zb, p * (1 - (eb2 * Nb) / (Nb + h)));
  }

  return [phib, Math.atan2(Yb, Xb)];
}

/**
 * WGS84 to S-JTSK / Krovak East North (EPSG:5514), the oblique conformal conic
 * of EPSG method 9819. Two traps: the longitude of origin is 42°30′ east of
 * Ferro, which is 24°50′ E of Greenwich, and this CRS negates both Krovak axes.
 */
export function toKrovak(lat: number, lon: number): [number, number] {
  const [phi, lam] = toBessel(lat, lon);

  const a = 6377397.155;

  const e = Math.sqrt(2 / 299.1528128 - (1 / 299.1528128) ** 2);

  const phic = 49.5 * D;

  const lam0 = (24 + 50 / 60) * D;

  const alphac = 30.28813972222 * D;

  const phip = 78.5 * D;

  const A = (a * Math.sqrt(1 - e * e)) / (1 - e * e * Math.sin(phic) ** 2);

  const B = Math.sqrt(1 + (e * e * Math.cos(phic) ** 4) / (1 - e * e));

  const g0 = Math.asin(Math.sin(phic) / B);

  const t0 =
    (Math.tan(Math.PI / 4 + g0 / 2) *
      ((1 + e * Math.sin(phic)) / (1 - e * Math.sin(phic))) ** ((e * B) / 2)) /
    Math.tan(Math.PI / 4 + phic / 2) ** B;

  const n = Math.sin(phip);

  const r0 = (0.9999 * A) / Math.tan(phip);

  const U =
    2 *
    (Math.atan(
      (t0 * Math.tan(phi / 2 + Math.PI / 4) ** B) /
        ((1 + e * Math.sin(phi)) / (1 - e * Math.sin(phi))) ** ((e * B) / 2),
    ) -
      Math.PI / 4);

  const V = B * (lam0 - lam);

  const T = Math.asin(
    Math.cos(alphac) * Math.sin(U) +
      Math.sin(alphac) * Math.cos(U) * Math.cos(V),
  );

  const theta = n * Math.asin((Math.cos(U) * Math.sin(V)) / Math.cos(T));

  const r =
    (r0 * Math.tan(Math.PI / 4 + phip / 2) ** n) /
    Math.tan(T / 2 + Math.PI / 4) ** n;

  return [-r * Math.sin(theta), -r * Math.cos(theta)];
}
