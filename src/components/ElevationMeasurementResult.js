import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { elevationMeasurementSetPoint, elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import RichMarker from 'fm3/components/RichMarker';
import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

const nf1 = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

class ElevationMeasurementResult extends React.Component {
  static propTypes = {
    onPointSet: PropTypes.func.isRequired,
    onElevationClear: PropTypes.func.isRequired,
    point: FmPropTypes.point,
    elevation: PropTypes.number,
  }

  handleDragStart = () => {
    this.props.onElevationClear(null);
  }

  handleDragEnd = (event) => {
    const { lat, lng: lon } = event.target.getLatLng();
    this.props.onPointSet({ lat, lon });
  }

  render() {
    const { point, elevation } = this.props;

    return point && (
      <RichMarker
        autoOpenPopup
        position={L.latLng(point.lat, point.lon)}
        // onDragstart={this.handleDragStart}
        onDragend={this.handleDragEnd}
        onDrag={this.handleDrag}
        draggable
      >
        <Popup closeButton={false} autoClose={false} autoPan={false}>
          <React.Fragment>
            {['D', 'DM', 'DMS'].map(format => <div key={format}>{formatGpsCoord(point.lat, 'SN', format)} {formatGpsCoord(point.lon, 'WE', format)}</div>)}
            {typeof elevation === 'number' && <div>Nadmorská výška: {nf1.format(elevation)} m. n. m.</div>}
          </React.Fragment>
        </Popup>
      </RichMarker>
    );
  }
}

export default connect(
  state => ({
    elevation: state.elevationMeasurement.elevation,
    point: state.elevationMeasurement.point,
  }),
  dispatch => ({
    onPointSet(point) {
      dispatch(elevationMeasurementSetPoint(point));
    },
    onElevationClear() {
      dispatch(elevationMeasurementSetElevation(null));
    },
  }),
)(ElevationMeasurementResult);
