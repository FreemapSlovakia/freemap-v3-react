import React from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';

import { measurementAddPoint, measurementUpdatePoint } from 'fm3/actions/measurementActions';
import { distance } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

class DistanceMeasurementResult extends React.Component {

  static propTypes = {
    points: FmPropTypes.points.isRequired,
    onPointAdd: React.PropTypes.func.isRequired,
    onPointUpdate: React.PropTypes.func.isRequired,
  };

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdded);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdded);
  }

  handlePoiAdded = (lat, lon) => {
    this.props.onPointAdd({ lat, lon });
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.props.onPointUpdate(i, { lat, lon });
  }

  render() {
    const { points } = this.props;

    let prev = null;
    let dist = 0;

    return (
      <div>
        {points.map((p, i) => {
          if (prev) {
            dist += distance(p.lat, p.lon, prev.lat, prev.lon);
          }
          prev = p;

          return (
            <Marker key={i} position={L.latLng(p.lat, p.lon)} draggable onDrag={e => this.handleMeasureMarkerDrag(i, e)}>
              <Tooltip className="compact" offset={[-4, 0]} direction="right" permanent><span>{nf.format(dist / 1000)} km</span></Tooltip>
            </Marker>
          );
        })}

        {points.length > 1 && <Polyline positions={points.map(({ lat, lon }) => [lat, lon])} />}
      </div>
    );
  }

}

export default connect(
  state => ({
    points: state.measurement.points,
  }),
  dispatch => ({
    onPointAdd(point) {
      dispatch(measurementAddPoint(point));
    },
    onPointUpdate(i, point) {
      dispatch(measurementUpdatePoint(i, point));
    },
  }),
)(DistanceMeasurementResult);
