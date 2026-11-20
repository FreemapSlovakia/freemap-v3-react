import type { Weather } from './forecast.js';

/** The icon's MET symbol code; our `Weather` is built from the same vocabulary. */
export function metSymbolCode({
  sky,
  precipitation: p,
  thunder,
  day,
}: Weather): string {
  const variant = day ? '_day' : '_night';

  if (!p) {
    switch (sky) {
      case 'clear':
        return `clearsky${variant}`;

      case 'fair':
        return `fair${variant}`;

      case 'partlyCloudy':
        return `partlycloudy${variant}`;

      default:
        return sky;
    }
  }

  const intensity = p.intensity === 'moderate' ? '' : p.intensity;

  // MET's own spelling of light sleet and snow showers with thunder.
  const s =
    intensity === 'light' && p.showers && thunder && p.type !== 'rain'
      ? 's'
      : '';

  return (
    intensity +
    s +
    p.type +
    (p.showers ? 'showers' : '') +
    (thunder ? 'andthunder' : '') +
    (p.showers ? variant : '')
  );
}
