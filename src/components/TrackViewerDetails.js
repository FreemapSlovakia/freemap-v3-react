import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { smoothElevations, distance } from 'fm3/geoutils';
import injectL10n from 'fm3/l10nInjector';
import PropTypes from 'prop-types';
import * as FmPropTypes from 'fm3/propTypes';

function TrackViewerDetails({ startPoints, finishPoints, trackGeojson, eleSmoothingFactor, language, t }) {
  // const {
  //   trackViewer: { startPoints, finishPoints, trackGeojson, eleSmoothingFactor },
  //   l10n: { language },
  // } = getState().trackViewer;

  const oneDecimalDigitNumberFormat = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const noDecimalDigitsNumberFormat = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const timeFormat = new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' });

  const tableData = [];

  let startTime;
  let finishTime;

  if (startPoints.length) {
    [{ startTime }] = startPoints;
    if (startTime) {
      tableData.push(['startTime', timeFormat.format(new Date(startTime))]);
    }
  }
  if (finishPoints.length) {
    [{ finishTime }] = finishPoints;
    if (finishTime) {
      tableData.push(['finishTime', timeFormat.format(new Date(finishTime))]);
    }
  }

  let duration = 0;
  if (startTime && finishTime) {
    duration = (new Date(finishTime) - new Date(startTime)) / 1000;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - hours * 3600) / 60);
    tableData.push(['duration', t('trackViewer.details.durationValue', { h: hours, m: minutes })]);
  }

  if (finishPoints.length) {
    const [{ lengthInKm }] = finishPoints;
    tableData.push(['distance', `${oneDecimalDigitNumberFormat.format(lengthInKm)} km`]);

    if (duration) {
      const avgSpeed = lengthInKm / duration * 3600;
      tableData.push(['avgSpeed', `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`]);
    }
  }

  const firstRealFeature = trackGeojson.features[0];
  let minEle = Infinity;
  let maxEle = -Infinity;
  let uphillEleSum = 0;
  let downhillEleSum = 0;
  const smoothedLatLonEles = smoothElevations(firstRealFeature.geometry.coordinates, eleSmoothingFactor);
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
    tableData.push(['minEle', `${noDecimalDigitsNumberFormat.format(minEle)} ${t('general.masl')}`]);
  }
  if (maxEle !== -Infinity) {
    tableData.push(['maxEle', `${noDecimalDigitsNumberFormat.format(maxEle)} ${t('general.masl')}`]);
  }
  tableData.push(['uphill', `${noDecimalDigitsNumberFormat.format(uphillEleSum)} m`]);
  tableData.push(['downhill', `${noDecimalDigitsNumberFormat.format(downhillEleSum)} m`]);

  return (
    <dl className="trackInfo dl-horizontal">
      {
        tableData.map(([key, value]) => ([
          <dt key={`${key}-dt`}>{t(`trackViewer.details.${key}`)}:</dt>,
          <dd key={`${key}-dd`} className="infoValue">{value}</dd>,
        ]))
      }
    </dl>
  );
}

TrackViewerDetails.propTypes = {
  startPoints: PropTypes.arrayOf(FmPropTypes.startPoint.isRequired).isRequired,
  finishPoints: PropTypes.arrayOf(FmPropTypes.finishPoint.isRequired).isRequired,
  trackGeojson: PropTypes.shape({
    features: PropTypes.array,
  }),
  eleSmoothingFactor: PropTypes.number.isRequired,
  language: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      startPoints: state.trackViewer.startPoints,
      finishPoints: state.trackViewer.finishPoints,
      trackGeojson: state.trackViewer.trackGeojson,
      eleSmoothingFactor: state.main.eleSmoothingFactor,
      language: state.l10n.language,
    }),
  ),
)(TrackViewerDetails);
