import { pickingModeSelector } from '@app/store/selectors.js';
import { Text } from '@features/l10n/Text.js';
import { useColorizeScale } from '@shared/colorizers/colorizeScale.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { metersPerPixel } from '@shared/geoutils.js';
import { HALO_OVER_Z, HALO_PANE, HALO_WIDTH } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type LeafletMouseEvent, Point } from 'leaflet';
import { type ReactElement, useEffect, useMemo } from 'react';
import { FaInfo, FaPalette } from 'react-icons/fa';
import { Pane, Tooltip, useMap, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { gradeAt } from '../grade.js';
import { stopAtDistance, useChartColorize } from '../hooks/useChartColorize.js';
import { elevationChartSetActivePoint } from '../model/actions.js';
import { gradeWindowMeters } from '../model/settingsReducer.js';
import { projectOnProfile } from '../profilePoint.js';
import { targetLineWidth } from '../targetLineWidth.js';
import { ElevationRangeLine } from './ElevationRangeLine.js';

// How near the drawn line the pointer must come for the readout to appear.
// Generous enough to catch the line without demanding pixel accuracy, tight
// enough that a pointer merely crossing the map doesn't light it up.
const HOVER_TOLERANCE_PX = 14;

// A move shorter than this along the line changes no readout, so it isn't
// dispatched — the pointer moving across the line rather than along it (and a
// re-entry at the same place) leaves the store alone.
const MIN_STEP_M = 0.1;

// Nested in the halo pane so the band fades with the halos instead of blending
// over them, and over their content, which it stands in for along the marked
// stretch.
const RANGE_PANE = 'fm-elevation-range';

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

  // Not the map's `mouseout`: a layer listening for it (a hover label) takes the
  // event when the pointer leaves the map straight from that layer.
  useEffect(() => {
    if (activeDistance === undefined) {
      return;
    }

    const container = map.getContainer();

    const handleLeave = () => {
      dispatch(elevationChartSetActivePoint(null));
    };

    container.addEventListener('mouseleave', handleLeave);

    return () => container.removeEventListener('mouseleave', handleLeave);
  }, [map, dispatch, activeDistance]);
}

/**
 * The marked stretch on the map, over the halo the line wears and under the
 * line itself.
 */
function RangeHighlight(): ReactElement {
  const weight = useAppSelector(targetLineWidth) + HALO_WIDTH;

  return (
    <Pane name={RANGE_PANE} pane={HALO_PANE} style={{ zIndex: HALO_OVER_Z }}>
      <ElevationRangeLine weight={weight} />
    </Pane>
  );
}

/**
 * What the colorize mode reads at a distance along the profile, as its legend
 * would read it — off the line smoothed about as the map draws it. It colorizes
 * the line itself, so it stays mounted to keep that between hovers.
 */
function useColorizedValue(distance: number | undefined): string | undefined {
  const profileMeters = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints?.at(-1)?.distance,
  );

  // The power of two the chart rounds to anyway, so a pan doesn't re-render.
  const level = useAppSelector(({ map }) =>
    Math.round(Math.log2(metersPerPixel(map.zoom, map.lat))),
  );

  const { stops, mode, features } = useChartColorize(
    2 ** level,
    profileMeters ?? 0,
  );

  const stop =
    distance === undefined ? undefined : stopAtDistance(stops, distance);

  const source = stop?.source === undefined ? undefined : features[stop.source];

  // Each line was scaled by its own range; a stable array keeps the scale memo.
  const sourceFeatures = useMemo(
    () => (source ? [source] : undefined),
    [source],
  );

  // Read at the stops' smoothing, so the values are what they were scaled by.
  const { valueAt } = useColorizeScale(mode, sourceFeatures, 2 ** level);

  return stop && valueAt?.(stop.color);
}

export function ElevationChartActivePoint(): ReactElement | null {
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

  const colorized = useColorizedValue(elevationChartActivePoint?.distance);

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
              {nf0.format(elevationChartActivePoint.ele)}{' '}
              <Text k="general.masl" />
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
              {colorized !== undefined && (
                <>
                  <br /> <FaPalette /> {colorized}
                </>
              )}
            </span>
          </Tooltip>
        </RichMarker>
      )}
    </>
  );
}
