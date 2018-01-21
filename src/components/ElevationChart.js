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
  const nf1 = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const optionsForChartJS = {
    tooltips: {
      enabled: false,
      mode: 'x',
      intersect: false,
      custom(tooltip) {
        if (tooltip && tooltip.dataPoints && tooltip.dataPoints.length) {
          const dataPoint = tooltip.dataPoints[0];
          const eleDetailPoint = elevationProfilePoints[dataPoint.index];
          setActivePoint(eleDetailPoint);
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
        ticks: {
          userCallback: (label, index, labels) => (index % 10 === 0 || index === labels.length - 1 ? label : null),
        },
        scaleLabel: {
          display: true,
          labelString: t('elevationChart.distance'),
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: t('elevationChart.ele'),
        },
      }],
    },
  };

  const dataForChartJS = {
    xLabels: elevationProfilePoints.map(({ distanceFromStartInMeters }) => nf1.format(distanceFromStartInMeters / 1000)),
    datasets: [
      {
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgba(51, 136, 255, 0.54)',
        borderColor: '#38f',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: '#38f',
        pointBackgroundColor: '#38f',
        pointBorderWidth: 1,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: '#38f',
        pointHoverBorderWidth: 1,
        pointRadius: 1,
        pointHitRadius: 5,
        data: elevationProfilePoints.map(p => p.ele),
      },
    ],
  };

  return (
    <div className="elevationChart">
      <Line options={optionsForChartJS} data={dataForChartJS} />
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
