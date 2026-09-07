import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import {
  availableColorizer,
  type ColorizedPoint,
  colorizerHotlineOptions,
  NO_DATA_COLOR,
  NO_DATA_OPACITY,
  noDataRuns,
  splitOnGaps,
} from '@shared/colorizers/colorize.js';
import { colorizers, type HotlinePalette } from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { toLatLng, toLatLngArr } from '@shared/geoutils.js';
import {
  HALO_COLOR,
  HALO_PANE,
  HALO_WIDTH,
  SELECTION_COLOR,
} from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { Fragment, type ReactElement, useMemo, useRef, useState } from 'react';
import { FaRegUser, FaUser } from 'react-icons/fa';
import { Circle, Pane, Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { hasElevation } from '../chartTrack.js';
import type { TrackPoint } from '../model/types.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import {
  DEFAULT_TRACK_COLOR,
  DEFAULT_TRACK_WIDTH,
  resolveTracks,
  splitTrackSegments,
} from '../tracks.js';
import { TrackingPoint, tooltipText } from './TrackingPoint.js';

const POINTS_PANE = 'fm-tracking-points';

// Whole objects, so a re-render hands Leaflet the same options back instead of
// restyling every path.
const HALO_OPTIONS = {
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
} as const;

const SELECTION_HALO = { ...HALO_OPTIONS, color: SELECTION_COLOR };

// What an unselected colorized track wears instead: its colors are the mode's,
// so it needs an outline of its own to stay legible over the map.
const CASING = { ...HALO_OPTIONS, color: HALO_COLOR };

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

  const showLine = useAppSelector((state) => state.trackingSettings.showLine);

  const showPoints = useAppSelector(
    (state) => state.trackingSettings.showPoints,
  );

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const colorizeBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackingSettings.colorizeBy),
  );

  const zoom = useAppSelector((state) => state.map.zoom);

  // Colorized here rather than through `useZoomColorize` (the tracks are kept
  // apart), so the option that hook passes has to be read here too.
  const steepnessScale = useAppSelector(
    (state) => state.elevationSettings.steepnessScale,
  );

  const picked = colorizeBy ? colorizers[colorizeBy] : null;

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
          ...colorizerHotlineOptions(picked),
        };

        cache.set(w, opts);
      }

      return opts;
    };
  }, [picked]);

  const tracks1 = useMemo(
    () => resolveTracks(tracks, trackedDevices),
    [trackedDevices, tracks],
  );

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

  // Segment + colorize each track once per (tracks, colorizer, zoom) rather than
  // on every render: live tracking re-renders frequently (hover, selection),
  // and the windowed smoothing is far too costly to repeat each time.
  const perTrack = useMemo(() => {
    const map = new Map<
      string,
      { segments: TrackPoint[][]; colorizedPositions: ColorizedPoint[][] }
    >();

    for (const track of tracks1) {
      const segments = splitTrackSegments(track);

      // The mode is persisted, so it outlives the tracks it was picked for and
      // is asked of every device. Where it has nothing to say about this one,
      // its own colored line stands rather than a line of no-data grey.
      // Elevation a device never reported can't be filled in, hence the same
      // gate the chart button uses.
      const colorizer =
        picked?.needsElevation && !hasElevation(track.trackPoints)
          ? null
          : availableColorizer(picked, [
              trackPointsToFeature(track.trackPoints),
            ]);

      const colorizedPositions = colorizer
        ? segments.flatMap((segment) =>
            colorizer.compute([trackPointsToFeature(segment)], {
              zoom,
              steepnessScale,
            }),
          )
        : [];

      map.set(track.token, { segments, colorizedPositions });
    }

    return map;
  }, [tracks1, picked, zoom, steepnessScale]);

  return (
    <>
      {/* The points and the line's hit area, above the colorize canvas (default
          overlayPane, zIndex 400) — which would otherwise cover the points and
          take every pointer event meant for them. */}
      <Pane name={POINTS_PANE} style={{ zIndex: 450 }} />

      {tracks1.map((track) => {
        const color = track.color || DEFAULT_TRACK_COLOR;

        const width = track.width || DEFAULT_TRACK_WIDTH;

        let handleClick = clickHandlerMemo.current[track.token];

        if (!handleClick) {
          handleClick = () => {
            dispatch(selectFeature({ type: 'tracking', id: track.token }));
          };

          clickHandlerMemo.current[track.token] = handleClick;
        }

        const { segments, colorizedPositions } = perTrack.get(track.token)!;

        const lastPoint =
          track.trackPoints.length > 0 ? track.trackPoints.at(-1)! : null;

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
              (showColorized || track.token === activeTrackId) &&
              segments.map((segment, i) => (
                <Polyline
                  key={`halo-${i}`}
                  pane={HALO_PANE}
                  positions={toLatLngArr(segment)}
                  weight={width + HALO_WIDTH}
                  pathOptions={
                    track.token === activeTrackId ? SELECTION_HALO : CASING
                  }
                  interactive={false}
                />
              ))}

            {/* Invisible hit line per segment, wider than the line so a mouse
                or a finger doesn't have to land on it exactly. A colorized
                track's Hotline is a non-interactive canvas, so that one has to
                be caught from the pane above it; anything else stays in the
                overlay pane, where it doesn't outrank the other features'
                lines. */}
            {showLine &&
              track.trackPoints.length > 1 &&
              segments.map((segment, i) => (
                <Polyline
                  key={`hit-${i}-${interactive ? 'a' : 'b'}`}
                  pane={showColorized ? POINTS_PANE : undefined}
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

            {showLine &&
              track.trackPoints.length > 1 &&
              (showColorized ? (
                <>
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
                    key={`seg-${i}`}
                    positions={toLatLngArr(segment)}
                    weight={width}
                    color={color}
                    interactive={false}
                  />
                ))
              ))}

            {(showPoints || track.trackPoints.length === 0
              ? track.trackPoints
              : [track.trackPoints.at(-1)!]
            ).map((tp, i) =>
              !showPoints || i === track.trackPoints.length - 1 ? (
                <RichMarker
                  key={`rm-${tp.id}-${activeTrackId === track.token}`}
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
                  pane={POINTS_PANE}
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
