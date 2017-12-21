import React from 'react';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

import { elevationChartSetActivePoint, elevationChartRemoveActivePoint } from 'fm3/actions/elevationChartActions';
import { elevationChartProfilePoint } from 'fm3/propTypes';

import 'fm3/styles/elevationChart.scss';

function ElevationChart({ elevationProfilePoints, setActivePoint, removeActivePoint }) {
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
          labelString: 'Vzdialenosť [km]',
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Nadm. výška [m.n.m.]',
        },
      }],
    },
  };

  const dataForChartJS = {
    xLabels: elevationProfilePoints.map(({ distanceFromStartInMeters }) => (distanceFromStartInMeters / 1000).toFixed(1)),
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
};

export default connect(
  state => ({
    elevationProfilePoints: state.elevationChart.elevationProfilePoints,
  }),
  dispatch => ({
    setActivePoint(activePoint) {
      dispatch(elevationChartSetActivePoint(activePoint));
    },
    removeActivePoint() {
      dispatch(elevationChartRemoveActivePoint());
    },
  }),
)(ElevationChart);
