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
