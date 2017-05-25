import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';

import { elevationChartSetActivePoint, elevationChartRemoveActivePoint } from 'fm3/actions/elevationChartActions';

import 'fm3/styles/elevationChart.scss';

class ElevationChart extends React.Component {
  static propTypes = {
    elevationProfilePoints: PropTypes.arrayOf(PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      ele: PropTypes.number.isRequired,
      distanceFromStartInMeters: PropTypes.number.isRequired,
    })),
    setActivePoint: PropTypes.func.isRequired,
    removeActivePoint: PropTypes.func.isRequired,
  }

  dataForChartJS = () => {
    const elevationProfilePoints = this.props.elevationProfilePoints;
    const xAxisLabels = elevationProfilePoints.map(({ distanceFromStartInMeters }) => (distanceFromStartInMeters / 1000).toFixed(1));
    return {
      xLabels: xAxisLabels,
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
  }

  optionsForChartJS = () => {
    const { elevationProfilePoints, setActivePoint, removeActivePoint } = this.props;
    return {
      tooltips: {
        enabled: false,
        custom: (tooltip) => {
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
            userCallback: (label, index, labels) => {
              if (index % 10 === 0 || index === labels.length - 1) {
                return label;
              }
              return null;
            },
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
  }

  render() {
    const { elevationProfilePoints } = this.props;
    return (
      elevationProfilePoints &&
      <div id="elevationChart">
        <Line options={this.optionsForChartJS()} data={this.dataForChartJS()} />
      </div>
    );
  }
}

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
