import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turfLineDistance from '@turf/line-distance';
import { distance } from 'fm3/geoutils';
import { Line } from 'react-chartjs-2';
import 'fm3/styles/elevationChart.scss';

class ElevationChart extends React.Component {
  static propTypes = {
    trackGeojson: PropTypes.object, // eslint-disable-line
  }

  computeChartData = () => {
    const trackGeojson = this.props.trackGeojson;
    const totalDistanceInMeters = turfLineDistance(trackGeojson) * 1000;
    const xAxisPointsCount = 100;
    const deltaInMeters = totalDistanceInMeters / xAxisPointsCount;

    const lonLatEleCoords = trackGeojson.features[0].geometry.coordinates;
    let distanceFromStartInMeters = 0.0;
    let currentXAxisPointCounter = 0;
    let prevLonlatEle = null;
    const eleForXAxisPoints = [];
    lonLatEleCoords.forEach(([lon, lat, ele]) => {
      if (prevLonlatEle) {
        const [prevLon, prevLat] = prevLonlatEle;
        const distanceToPreviousPointInMeters = distance(lat, lon, prevLat, prevLon);
        distanceFromStartInMeters += distanceToPreviousPointInMeters;
        if (currentXAxisPointCounter * deltaInMeters <= distanceFromStartInMeters) {
          eleForXAxisPoints.push(ele);
          currentXAxisPointCounter += 1;
        }
      }
      prevLonlatEle = [lon, lat, ele];
    });

    const labels = eleForXAxisPoints.map((ele, i) => (i * deltaInMeters / 1000).toFixed(0));
    const chartData = {
      labels,
      datasets: [
        {
          fill: false,
          lineTension: 0.1,
          backgroundColor: '#38f',
          borderColor: '#38f',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: '#38f',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#38f',
          pointHoverBorderColor: '#38f',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: eleForXAxisPoints,
        },
      ],
    };

    return chartData;
  }

  render() {
    const showChart = this.props.trackGeojson;
    let chartData = {};
    if (showChart) {
      chartData = this.computeChartData();
    }

    const chartOptions = {
      tooltips: {
        enabled: false,
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
      showChart &&
      <div id="elevationChart">
        <Line options={chartOptions} data={chartData} />
      </div>);
  }
}

export default connect(
  state => ({
    trackGeojson: state.elevationChart.trackGeojson,
  }),
)(ElevationChart);
