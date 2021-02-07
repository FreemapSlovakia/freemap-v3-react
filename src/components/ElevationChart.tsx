import {
  elevationChartClose,
  elevationChartRemoveActivePoint,
  elevationChartSetActivePoint,
} from 'fm3/actions/elevationChartActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import 'fm3/styles/elevationChart.scss';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { Line } from 'react-chartjs-2';
import { FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function ElevationChart(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const elevationProfilePoints = useSelector(
    (state: RootState) => state.elevationChart.elevationProfilePoints,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  if (!elevationProfilePoints) {
    return null;
  }

  const nf0 = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const nf1 = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const { climbUp, climbDown, distance } = elevationProfilePoints[
    elevationProfilePoints.length - 1
  ];

  return (
    <div className="elevationChart">
      <Button
        variant="dark"
        size="sm"
        onClick={() => dispatch(elevationChartClose())}
      >
        <FaTimes />
      </Button>

      <Line
        options={{
          tooltips: {
            enabled: false,
            mode: 'x' as const,
            intersect: false,
            custom(tooltip: any /* dataPoints is missing in the type */) {
              if (tooltip?.dataPoints?.length) {
                dispatch(
                  elevationChartSetActivePoint(
                    elevationProfilePoints[tooltip.dataPoints[0].index],
                  ),
                );
              } else {
                dispatch(elevationChartRemoveActivePoint());
              }
            },
          },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                type: 'linear',
                ticks: {
                  callback: (label: number) => nf1.format(label / 1000),
                  max: distance,
                },
                scaleLabel: {
                  display: true,
                  labelString: m?.elevationChart.distance,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  callback: (label: number) => nf0.format(label),
                },
                scaleLabel: {
                  display: true,
                  labelString: m?.elevationChart.ele,
                },
              },
            ],
          },
        }}
        data={{
          labels: elevationProfilePoints.map((p) =>
            nf1.format(p.distance / 1000),
          ),
          datasets: [
            {
              fill: true,
              lineTension: 0,
              backgroundColor: 'rgba(51, 136, 255, 0.54)',
              borderWidth: 0.001,
              pointBorderWidth: 0,
              pointHoverRadius: 0,
              pointRadius: 0,
              data: elevationProfilePoints.map((p) => ({
                x: p.distance,
                y: p.ele,
              })),
            },
          ],
        }}
      />

      {typeof climbUp === 'number' && typeof climbDown === 'number' && (
        <p>
          {m?.trackViewer.details.uphill}: {nf0.format(climbUp)} m,{' '}
          {m?.trackViewer.details.downhill}: {nf0.format(climbDown)} m
        </p>
      )}
    </div>
  );
}
