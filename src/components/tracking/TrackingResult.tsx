import { selectFeature } from 'fm3/actions/mainActions';
import { RichMarker } from 'fm3/components/RichMarker';
import {
  tooltipText,
  TrackingPoint,
} from 'fm3/components/tracking/TrackingPoint';
import { distance, toLatLng, toLatLngArr } from 'fm3/geoutils';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { RootState } from 'fm3/storeCreator';
import { TrackPoint } from 'fm3/types/trackingTypes';
import { Fragment, ReactElement, useMemo, useRef, useState } from 'react';
import { FaRegUser, FaUser } from 'react-icons/fa';
import { Circle, Polyline, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

// TODO functional component with hooks was causing massive re-rendering
export function TrackingResult(): ReactElement {
  const clickHandlerMemo = useRef<Record<string, () => void>>({});

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const showLine = useSelector((state: RootState) => state.tracking.showLine);

  const showPoints = useSelector(
    (state: RootState) => state.tracking.showPoints,
  );

  const trackedDevices = useSelector(
    (state: RootState) => state.tracking.trackedDevices,
  );

  const tracks = useSelector((state: RootState) => state.tracking.tracks);

  const tracks1 = useMemo(() => {
    const tdMap = new Map(trackedDevices.map((td) => [td.id, td]));

    return tracks.map((track) => ({
      ...track,
      ...(tdMap.get(track.id) || {}),
    }));
  }, [trackedDevices, tracks]);

  const activeTrackId = useSelector((state: RootState) =>
    state.main.selection?.type === 'tracking'
      ? state.main.selection?.id
      : undefined,
  );

  const [activePoint, setActivePoint] = useState<TrackPoint | null>(null);

  const df = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [language],
  );

  const nf = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const interactive = useSelector(selectingModeSelector);

  return (
    <>
      {tracks1.map((track) => {
        const color = track.color || '#7239a8';
        const width = track.width || 4;

        let handleClick = clickHandlerMemo.current[track.id];

        if (!handleClick) {
          handleClick = () => {
            dispatch(selectFeature({ type: 'tracking', id: track.id }));
          };

          clickHandlerMemo.current[track.id] = handleClick;
        }

        const segments: TrackPoint[][] = [];

        let curSegment: TrackPoint[] | null = null;

        let prevTp: TrackPoint | undefined;

        for (const tp of track.trackPoints) {
          if (
            prevTp &&
            ((typeof track.splitDistance === 'number' &&
              distance(tp.lat, tp.lon, prevTp.lat, prevTp.lon) >
                track.splitDistance) ||
              (typeof track.splitDuration === 'number' &&
                tp.ts.getTime() - prevTp.ts.getTime() >
                  track.splitDuration * 60000))
          ) {
            curSegment = null;
          }

          if (!curSegment) {
            curSegment = [];
            segments.push(curSegment);
          }

          curSegment.push(tp);
          prevTp = tp;
        }

        const lastPoint =
          track.trackPoints.length > 0
            ? track.trackPoints[track.trackPoints.length - 1]
            : null;

        return (
          <Fragment key={`trk-${track.id}`}>
            {lastPoint && typeof lastPoint.accuracy === 'number' && (
              <Circle
                weight={2}
                interactive={false}
                center={toLatLng(lastPoint)}
                radius={lastPoint.accuracy}
              />
            )}

            {activePoint &&
              lastPoint !== activePoint &&
              typeof activePoint.accuracy === 'number' && (
                <Circle
                  weight={2}
                  interactive={false}
                  center={toLatLng(activePoint)}
                  radius={activePoint.accuracy}
                />
              )}

            {showLine &&
              track.trackPoints.length > 1 &&
              segments.map((segment, i) => (
                <Polyline
                  key={`seg-${i}-${interactive ? 'a' : 'b'}`}
                  positions={toLatLngArr(segment)}
                  weight={width}
                  color={color}
                  bubblingMouseEvents={false}
                  eventHandlers={{
                    click: handleClick,
                  }}
                  interactive={interactive}
                />
              ))}

            {(showPoints || track.trackPoints.length === 0
              ? track.trackPoints
              : [track.trackPoints[track.trackPoints.length - 1]]
            ).map((tp, i) =>
              !showPoints || i === track.trackPoints.length - 1 ? (
                <RichMarker
                  key={`rm-${tp.id}-${interactive ? 'a' : 'b'}`}
                  interactive={interactive}
                  position={toLatLon(
                    track.trackPoints[track.trackPoints.length - 1],
                  )}
                  color={color}
                  eventHandlers={{
                    click: handleClick,
                  }}
                  faIcon={
                    track.id === activeTrackId ? (
                      <FaUser color={color} />
                    ) : (
                      <FaRegUser color={color} />
                    )
                  }
                >
                  <Tooltip direction="top" offset={[0, -36]} permanent>
                    {tooltipText(df, nf, tp, track.label)}
                  </Tooltip>
                </RichMarker>
              ) : (
                <TrackingPoint
                  key={`tp-${tp.id}-${interactive ? 'a' : 'b'}`}
                  interactive={interactive}
                  tp={tp}
                  width={width}
                  color={color}
                  language={language}
                  onActivePointSet={setActivePoint}
                  onClick={handleClick}
                />
              ),
            )}
          </Fragment>
        );
      })}
    </>
  );
}

function toLatLon(x: TrackPoint) {
  return { lat: x.lat, lng: x.lon };
}
