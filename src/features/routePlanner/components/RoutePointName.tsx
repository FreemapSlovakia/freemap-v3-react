import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';

/**
 * A route point by the place it stands at, as the itinerary names it, after
 * its `number`; `fallback` until the name is known, or where none is.
 */
export function RoutePointName({
  point,
  number,
  fallback,
}: {
  point: LatLon | undefined;
  number?: number;
  fallback: string;
}): ReactElement {
  const name = usePlaceName(point, true);

  return (
    <>
      {name === null
        ? fallback
        : number === undefined
          ? name
          : `${number} · ${name}`}
    </>
  );
}
