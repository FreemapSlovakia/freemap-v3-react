import { setTool } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useMemo } from 'react';
import { CircleMarker, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  selectLatestRecorderPoint,
  selectRecorderSegments,
} from '../model/selectors.js';

/**
 * The live track: one polyline per segment, so a pause or a restart shows as a
 * break rather than a straight line across it, with the newest fix marked as its
 * head. The track outlives the tool being closed — the points stay in the store —
 * so clicking it opens the tool again, as clicking a loaded track opens the
 * import tool.
 *
 * The head marks where the recording has reached, which is not the same claim as
 * where the user is: the position marker is the app's own, fed from these fixes
 * by `useRecorderLocationFeed` and shown only when the user asked to be located.
 */
export default function GpsRecorderResult(): ReactElement | null {
  const dispatch = useDispatch();

  const segments = useAppSelector(selectRecorderSegments);

  const latest = useAppSelector(selectLatestRecorderPoint);

  const positions = useMemo(
    () =>
      segments
        .filter((segment) => segment.length >= 2)
        .map((segment) =>
          segment.map((point): [number, number] => [point.lat, point.lon]),
        ),
    [segments],
  );

  const openTool = useCallback(() => {
    dispatch(setTool({ tool: 'gps-recorder', mode: 'open' }));
  }, [dispatch]);

  const handlers = useMemo(() => ({ click: openTool }), [openTool]);

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
          eventHandlers={handlers}
        />
      ))}

      {latest && (
        <CircleMarker
          center={[latest.lat, latest.lon]}
          radius={5}
          weight={2}
          color="#f00"
          fillColor="#fff"
          fillOpacity={1}
          eventHandlers={handlers}
        />
      )}
    </>
  );
}
