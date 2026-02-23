import { Point } from 'leaflet';
import type { ReactElement } from 'react';
import { FaInfo } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { RichMarker } from '../../../components/RichMarker.js';
import { formatDistance } from '../../../distanceFormatter.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useNumberFormat } from '../../../hooks/useNumberFormat.js';
import { useMessages } from '../../../l10nInjector.js';

export function ElevationChartActivePoint(): ReactElement | null {
  const m = useMessages();

  const elevationChartActivePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
          </span>
        </Tooltip>
      </RichMarker>
    )
  );
}
