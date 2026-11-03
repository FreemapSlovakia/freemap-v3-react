import { openTool } from '@app/store/actions.js';
import { drawingStyleToPathOptions } from '@features/drawing/drawingStyleToPathOptions.js';
import { FEATURES_PANE_CLASS } from '@features/map/hooks/featuresPane.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useMemo } from 'react';
import { CircleMarker, Pane, Polyline } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { useRecorderLocationFeed } from '../hooks/useRecorderLocationFeed.js';
import { useRecorderWakeLock } from '../hooks/useRecorderWakeLock.js';
import {
  selectLatestRecorderPoint,
  selectRecorderLines,
} from '../model/selectors.js';

// Above every other path pane (400–450), below `markerPane` (600).
const paneName = 'fm-gps-recorder';

/**
 * The recording's presence on this page: the live track, and the two things that
 * follow from a recording being in progress at all — the position feed and the
 * screen wake lock.
 *
 * Mounted by `Results` whenever there are fixes, so none of it depends on the
 * recorder's toolbar being open — a recording carries on whichever toolbar the
 * user has up.
 *
 * One polyline per segment, so a pause or a restart shows as a break rather than a
 * straight line across it, with the newest fix marked as its head. Clicking either
 * opens the tool again, as clicking a loaded track opens the import tool.
 *
 * The head marks where the recording has reached, which is not the same claim as
 * where the user is: the position marker is the app's own, fed from these fixes by
 * `useRecorderLocationFeed` and shown only when the user asked to be located.
 */
export default function GpsRecorderResult(): ReactElement | null {
  const dispatch = useDispatch();

  useRecorderLocationFeed();

  useRecorderWakeLock();

  const lines = useAppSelector(selectRecorderLines);

  const latest = useAppSelector(selectLatestRecorderPoint);

  const positions = useMemo(
    () =>
      lines.map((line) =>
        line.map((point): [number, number] => [point.lat, point.lon]),
      ),
    [lines],
  );

  const handleClick = useCallback(() => {
    dispatch(openTool('gps-recorder'));
  }, [dispatch]);

  const handlers = useMemo(() => ({ click: handleClick }), [handleClick]);

  const style = useAppSelector((state) => state.gpsRecorderSettings.style);

  const pathOptions = useMemo(() => drawingStyleToPathOptions(style), [style]);

  // As `pathOptions`, not as props: react-leaflet re-applies only `center` and
  // `radius` on a circle, so style given any other way would never restyle.
  const headOptions = useMemo(() => {
    const { color, opacity } = splitColorAlpha(style.color);

    return {
      color,
      opacity,
      weight: 2,
      fillColor: '#fff',
      fillOpacity: 1,
    };
  }, [style.color]);

  if (positions.length === 0 && !latest) {
    return null;
  }

  return (
    <Pane
      name={paneName}
      className={FEATURES_PANE_CLASS}
      style={{ zIndex: 500 }}
    >
      {positions.map((segment, i) => (
        <Polyline
          key={i}
          positions={segment}
          pathOptions={pathOptions}
          eventHandlers={handlers}
        />
      ))}

      {latest && (
        <CircleMarker
          center={[latest.lat, latest.lon]}
          radius={5}
          pathOptions={headOptions}
          eventHandlers={handlers}
        />
      )}
    </Pane>
  );
}
