import { pickingModeSelector } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type LeafletMouseEvent, Point } from 'leaflet';
import type { ReactElement } from 'react';
import { FaInfo } from 'react-icons/fa';
import { Tooltip, useMap, useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { gradeAt, indexOfProfilePoint } from '../grade.js';
import { elevationChartSetActivePoint } from '../model/actions.js';
import { projectOnProfile } from '../profilePoint.js';

// How near the drawn line the pointer must come for the readout to appear.
// Generous enough to catch the line without demanding pixel accuracy, tight
// enough that a pointer merely crossing the map doesn't light it up.
const HOVER_TOLERANCE_PX = 14;

// A move shorter than this along the line changes no readout, so it isn't
// dispatched — the pointer moving across the line rather than along it (and a
// re-entry at the same place) leaves the store alone.
const MIN_STEP_M = 0.1;

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

export function ElevationChartActivePoint(): ReactElement | null {
  const m = useMessages();

  useProfileHover();

  const elevationChartActivePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  // The grade is measured along the profile's distance axis, so the point has
  // to be located on it first.
  const grade = useAppSelector(({ elevationChart, elevationSettings }) => {
    const { activePoint, elevationProfilePoints } = elevationChart;

    return activePoint && elevationProfilePoints
      ? gradeAt(
          elevationProfilePoints,
          indexOfProfilePoint(elevationProfilePoints, activePoint),
          elevationSettings.gradeWindow,
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
    elevationChartActivePoint && (
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
    )
  );
}
