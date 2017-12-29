import React from 'react';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { smoothElevations, distance } from 'fm3/geoutils';

const oneDecimalDigitNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const noDecimalDigitsNumberFormat = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const timeFormat = new Intl.DateTimeFormat('sk', { hour: 'numeric', minute: '2-digit' });

export default createLogic({
  type: at.TRACK_VIEWER_SHOW_INFO,
  process({ getState }, dispatch, done) {
    const { startPoints, finishPoints, trackGeojson, eleSmoothingFactor } = getState().trackViewer;

    const tableData = [];

    let startTime;
    let finishTime;

    if (startPoints.length) {
      [{ startTime }] = startPoints;
      if (startTime) {
        tableData.push(['startTime', 'Čas štartu', timeFormat.format(new Date(startTime))]);
      }
    }
    if (finishPoints.length) {
      [{ finishTime }] = finishPoints;
      if (finishTime) {
        tableData.push(['finishTime', 'Čas v cieli', timeFormat.format(new Date(finishTime))]);
      }
    }

    let duration = 0;
    if (startTime && finishTime) {
      duration = (new Date(finishTime) - new Date(startTime)) / 1000;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration - hours * 3600) / 60);
      tableData.push(['duration', 'Trvanie', `${hours} hodín ${minutes} minút`]);
    }

    if (finishPoints.length) {
      const [{ lengthInKm }] = finishPoints;
      tableData.push(['distance', 'Vzdialenosť', `${oneDecimalDigitNumberFormat.format(lengthInKm)} km`]);

      if (duration) {
        const avgSpeed = lengthInKm / duration * 3600;
        tableData.push(['avgSpeed', 'Priemerná rýchlosť', `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`]);
      }
    }

    const firstRealFeature = trackGeojson.features[0];
    let minEle = Infinity;
    let maxEle = -Infinity;
    let uphillEleSum = 0;
    let downhillEleSum = 0;
    const smoothedLatLonEles = smoothElevations(firstRealFeature, eleSmoothingFactor);
    let [previousLatLonEle] = smoothedLatLonEles;

    smoothedLatLonEles.forEach((latLonEle) => {
      const distanceFromPrevPointInMeters = distance(latLonEle[0], latLonEle[1], previousLatLonEle[0], previousLatLonEle[1]);
      if (10 * eleSmoothingFactor < distanceFromPrevPointInMeters) { // otherwise the ele sums are very high
        const ele = latLonEle[2];
        if (ele < minEle) {
          minEle = ele;
        }
        if (maxEle < ele) {
          maxEle = ele;
        }

        const eleDiff = ele - previousLatLonEle[2];
        if (eleDiff < 0) {
          downhillEleSum += eleDiff * -1;
        } else if (eleDiff > 0) {
          uphillEleSum += eleDiff;
        }
        previousLatLonEle = latLonEle;
      }
    });
    if (minEle !== Infinity) {
      tableData.push(['minEle', 'Najnižší bod', `${noDecimalDigitsNumberFormat.format(minEle)} m.n.m.`]);
    }
    if (maxEle !== -Infinity) {
      tableData.push(['maxEle', 'Najvyšší bod', `${noDecimalDigitsNumberFormat.format(maxEle)} m.n.m.`]);
    }
    tableData.push(['uphill', 'Celkové stúpanie', `${noDecimalDigitsNumberFormat.format(uphillEleSum)} m`]);
    tableData.push(['downhill', 'Celkové klesanie', `${noDecimalDigitsNumberFormat.format(downhillEleSum)} m`]);
    const infoMessage = (
      <dl className="trackInfo dl-horizontal">
        {
          tableData.map(([key, label, value]) => ([
            <dt key={`${key}-dt`}>{label}:</dt>,
            <dd key={`${key}-dd`} className="infoValue">{value}</dd>,
          ]))
        }
      </dl>
    );

    dispatch(toastsAdd({
      collapseKey: 'trackViewer.trackInfo',
      message: infoMessage,
      cancelType: [at.CLEAR_MAP, at.TRACK_VIEWER_SET_TRACK_DATA],
      style: 'info',
    }));

    done();
  },
});
