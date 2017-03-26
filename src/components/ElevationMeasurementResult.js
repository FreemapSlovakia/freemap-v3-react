import React from 'react';
import { Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { elevationMeasurementSetPoint, elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import MarkerWithAutoOpeningPopup from 'fm3/components/leaflet/MarkerWithAutoOpeningPopup';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

const nf1 = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

class ElevationMeasurementResult extends React.Component {

  static propTypes = {
    onPointSet: React.PropTypes.func.isRequired,
    onClearElevation: React.PropTypes.func.isRequired,
    point: React.PropTypes.object,
    elevation: React.PropTypes.number,
  }

  state = {};

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdded);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdded);
  }

  handlePoiAdded = (lat, lon) => {
    this.setState({ point: undefined });
    this.props.onPointSet({ lat, lon });
  }

  handleDragStart() {
    this.props.onClearElevation(null);
  }

  handleDragEnd(event) {
    const { lat, lng: lon } = event.target._latlng;
    this.setState({ point: undefined });
    this.props.onPointSet({ lat, lon });
  }

  handleDrag(event) {
    const { lat, lng: lon } = event.target._latlng;
    this.setState({ point: { lat, lon } });
  }

  render() {
    const { point, elevation } = this.props;
    const { point: tmpPoint } = this.state;
    const b = (fn, ...args) => fn.bind(this, ...args);

    const p = tmpPoint || point;

    return point && (
      <MarkerWithAutoOpeningPopup
        position={L.latLng(p.lat, p.lon)}
        onDragstart={b(this.handleDragStart)}
        onDragend={b(this.handleDragEnd)}
        onDrag={b(this.handleDrag)}
        draggable
      >

        <Popup closeButton={false} autoClose={false} autoPan={false}>
          <span>
            {['D', 'DM', 'DMS'].map(format => <div key={format}>{formatGpsCoord(p.lat, 'SN', format)} {formatGpsCoord(p.lon, 'WE', format)}</div>)}
            {typeof elevation === 'number' && <div>Nadmorská výška: {nf1.format(elevation)} m. n. m.</div>}
          </span>
        </Popup>
      </MarkerWithAutoOpeningPopup>
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
    onClearElevation() {
      dispatch(elevationMeasurementSetElevation(null));
    },
  }),
)(ElevationMeasurementResult);
