import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import PropTypes from 'prop-types';

function InfoPoint({ lat, lon, label }) {
  return (
    lat && <MarkerWithInnerLabel
      faIcon="info"
      faIconLeftPadding="2px"
      interactive={false}
      position={L.latLng(lat, lon)}
    >
      { label && <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
        <span>
          {label}
        </span>
      </Tooltip> }
    </MarkerWithInnerLabel>
  );
}

InfoPoint.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  label: PropTypes.string,
};

export default connect(
  state => ({
    lat: state.infoPoint.lat,
    lon: state.infoPoint.lon,
    label: state.infoPoint.label,
  }),
)(InfoPoint);
