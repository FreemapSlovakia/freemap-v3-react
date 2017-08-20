import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';

function LocationResult({ gpsLocation }) {
  return gpsLocation ? (
    <div>
      <Circle center={L.latLng(gpsLocation.lat, gpsLocation.lon)} radius={gpsLocation.accuracy / 2} />
      <MarkerWithInnerLabel position={L.latLng(gpsLocation.lat, gpsLocation.lon)} />
    </div>
  ) : null;
}

LocationResult.propTypes = {
  gpsLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
  }),
};

export default connect(
  state => ({
    gpsLocation: state.main.location,
  }),
)(LocationResult);
