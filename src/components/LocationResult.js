import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';
import RichMarker from 'fm3/components/RichMarker';

function LocationResult({ gpsLocation }) {
  return gpsLocation ? (
    <div>
      <Circle center={L.latLng(gpsLocation.lat, gpsLocation.lon)} radius={gpsLocation.accuracy / 2} />
      <RichMarker position={L.latLng(gpsLocation.lat, gpsLocation.lon)} />
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
