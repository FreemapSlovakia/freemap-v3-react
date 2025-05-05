export function formatDistance(valueInMeters: number, locale: string): string {
  const useKilometers = valueInMeters >= 1000;

  const unit = useKilometers ? 'kilometer' : 'meter';

  const value = useKilometers ? valueInMeters / 1000 : valueInMeters;

  const fractionDigits =
    value && value < 1 ? 3 : value < 10 ? 2 : value < 100 ? 1 : 0;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(value);
}
