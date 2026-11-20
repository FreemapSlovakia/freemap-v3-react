import type { ReactElement } from 'react';
import type { Weather } from '../model/forecast.js';
import { metSymbolCode } from '../model/metSymbol.js';

// MET Norway's symbols (github.com/metno/weathericons, MIT), as hashed assets of
// this chunk.
const icons = import.meta.webpackContext('../icons', {
  recursive: false,
  regExp: /\.svg$/,
});

function iconUrl(code: string): string | undefined {
  const key = `./${code}.svg`;

  if (!icons.keys().includes(key)) {
    return undefined;
  }

  const mod = icons(key) as string | { default: string };

  return typeof mod === 'string' ? mod : mod.default;
}

export function WeatherIcon({
  weather,
  size,
}: {
  weather: Weather;
  size: number;
}): ReactElement | null {
  const url = iconUrl(metSymbolCode(weather));

  return url ? (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      className="flex-shrink-0"
    />
  ) : null;
}
