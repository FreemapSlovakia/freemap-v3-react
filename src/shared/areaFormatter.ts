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
 * What each unit is called in an `{area_*}` label placeholder — the symbols
 * carry superscripts and the placeholders have to be typeable. Derived from the
 * table above so a unit the readout offers can always be named in a label too.
 */
export const areaUnitKeys: Record<AreaUnit, string> = {
  'm²': 'area_m2',
  'km²': 'area_km2',
  a: 'area_a',
  ha: 'area_ha',
  'mi²': 'area_mi2',
  'yd²': 'area_yd2',
  'ft²': 'area_ft2',
  ac: 'area_ac',
};

/**
 * Digits enough to say something without saying more than the measurement can:
 * three significant digits, so a bigger number gets fewer of them. The same rule
 * `formatDistance` uses. Counted from the rounded value — 9.999 rounds to 10.00,
 * which would carry a digit more than asked for.
 */
export function measurementFractionDigits(value: number): number {
  const digits = (v: number) =>
    v ? Math.max(0, Math.min(20, 2 - Math.floor(Math.log10(Math.abs(v))))) : 2;

  return digits(Number(value.toFixed(digits(value))));
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
  // Compared as the unit would print it, so 9999.6 m² — which rounds to 10 000 —
  // is a hectare rather than a square metre count of one.
  const rounded = (unit: AreaUnit) => {
    const value = squareMeters / areaUnits[unit];

    return (
      Number(value.toFixed(measurementFractionDigits(value))) * areaUnits[unit]
    );
  };

  return rounded('m²') < areaUnits.ha
    ? 'm²'
    : rounded('ha') < areaUnits['km²']
      ? 'ha'
      : 'km²';
}
