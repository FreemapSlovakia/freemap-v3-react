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

/** Every unit the length readout offers is nameable in a label as well. */
export const lengthUnitKeys = Object.keys(lengthUnits) as LengthUnit[];

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
  const meterDigits = measurementFractionDigits(valueInMeters);

  // The unit follows the rounded metre value: 999.9 m rounds to 1000, which is
  // a kilometre and must not be written as metres.
  const useKilometers = Number(valueInMeters.toFixed(meterDigits)) >= 1000;

  const value = useKilometers ? valueInMeters / 1000 : valueInMeters;

  const fractionDigits = useKilometers
    ? measurementFractionDigits(value)
    : meterDigits;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: useKilometers ? 'kilometer' : 'meter',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(value);
}
