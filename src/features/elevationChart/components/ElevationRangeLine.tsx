import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLngTuple } from 'leaflet';
import { type ReactElement, useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import { elevatedRuns, profileSlice } from '../profilePoint.js';

// The band, in the chart's own accent.
const RANGE_STYLE = {
  // Named rather than spelled out, so it stays the one ink the chart draws its
  // own marks in. Leaflet writes it onto an SVG path in the document, where the
  // custom property resolves.
  color: 'var(--bs-danger)',
  opacity: 1,
  // Butt ends, so the band stops exactly where the marked stretch does.
  lineCap: 'butt',
  lineJoin: 'round',
} as const;

/**
 * The stretch the chart has marked out, so the figures in the panel have a
 * place on the map. Drawn at the width of the halo the line wears, and placed
 * by whoever renders it — over that halo, under the line itself, which keeps a
 * colorized line's own colours.
 */
export function ElevationRangeLine({
  weight,
}: {
  weight: number;
}): ReactElement | null {
  const range = useAppSelector((state) => state.elevationChart.range);

  const points = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints,
  );

  // In `pathOptions`, and a fresh object only on a width change: react-leaflet
  // restyles the layer when this reference changes, while a top-level `weight`
  // prop would apply only when the layer is first created.
  const pathOptions = useMemo(() => ({ ...RANGE_STYLE, weight }), [weight]);

  const positions = useMemo(() => {
    if (!range || !points?.length) {
      return null;
    }

    // Broken at the profile's own gaps, which the track never travelled: drawn
    // through, the band would cross ground nobody was on.
    const drawn = elevatedRuns(profileSlice(points, range.from, range.to))
      .filter((run) => run.length > 1)
      .map((run) => run.map(({ lat, lon }) => [lat, lon] as LatLngTuple));

    return drawn.length ? drawn : null;
  }, [range, points]);

  return (
    positions && (
      <Polyline
        positions={positions}
        pathOptions={pathOptions}
        interactive={false}
      />
    )
  );
}
