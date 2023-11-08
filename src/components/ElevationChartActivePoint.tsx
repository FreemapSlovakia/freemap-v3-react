import { RichMarker } from 'fm3/components/RichMarker';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import { Point } from 'leaflet';
import { ReactElement } from 'react';
import { FaInfo } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';

export function ElevationChartActivePoint(): ReactElement | null {
  const m = useMessages();

  const elevationChartActivePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const nf1 = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

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
            → {nf1.format(elevationChartActivePoint.distance / 1000)} km
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
