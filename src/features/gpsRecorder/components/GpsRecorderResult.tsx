import { mapRefocus } from '@features/map/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect, useMemo } from 'react';
import { Circle, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  selectLatestRecorderPoint,
  selectRecorderSegments,
} from '../model/selectors.js';

/**
 * The live track: one polyline per segment, so a pause or a restart shows as a
 * break rather than a straight line across it.
 */
export default function GpsRecorderResult(): ReactElement | null {
  const dispatch = useDispatch();

  const segments = useAppSelector(selectRecorderSegments);

  const latest = useAppSelector(selectLatestRecorderPoint);

  const showAccuracyCircle = useAppSelector(
    (state) => state.gpsRecorderSettings.showAccuracyCircle,
  );

  const followPosition = useAppSelector(
    (state) => state.gpsRecorderSettings.followPosition,
  );

  const recording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  const positions = useMemo(
    () =>
      segments
        .filter((segment) => segment.length >= 2)
        .map((segment) =>
          segment.map((point): [number, number] => [point.lat, point.lon]),
        ),
    [segments],
  );

  // Follows the recorder's own fixes rather than asking the browser for a
  // second, competing GPS feed. `gpsTracked` is the map's existing flag, so
  // grabbing the map ends the following exactly as it does for the locate
  // button — and only a live recording moves the map at all.
  useEffect(() => {
    if (followPosition && recording && latest) {
      dispatch(
        mapRefocus({ lat: latest.lat, lon: latest.lon, gpsTracked: true }),
      );
    }
  }, [dispatch, followPosition, recording, latest]);

  if (positions.length === 0 && !latest) {
    return null;
  }

  return (
    <>
      {positions.map((segment, i) => (
        <Polyline
          key={i}
          positions={segment}
          color="#f00"
          weight={4}
          interactive={false}
        />
      ))}

      {showAccuracyCircle && latest?.acc != null && (
        <Circle
          center={[latest.lat, latest.lon]}
          radius={latest.acc}
          color="#f00"
          weight={1}
          fillOpacity={0.1}
          interactive={false}
        />
      )}
    </>
  );
}
