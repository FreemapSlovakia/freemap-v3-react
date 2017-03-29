import React from 'react';
import { connect } from 'react-redux';
import { Circle, Marker } from 'react-leaflet';

function LocationResult({ gpsLocation }) {
  return gpsLocation ? (
    <div>
      <Circle center={L.latLng(gpsLocation.lat, gpsLocation.lon)} radius={gpsLocation.accuracy / 2} />
      <Marker position={L.latLng(gpsLocation.lat, gpsLocation.lon)} />
    </div>
  ) : null;
}

LocationResult.propTypes = {
  gpsLocation: React.PropTypes.object,
};

export default connect(
  state => ({
    gpsLocation: state.main.location,
  }),
)(LocationResult);
