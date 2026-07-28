import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { Polyline } from 'react-leaflet';

/**
 * Stage-1 live track: a plain polyline that grows as fixes arrive. Stage 2
 * styles it like the other displayed GPX tracks.
 */
export default function GpsRecorderResult(): ReactElement | null {
  const points = useAppSelector((state) => state.gpsRecorder.points);

  const positions = useMemo(
    () => points.map((point): [number, number] => [point.lat, point.lon]),
    [points],
  );

  return positions.length < 2 ? null : (
    <Polyline
      positions={positions}
      color="#f00"
      weight={4}
      interactive={false}
    />
  );
}
