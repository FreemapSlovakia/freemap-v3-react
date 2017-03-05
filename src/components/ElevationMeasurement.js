import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { connect } from 'react-redux';
import { setPoint, setElevation } from 'fm3/actions/elevationMeasurementActions';

class ElevationMeasurement extends React.Component {

  handlePointAdded({ lat, lon }) {
    this.props.onPointSet({ lat, lon });
  }

  handleDragStart() {
    this.props.onClearElevation(null);
  }

  handleDragEnd(event) {
    const { lat, lng: lon } = event.target._latlng;
    this.props.onPointSet({ lat, lon });
  }

  render() {
    const { point, elevation } = this.props;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return point && (
      <Marker
          position={L.latLng(point.lat, point.lon)}
          onDragstart={b(this.handleDragStart)}
          onDragend={b(this.handleDragEnd)}
          draggable>
        {typeof elevation === 'number' && <Tooltip direction="right" permanent><span>{elevation} m</span></Tooltip>}
      </Marker>
    );
  }

}

ElevationMeasurement.propTypes = {
  onPointSet: React.PropTypes.func.isRequired,
  onClearElevation: React.PropTypes.func.isRequired,
  point: React.PropTypes.object,
  elevation: React.PropTypes.number
};

export default connect(
  function (state) {
    return {
      elevation: state.elevationMeasurement.elevation,
      point: state.elevationMeasurement.point
    };
  },
  function (dispatch) {
    return {
      onPointSet(point) {
        dispatch(setPoint(point));
      },
      onClearElevation() {
        dispatch(setElevation(null));
      }
    };
  },
  null,
  { withRef: true }
)(ElevationMeasurement);
