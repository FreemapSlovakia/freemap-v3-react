import { useMessages } from '@features/l10n/l10nInjector.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { Point } from 'leaflet';
import type { ReactElement } from 'react';
import { FaInfo } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { gradeAt, indexOfProfilePoint } from '../grade.js';

export function ElevationChartActivePoint(): ReactElement | null {
  const m = useMessages();

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
