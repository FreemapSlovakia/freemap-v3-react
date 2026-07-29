/**
 * A duration as hours and minutes in the locale's short unit form, e.g.
 * `45 min`, `1 hr`, `1 hr 30 min`. Rounded to whole minutes.
 */
export function formatDuration(valueInSeconds: number, locale: string): string {
  const totalMinutes = Math.round(valueInSeconds / 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  const format = (value: number, unit: 'hour' | 'minute') =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
    }).format(value);

  if (hours === 0) {
    return format(minutes, 'minute');
  }

  return minutes === 0
    ? format(hours, 'hour')
    : `${format(hours, 'hour')} ${format(minutes, 'minute')}`;
}
