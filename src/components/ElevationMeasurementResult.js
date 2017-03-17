import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { connect } from 'react-redux';
import { setPoint, setElevation } from 'fm3/actions/elevationMeasurementActions';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmmiter from 'fm3/mapEventEmmiter';

const nf1 = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

class ElevationMeasurementResult extends React.Component {

  static propTypes = {
    onPointSet: React.PropTypes.func.isRequired,
    onClearElevation: React.PropTypes.func.isRequired,
    point: React.PropTypes.object,
    elevation: React.PropTypes.number
  }

  state = {};

  componentWillMount() {
    mapEventEmmiter.on('mapClick', this.handlePoiAdded);
  }

  componentWillUnmount() {
    mapEventEmmiter.removeListener('mapClick', this.handlePoiAdded);
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
      <Marker
        position={L.latLng(p.lat, p.lon)}
        onDragstart={b(this.handleDragStart)}
        onDragend={b(this.handleDragEnd)}
        onDrag={b(this.handleDrag)}
        draggable
      >

        <Tooltip direction="right" permanent>
          <span>
            <div>{formatGpsCoord(p.lat, 'SN', 'D')} {formatGpsCoord(p.lon, 'WE', 'D')}</div>
            <div>{formatGpsCoord(p.lat, 'SN', 'DM')} {formatGpsCoord(p.lon, 'WE', 'DM')}</div>
            <div>{formatGpsCoord(p.lat, 'SN', 'DMS')} {formatGpsCoord(p.lon, 'WE', 'DMS')}</div>
            {typeof elevation === 'number' && <div>Nadmorská výška: {nf1.format(elevation)} m. n. m.</div>}
          </span>
        </Tooltip>
      </Marker>
    );
  }

}

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
  }
)(ElevationMeasurementResult);
