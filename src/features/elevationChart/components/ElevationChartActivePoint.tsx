import { pickingModeSelector } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type LatLngTuple, type LeafletMouseEvent, Point } from 'leaflet';
import { type ReactElement, useMemo } from 'react';
import { FaInfo } from 'react-icons/fa';
import { Pane, Polyline, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { gradeAt } from '../grade.js';
import { elevationChartSetActivePoint } from '../model/actions.js';
import { gradeWindowMeters } from '../model/settingsReducer.js';
import {
  elevatedRuns,
  profileSlice,
  projectOnProfile,
} from '../profilePoint.js';

// How near the drawn line the pointer must come for the readout to appear.
// Generous enough to catch the line without demanding pixel accuracy, tight
// enough that a pointer merely crossing the map doesn't light it up.
const HOVER_TOLERANCE_PX = 14;

// A move shorter than this along the line changes no readout, so it isn't
// dispatched — the pointer moving across the line rather than along it (and a
// re-entry at the same place) leaves the store alone.
const MIN_STEP_M = 0.1;

// A band over the line, in the chart's own accent — wide enough to read past
// the line under it, and see-through so that line stays legible.
const RANGE_STYLE = {
  // Named rather than spelled out, so it stays the one ink the chart draws its
  // own marks in. Leaflet writes it onto an SVG path in the document, where the
  // custom property resolves.
  color: 'var(--bs-danger)',
  weight: 10,
  opacity: 0.4,
  lineCap: 'round',
  lineJoin: 'round',
  interactive: false,
} as const;

// Above every line the chart can be aimed at — the planned route has a pane of
// its own at the overlay pane's own z-index and, being mounted later, paints
// over it — and below the markers.
const RANGE_PANE = 'fm-elevation-range';
const RANGE_PANE_Z = 550;

/**
 * Points the chart at the place under the pointer, the mirror of hovering the
 * chart to mark the place on the map. The position is projected onto the
 * profile's own polyline, so it follows the line continuously rather than
 * snapping to the samples the profile was measured at.
 *
 * The hit test runs on the map's pointer events rather than on a transparent
 * line laid over the drawn one: an interactive layer takes *every* pointer
 * event from whatever is beneath it, which would cost the route and drawing
 * lines their own clicks and hovers.
 */
function useProfileHover() {
  const dispatch = useDispatch();

  const map = useMap();

  const points = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints,
  );

  const activeDistance = useAppSelector(
    (state) => state.elevationChart.activePoint?.distance,
  );

  // While a picking mode owns the map (choosing a home/photo location, dragging
  // an export area) the features go inert, this readout with them.
  const picking = useAppSelector(pickingModeSelector);

  const clear = () => {
    if (activeDistance !== undefined) {
      dispatch(elevationChartSetActivePoint(null));
    }
  };

  useMapEvent('mousemove', ({ latlng, containerPoint }: LeafletMouseEvent) => {
    if (picking || !points?.length) {
      return;
    }

    const point = projectOnProfile(points, latlng.lat, latlng.lng);

    if (
      !point ||
      map
        .latLngToContainerPoint([point.lat, point.lon])
        .distanceTo(containerPoint) > HOVER_TOLERANCE_PX
    ) {
      clear();

      return;
    }

    if (
      activeDistance === undefined ||
      Math.abs(activeDistance - point.distance) >= MIN_STEP_M
    ) {
      dispatch(elevationChartSetActivePoint(point));
    }
  });

  useMapEvent('mouseout', clear);
}

/**
 * The stretch the chart has marked out, drawn under the line it belongs to so
 * the figures in the panel have a place on the map. Same ink as the chart's own
 * marks, which is what says the two belong together.
 */
function RangeHighlight(): ReactElement | null {
  const range = useAppSelector((state) => state.elevationChart.range);

  const points = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints,
  );

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
      <Pane name={RANGE_PANE} style={{ zIndex: RANGE_PANE_Z }}>
        <Polyline positions={positions} {...RANGE_STYLE} />
      </Pane>
    )
  );
}

export function ElevationChartActivePoint(): ReactElement | null {
  const m = useMessages();

  useProfileHover();

  const elevationChartActivePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  const grade = useAppSelector(({ elevationChart, elevationSettings }) => {
    const { activePoint, elevationProfilePoints } = elevationChart;

    return activePoint && elevationProfilePoints
      ? gradeAt(
          elevationProfilePoints,
          activePoint,
          gradeWindowMeters(elevationSettings.gradeWindow),
        )
      : undefined;
  });

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Signed, so the readout says which way the slope goes without a second glyph.
  const nfSigned1 = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  });

  const language = useAppSelector((state) => state.l10n.language);

  return (
    <>
      <RangeHighlight />

      {elevationChartActivePoint && (
        <RichMarker
          faIcon={<FaInfo color="grey" />}
          color="grey"
          interactive={false}
          position={{
            lat: elevationChartActivePoint.lat,
            lng: elevationChartActivePoint.lon,
          }}
        >
          <Tooltip
            className="compact"
            offset={new Point(10, 10)}
            direction="right"
            permanent
          >
            <span>
              → {formatDistance(elevationChartActivePoint.distance, language)}
              {' ▴ '}
              {nf0.format(elevationChartActivePoint.ele)} {m?.general.masl}
              {typeof elevationChartActivePoint.climbUp === 'number' &&
                typeof elevationChartActivePoint.climbDown === 'number' && (
                  <>
                    <br />
                    {' ↑ '}
                    {nf0.format(elevationChartActivePoint.climbUp)} m{' ↓ '}
                    {nf0.format(elevationChartActivePoint.climbDown)} m
                  </>
                )}
              {grade !== undefined && (
                <>
                  <br />
                  {' ∡ '}
                  {nfSigned1.format(grade * 100)} % (
                  {nfSigned1.format((Math.atan(grade) * 180) / Math.PI)}°)
                </>
              )}
            </span>
          </Tooltip>
        </RichMarker>
      )}
    </>
  );
}
