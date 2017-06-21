import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { infoPointChangePosition } from 'fm3/actions/infoPointActions';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import PropTypes from 'prop-types';

function InfoPoint({ lat, lon, label, inEditMode, onInfoPointChangePosition }) {
  return (
    lat && <MarkerWithInnerLabel
      faIcon="info"
      faIconLeftPadding="2px"
      draggable={inEditMode}
      onDragend={e => onInfoPointChangePosition(e.target.getLatLng().lat, e.target.getLatLng().lng)}
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
  inEditMode: PropTypes.bool.isRequired,
};

export default connect(
  state => ({
    lat: state.infoPoint.lat,
    lon: state.infoPoint.lon,
    label: state.infoPoint.label,
    inEditMode: state.infoPoint.inEditMode,
    onInfoPointChangePosition: PropTypes.func.isRequired,
  }),
  dispatch => ({
    onInfoPointChangePosition(lat, lon) {
      dispatch(infoPointChangePosition(lat, lon));
    },
  }),
)(InfoPoint);
