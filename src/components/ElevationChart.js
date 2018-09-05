import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

import { elevationChartSetActivePoint, elevationChartRemoveActivePoint } from 'fm3/actions/elevationChartActions';
import { elevationChartProfilePoint } from 'fm3/propTypes';
import injectL10n from 'fm3/l10nInjector';

import 'fm3/styles/elevationChart.scss';

function ElevationChart({ elevationProfilePoints, setActivePoint, removeActivePoint, t, language }) {
  const nf0 = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nf1 = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="elevationChart">
      <Line
        options={{
          tooltips: {
            enabled: false,
            mode: 'x',
            intersect: false,
            custom(tooltip) {
              if (tooltip && tooltip.dataPoints && tooltip.dataPoints.length) {
                setActivePoint(elevationProfilePoints[tooltip.dataPoints[0].index]);
              } else {
                removeActivePoint();
              }
            },
          },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              type: 'linear',
              ticks: {
                userCallback: label => nf1.format(label / 1000),
                max: elevationProfilePoints[elevationProfilePoints.length - 1].distance,
              },
              scaleLabel: {
                display: true,
                labelString: t('elevationChart.distance'),
              },
            }],
            yAxes: [{
              ticks: {
                userCallback: label => nf0.format(label),
              },
              scaleLabel: {
                display: true,
                labelString: t('elevationChart.ele'),
              },
            }],
          },
        }}
        data={{
          xLabels: elevationProfilePoints.map(({ distance }) => nf1.format(distance / 1000)),
          datasets: [
            {
              fill: true,
              lineTension: 0,
              backgroundColor: 'rgba(51, 136, 255, 0.54)',
              borderWidth: 0.001,
              pointBorderWidth: 0,
              pointHoverRadius: 0,
              pointRadius: 0,
              data: elevationProfilePoints.map(p => ({ x: p.distance, y: p.ele })),
            },
          ],
        }}
      />
    </div>
  );
}

ElevationChart.propTypes = {
  elevationProfilePoints: PropTypes.arrayOf(elevationChartProfilePoint),
  setActivePoint: PropTypes.func.isRequired,
  removeActivePoint: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      elevationProfilePoints: state.elevationChart.elevationProfilePoints,
      language: state.l10n.language,
    }),
    dispatch => ({
      setActivePoint(activePoint) {
        dispatch(elevationChartSetActivePoint(activePoint));
      },
      removeActivePoint() {
        dispatch(elevationChartRemoveActivePoint());
      },
    }),
  ),
)(ElevationChart);
