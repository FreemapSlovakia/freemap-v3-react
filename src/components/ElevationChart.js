import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';
import turfLineDistance from '@turf/line-distance';

import { distance } from 'fm3/geoutils';

import { elevationChartSetActivePoint, elevationChartRemoveActivePoint } from 'fm3/actions/elevationChartActions';

import 'fm3/styles/elevationChart.scss';

class ElevationChart extends React.Component {
  static propTypes = {
    trackGeojson: PropTypes.object, // eslint-disable-line
    setActivePoint: PropTypes.func.isRequired,
    removeActivePoint: PropTypes.func.isRequired,
  }

  computeChartData = () => {
    const { trackGeojson } = this.props;

    const totalDistanceInMeters = turfLineDistance(trackGeojson) * 1000;
    const xAxisPointsCount = 100;
    const deltaInMeters = totalDistanceInMeters / xAxisPointsCount;

    const lonLatEleCoords = trackGeojson.features[0].geometry.coordinates;
    let distanceFromStartInMeters = 0.0;
    let currentXAxisPointCounter = 0;
    let prevLonlatEle = null;
    const eleForXAxisPoints = [];
    const fullDetailChartPoints = [];
    lonLatEleCoords.forEach(([lon, lat, ele]) => {
      if (prevLonlatEle) {
        const [prevLon, prevLat] = prevLonlatEle;
        const distanceToPreviousPointInMeters = distance(lat, lon, prevLat, prevLon);
        distanceFromStartInMeters += distanceToPreviousPointInMeters;
        if (currentXAxisPointCounter * deltaInMeters <= distanceFromStartInMeters) {
          eleForXAxisPoints.push(ele);
          fullDetailChartPoints.push({ lat, lon, ele, distanceFromStartInMeters });
          currentXAxisPointCounter += 1;
        }
      }
      prevLonlatEle = [lon, lat, ele];
    });

    const xAxisLabels = eleForXAxisPoints.map((ele, i) => (i * deltaInMeters / 1000).toFixed(1));
    const dataForChartJS = {
      xLabels: xAxisLabels,
      datasets: [
        {
          fill: true,
          lineTension: 0.1,
          backgroundColor: '#38f',
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
          data: eleForXAxisPoints,
        },
      ],
    };

    return { dataForChartJS, fullDetailChartPoints };
  }

  render() {
    const { trackGeojson, setActivePoint, removeActivePoint } = this.props;
    let dataForChartJS = {};
    let fullDetailChartPoints = [];

    if (trackGeojson) {
      const result = this.computeChartData();
      dataForChartJS = result.dataForChartJS;
      fullDetailChartPoints = result.fullDetailChartPoints;
    }

    const chartJSOptions = {
      tooltips: {
        enabled: false,
        custom: (tooltip) => {
          if (tooltip && tooltip.dataPoints && tooltip.dataPoints.length) {
            const dataPoint = tooltip.dataPoints[0];
            const fullDetailPoint = fullDetailChartPoints[dataPoint.index];
            setActivePoint(fullDetailPoint);
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
            autoSkip: true,
            maxTicksLimit: 5,
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

    return (
      trackGeojson &&
      <div id="elevationChart">
        <Line options={chartJSOptions} data={dataForChartJS} />
      </div>
    );
  }
}

export default connect(
  state => ({
    trackGeojson: state.elevationChart.trackGeojson,
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
