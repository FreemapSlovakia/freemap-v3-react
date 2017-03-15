import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { connect } from 'react-redux';
import { setPoint, setElevation } from 'fm3/actions/elevationMeasurementActions';
import { formatGpsCoord } from 'fm3/geoutils';

class ElevationMeasurement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  handlePointAdded({ lat, lon }) {
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
            <div>Zemepisná šírka: {formatGpsCoord(p.lat, 'SN')}</div>
            <div>Zemepisná dĺžka: {formatGpsCoord(p.lon, 'WE')}</div>
            {typeof elevation === 'number' && <div>Nadmorská výška: {elevation} m. n. m.</div>}
          </span>
        </Tooltip>
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
