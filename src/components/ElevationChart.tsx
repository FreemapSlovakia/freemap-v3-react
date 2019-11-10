import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Line } from 'react-chartjs-2';

import {
  elevationChartSetActivePoint,
  elevationChartRemoveActivePoint,
} from 'fm3/actions/elevationChartActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import 'fm3/styles/elevationChart.scss';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { ElevationProfilePoint } from 'fm3/reducers/elevationChartReducer';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ElevationChart: React.FC<Props> = ({
  elevationProfilePoints,
  setActivePoint,
  removeActivePoint,
  t,
  language,
}) => {
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
      <Line
        options={{
          tooltips: {
            enabled: false,
            mode: 'x' as const,
            intersect: false,
            custom(tooltip: any /* dataPoints is missing in the type */) {
              if (tooltip?.dataPoints?.length) {
                setActivePoint(
                  elevationProfilePoints[tooltip.dataPoints[0].index],
                );
              } else {
                removeActivePoint();
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
                  callback: label => nf1.format(label / 1000),
                  max: distance,
                },
                scaleLabel: {
                  display: true,
                  labelString: t('elevationChart.distance'),
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  callback: label => nf0.format(label),
                },
                scaleLabel: {
                  display: true,
                  labelString: t('elevationChart.ele'),
                },
              },
            ],
          },
        }}
        data={{
          labels: elevationProfilePoints.map(p =>
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
              data: elevationProfilePoints.map(p => ({
                x: p.distance,
                y: p.ele,
              })),
            },
          ],
        }}
      />
      {typeof climbUp === 'number' && typeof climbDown === 'number' && (
        <p style={{ marginLeft: '4px' }}>
          {t('trackViewer.details.uphill')}: {nf0.format(climbUp)} m,{' '}
          {t('trackViewer.details.downhill')}: {nf0.format(climbDown)} m
        </p>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  elevationProfilePoints: state.elevationChart.elevationProfilePoints,
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  setActivePoint(activePoint: ElevationProfilePoint) {
    dispatch(elevationChartSetActivePoint(activePoint));
  },
  removeActivePoint() {
    dispatch(elevationChartRemoveActivePoint());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ElevationChart));
