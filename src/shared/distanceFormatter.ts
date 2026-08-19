import { measurementFractionDigits } from './areaFormatter.js';

/**
 * Kilometres per unit. Shared by the length readout — where the user cycles
 * through them by clicking — and by the `{length_*}` label placeholders.
 */
export const lengthUnits = {
  km: 1,
  m: 0.001,
  mi: 1.609344,
  yd: 0.0009144,
  ft: 0.0003048,
  nmi: 1.852, // nautical mile
} as const;

export type LengthUnit = keyof typeof lengthUnits;

/**
 * A length in metres, written in the unit asked for. The value and its unit are
 * held together by a non-breaking space — written as an escape, since an
 * invisible one in the source is the kind of thing that gets "fixed" by
 * retyping it.
 */
export function formatLength(
  meters: number,
  unit: LengthUnit,
  locale: string,
): string {
  const value = meters / 1000 / lengthUnits[unit];

  const digits = measurementFractionDigits(value);

  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}\u00a0${unit}`;
}

export function formatDistance(valueInMeters: number, locale: string): string {
  const useKilometers = valueInMeters >= 1000;

  const value = useKilometers ? valueInMeters / 1000 : valueInMeters;

  const fractionDigits = Math.max(
    0,
    Math.min(20, Math.floor(4 - (value ? Math.log10(value) : 0))),
  );

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: useKilometers ? 'kilometer' : 'meter',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(value);
}
