import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { colorizers, type HotlinePalette } from '@shared/colorizers/index.js';
import {
  NO_DATA_COLOR,
  NO_DATA_OPACITY,
  noDataRuns,
  splitOnGaps,
} from '@shared/colorizers/types.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { toLatLng, toLatLngArr } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { distance } from '@turf/distance';
import { Fragment, ReactElement, useMemo, useRef, useState } from 'react';
import { FaRegUser, FaUser } from 'react-icons/fa';
import { Circle, Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { TrackPoint } from '../model/types.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import { TrackingPoint, tooltipText } from './TrackingPoint.js';

type HotlineOpts = {
  weight: number;
  outlineWidth: number;
  palette: HotlinePalette | undefined;
};

// TODO hooks-based rewrite causes massive re-rendering; revisit
export function TrackingResult(): ReactElement {
  const clickHandlerMemo = useRef<Record<string, () => void>>({});

  const dispatch = useDispatch();

  const language = useAppSelector((state) => state.l10n.language);

  const showLine = useAppSelector((state) => state.tracking.showLine);

  const showPoints = useAppSelector((state) => state.tracking.showPoints);

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const colorizeBy = useAppSelector((state) => state.tracking.colorizeBy);

  const activeColorizer = colorizeBy ? colorizers[colorizeBy] : null;

  // Stable per (colorizer, width) so the Hotline's options-effect doesn't fire
  // on every render; tracks may each carry their own line width.
  const hotlineOptionsFor = useMemo(() => {
    const cache = new Map<number, HotlineOpts>();

    return (w: number): HotlineOpts => {
      let opts = cache.get(w);

      if (!opts) {
        opts = {
          weight: w,
          outlineWidth: 0,
          palette: activeColorizer?.palette,
        };

        cache.set(w, opts);
      }

      return opts;
    };
  }, [activeColorizer]);

  const tracks1 = useMemo(() => {
    const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

    return tracks.map((track) => ({
      ...track,
      ...tdMap.get(track.token),
    }));
  }, [trackedDevices, tracks]);

  const activeTrackId = useAppSelector((state) =>
    state.main.selection?.type === 'tracking'
      ? state.main.selection?.id
      : undefined,
  );

  const [activePoint, setActivePoint] = useState<TrackPoint | null>(null);

  const df = useDateTimeFormat({
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const nf = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const interactive =
    useAppSelector(selectingModeSelector) || window.fmEmbedded;

  return (
    <>
      {tracks1.map((track) => {
        const color = track.color || '#7239a8';

        const width = track.width || 4;

        let handleClick = clickHandlerMemo.current[track.token];

        if (!handleClick) {
          handleClick = () => {
            dispatch(selectFeature({ type: 'tracking', id: track.token }));
          };

          clickHandlerMemo.current[track.token] = handleClick;
        }

        const segments: TrackPoint[][] = [];

        let curSegment: TrackPoint[] | null = null;

        let prevTp: TrackPoint | undefined;

        for (const tp of track.trackPoints) {
          if (
            prevTp &&
            ((typeof track.splitDistance === 'number' &&
              distance([tp.lon, tp.lat], [prevTp.lon, prevTp.lat], {
                units: 'meters',
              }) > track.splitDistance) ||
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
          track.trackPoints.length > 0 ? track.trackPoints.at(-1)! : null;

        // Colorized points per segment; empty when the active mode has no data
        // for this track, in which case the plain colored line is kept.
        const colorizedPositions = activeColorizer
          ? segments.flatMap((segment) =>
              activeColorizer.compute([trackPointsToFeature(segment)]),
            )
          : [];

        const colorizedRuns = colorizedPositions.flatMap(splitOnGaps);

        // Stretches the mode can't value, drawn in a neutral color so the line
        // stays continuous instead of breaking at the gap.
        const noDataRunsList = colorizedPositions.flatMap(noDataRuns);

        const showColorized =
          colorizedRuns.length > 0 || noDataRunsList.length > 0;

        return (
          <Fragment key={`trk-${track.token}`}>
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
              (showColorized ? (
                <>
                  {/* Invisible hit line per segment: the colorized Hotline is a
                      non-interactive canvas, so clicks select the track here. */}
                  {segments.map((segment, i) => (
                    <Polyline
                      key={`hit-${i}-${activeTrackId === track.token}-${
                        interactive ? 'a' : 'b'
                      }`}
                      positions={toLatLngArr(segment)}
                      weight={width + 8}
                      opacity={0}
                      bubblingMouseEvents={false}
                      eventHandlers={{
                        click: handleClick,
                      }}
                      interactive={interactive}
                    />
                  ))}

                  {noDataRunsList.map((run, j) => (
                    <Polyline
                      key={`nodata-${colorizeBy}-${j}-${
                        activeTrackId === track.token
                      }`}
                      positions={run.map((p): [number, number] => [
                        p.lat,
                        p.lon,
                      ])}
                      weight={Math.max(1, width - 2)}
                      pathOptions={{
                        color: NO_DATA_COLOR,
                        opacity: NO_DATA_OPACITY,
                        lineCap: 'round',
                      }}
                      interactive={false}
                    />
                  ))}

                  {colorizedRuns.map((run, j) => (
                    <Hotline
                      key={`hot-${colorizeBy}-${j}-${
                        activeTrackId === track.token
                      }`}
                      data={run}
                      getVal={(p) => p.point.color}
                      getLat={(p) => p.point.lat}
                      getLng={(p) => p.point.lon}
                      options={hotlineOptionsFor(width)}
                    />
                  ))}
                </>
              ) : (
                segments.map((segment, i) => (
                  <Polyline
                    key={`seg-${i}-${activeTrackId === track.token}-${
                      interactive ? 'a' : 'b'
                    }`}
                    positions={toLatLngArr(segment)}
                    weight={width}
                    color={color}
                    bubblingMouseEvents={false}
                    eventHandlers={{
                      click: handleClick,
                    }}
                    interactive={interactive}
                    opacity={track.token === activeTrackId ? 1 : 0.75}
                  />
                ))
              ))}

            {(showPoints || track.trackPoints.length === 0
              ? track.trackPoints
              : [track.trackPoints.at(-1)!]
            ).map((tp, i) =>
              !showPoints || i === track.trackPoints.length - 1 ? (
                <RichMarker
                  key={`rm-${tp.id}-${activeTrackId === track.token}-${
                    interactive ? 'a' : 'b'
                  }`}
                  interactive={interactive}
                  position={toLatLon(track.trackPoints.at(-1)!)}
                  color={color}
                  eventHandlers={{
                    click: handleClick,
                  }}
                  faIcon={
                    track.token === activeTrackId ? (
                      <FaUser color={color} />
                    ) : (
                      <FaRegUser color={color} />
                    )
                  }
                >
                  <Tooltip
                    direction="top"
                    permanent={track.token === activeTrackId}
                  >
                    {tooltipText(df, nf, tp, track.label)}
                  </Tooltip>
                </RichMarker>
              ) : (
                <TrackingPoint
                  key={`tp-${tp.id}-${activeTrackId}-${
                    interactive ? 'a' : 'b'
                  }`}
                  interactive={interactive}
                  tp={tp}
                  width={width}
                  color={color}
                  language={language}
                  onActivePointSet={setActivePoint}
                  onClick={handleClick}
                  opacity={track.token === activeTrackId ? 1 : 0.75}
                />
              ),
            )}
          </Fragment>
        );
      })}

      <ElevationChartActivePoint />
    </>
  );
}

function toLatLon(x: TrackPoint) {
  return { lat: x.lat, lng: x.lon };
}
