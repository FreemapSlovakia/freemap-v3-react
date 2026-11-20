/**
 * A duration as hours and minutes in the locale's own wording — `45 min`,
 * `1 hr, 30 min`, `5 h in 54 min` — rounded to whole minutes. `narrow` is the
 * tighter form (`5h 54m`) for places that are short of room.
 *
 * `Intl.DurationFormat` knows the separators each locale uses between the two
 * ("i" in Polish, "és" in Hungarian, "in" in Slovenian) and omits a zero hour
 * by itself. It is recent enough — Chrome 129, Safari 18.4 — to still need the
 * `Intl.NumberFormat` path below, which is everywhere.
 */
export function formatDuration(
  valueInSeconds: number,
  locale: string,
  style: 'short' | 'narrow' = 'short',
  /** Whole days apart from the hours, for a trip of several. */
  withDays = false,
): string {
  const totalMinutes = Math.round(valueInSeconds / 60);

  const totalHours = Math.floor(totalMinutes / 60);

  const days = withDays ? Math.floor(totalHours / 24) : 0;

  const hours = totalHours - days * 24;

  const minutes = totalMinutes % 60;

  if (typeof Intl.DurationFormat === 'function') {
    return new Intl.DurationFormat(locale, {
      style,
      // Every zero-valued field is dropped by default, so a zero duration would
      // format as an empty string rather than as "0 min".
      ...(totalMinutes === 0 ? { minutesDisplay: 'always' as const } : {}),
    }).format({
      days,
      hours,
      minutes,
    });
  }

  const format = (value: number, unit: 'day' | 'hour' | 'minute') =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: style,
    }).format(value);

  const parts = [
    days > 0 && format(days, 'day'),
    hours > 0 && format(hours, 'hour'),
    (minutes > 0 || totalMinutes === 0) && format(minutes, 'minute'),
  ].filter(Boolean);

  return parts.join(' ');
}
