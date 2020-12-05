import React, { CSSProperties, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Line } from 'react-chartjs-2';
import Button from 'react-bootstrap/lib/Button';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import {
  elevationChartSetActivePoint,
  elevationChartRemoveActivePoint,
} from 'fm3/actions/elevationChartActions';
import { useMessages } from 'fm3/l10nInjector';

import 'fm3/styles/elevationChart.scss';
import { RootState } from 'fm3/storeCreator';
import { FontAwesomeIcon } from './FontAwesomeIcon';

const styles: Record<string, CSSProperties> = {
  closeButtonStyle: { position: 'absolute', right: 0, marginRight: '10px' },
  pStyle: { marginLeft: '4px' },
};

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
        style={styles.closeButton}
        bsSize="small"
        onClick={() => dispatch(elevationChartClose())}
      >
        <FontAwesomeIcon icon="times" />
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
        <p style={styles.pStyle}>
          {m?.trackViewer.details.uphill}: {nf0.format(climbUp)} m,{' '}
          {m?.trackViewer.details.downhill}: {nf0.format(climbDown)} m
        </p>
      )}
    </div>
  );
}
