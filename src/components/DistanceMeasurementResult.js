import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';

import { setMouseCursorToCrosshair, resetMouseCursor } from 'fm3/actions/mapActions';
import { distanceMeasurementAddPoint, distanceMeasurementUpdatePoint, distanceMeasurementRemovePoint } from 'fm3/actions/distanceMeasurementActions';
import { distance } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import toastEmitter from 'fm3/emitters/toastEmitter';
import * as FmPropTypes from 'fm3/propTypes';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

class DistanceMeasurementResult extends React.Component {

  static propTypes = {
    points: FmPropTypes.points.isRequired,
    onPointAdd: PropTypes.func.isRequired,
    onPointUpdate: PropTypes.func.isRequired,
    onPointRemove: PropTypes.func.isRequired,
    onSetMouseCursorToCrosshair: PropTypes.func.isRequired,
    onResetMouseCursor: PropTypes.func.isRequired,
  };

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdded);
  }

  componentDidMount() {
    this.props.onSetMouseCursorToCrosshair();
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdded);
    this.props.onResetMouseCursor();
  }

  futurePoints = () => {
    const fps = [];
    if (this.props.points.length > 1) {
      for (let i = 0; i < this.props.points.length - 1; i += 1) {
        const p1 = this.props.points[i];
        const p2 = this.props.points[i + 1];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;
        fps.push({ lat, lon });
      }
    }

    return fps;
  }

  handlePoiAdded = (lat, lon, position) => {
    const pos = position || (this.props.points.length);
    this.props.onPointAdd({ lat, lon }, pos);
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.props.onPointUpdate(i, { lat, lon });
  }

  pointClicked(index) {
    const line1 = 'Odstrániť bod?';
    const line2 = [
      <Button key="yes" onClick={() => this.props.onPointRemove(index)}>
        <span style={{ fontWeight: 700 }}>Áno</span>
      </Button>,
      ' ',
      <Button key="no">Nie</Button>,
    ];
    toastEmitter.emit('showToast', 'info', line1, line2);
  }

  render() {
    const { points } = this.props;

    let prev = null;
    let dist = 0;
    const Icon = L.divIcon;
    const circularIcon = new Icon({ // CircleMarker is not draggable
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="circular-leaflet-marker-icon"></div>',
    });

    return (
      <div>
        {points.map((p, i) => {
          if (prev) {
            dist += distance(p.lat, p.lon, prev.lat, prev.lon);
          }
          prev = p;

          return (
            <Marker key={i} position={L.latLng(p.lat, p.lon)} draggable onDrag={e => this.handleMeasureMarkerDrag(i, e)} onClick={() => this.pointClicked(i)}>
              <Tooltip className="compact" offset={[-4, 0]} direction="right" permanent><span>{nf.format(dist / 1000)} km</span></Tooltip>
            </Marker>
          );
        })}

        {points.length > 1 && <Polyline positions={points.map(({ lat, lon }) => [lat, lon])} />}
        {this.futurePoints().map((p, i) =>
          <Marker
            key={String(i)}
            draggable
            icon={circularIcon}
            onDragend={e => this.handlePoiAdded(e.target.getLatLng().lat, e.target.getLatLng().lng, i + 1)}
            position={L.latLng(p.lat, p.lon)}
          />,
        )}
      </div>
    );
  }

}

export default connect(
  state => ({
    points: state.distanceMeasurement.points,
  }),
  dispatch => ({
    onPointAdd(point, position) {
      dispatch(distanceMeasurementAddPoint(point, position));
    },
    onPointUpdate(i, point) {
      dispatch(distanceMeasurementUpdatePoint(i, point));
    },
    onPointRemove(i) {
      dispatch(distanceMeasurementRemovePoint(i));
    },
    onSetMouseCursorToCrosshair() {
      dispatch(setMouseCursorToCrosshair());
    },
    onResetMouseCursor() {
      dispatch(resetMouseCursor());
    },
  }),
)(DistanceMeasurementResult);
