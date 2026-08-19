/**
 * Square metres per unit. Shared by the area readout — where the user cycles
 * through them by clicking — and by the `{area_*}` label placeholders, so a
 * polygon's label and the readout above it can never disagree.
 */
export const areaUnits = {
  'm²': 1,
  'km²': 1e6,
  a: 100, // are
  ha: 10000, // hectare
  'mi²': 2_589_988.11,
  'yd²': 0.836127,
  'ft²': 0.092903,
  ac: 4046.86, // acre
} as const;

export type AreaUnit = keyof typeof areaUnits;

/**
 * Digits enough to say something without saying more than the measurement can:
 * a bigger number gets fewer of them. The same rule `formatDistance` uses.
 */
export function measurementFractionDigits(value: number): number {
  return Math.max(
    0,
    Math.min(20, Math.floor(4 - (value ? Math.log10(value) : 0))),
  );
}

/**
 * `Intl` has no unit for a square metre or an are, so the number is formatted
 * for the locale and the symbol appended — which is what every one of these
 * units is written as anyway.
 */
export function formatArea(
  squareMeters: number,
  unit: AreaUnit,
  locale: string,
): string {
  const value = squareMeters / areaUnits[unit];

  const digits = measurementFractionDigits(value);

  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}\u00a0${unit}`;
}

/**
 * The unit a bare `{area}` picks: square metres up to a hectare, hectares up to
 * a square kilometre, square kilometres above that — the steps a map reader
 * expects rather than a single unit stretched across all of them.
 */
export function naturalAreaUnit(squareMeters: number): AreaUnit {
  return squareMeters < areaUnits.ha
    ? 'm²'
    : squareMeters < areaUnits['km²']
      ? 'ha'
      : 'km²';
}
