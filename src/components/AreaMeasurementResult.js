import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polygon } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';

import { areaMeasurementAddPoint, areaMeasurementUpdatePoint, areaMeasurementRemovePoint } from 'fm3/actions/areaMeasurementActions';
import { setMouseCursorToCrosshair, resetMouseCursor } from 'fm3/actions/mapActions';
import { area } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import toastEmitter from 'fm3/emitters/toastEmitter';
import * as FmPropTypes from 'fm3/propTypes';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

class AreaMeasurementResult extends React.Component {

  static propTypes = {
    points: FmPropTypes.points,
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

  componentDidUpdate() {
    // XXX re-centering tooltip to polygon, see https://github.com/Leaflet/Leaflet/issues/5412
    if (this.polygon && this.tooltip) {
      this.polygon.leafletElement.unbindTooltip();
      this.polygon.leafletElement.bindTooltip(this.tooltip.leafletElement);
    }
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdded);
    this.props.onResetMouseCursor();
  }

  futurePoints = () => {
    const fps = [];
    if (this.props.points.length > 2) {
      for (let i = 0; i < this.props.points.length; i += 1) {
        const p1 = this.props.points[i];
        const isLast = i === this.props.points.length - 1;
        const p2 = isLast ? this.props.points[0] : this.props.points[i + 1];

        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;
        fps.push({ lat, lon });
      }
    }

    return fps;
  }

  handlePoiAdded = (lat, lon, position) => {
    const pos = position || 0;
    this.props.onPointAdd({ lat, lon }, pos);
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.props.onPointUpdate(i, { lat, lon });
  }

  pointClicked(position) {
    const line1 = 'Odstrániť bod?';
    const line2 = [
      <Button key="yes" onClick={() => this.props.onPointRemove(position)}>
        <span style={{ fontWeight: 700 }}>Áno</span>
      </Button>,
      ' ',
      <Button key="no">Nie</Button>,
    ];
    toastEmitter.emit('showToast', 'info', line1, line2);
  }

  render() {
    const { points } = this.props;

    const areaSize = points.length > 2 ? area(points) : NaN;

    const Icon = L.divIcon;
    const circularIcon = new Icon({ // CircleMarker is not draggable
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="circular-leaflet-marker-icon"></div>',
    });

    return (
      <div>
        {points.map((p, i) =>
          <Marker
            key={String(i)}
            position={L.latLng(p.lat, p.lon)}
            draggable
            onClick={() => this.pointClicked(i)}
            onDrag={e => this.handleMeasureMarkerDrag(i, e)}
          />,
        )}

        {points.length > 1 &&
          <Polygon positions={points.map(({ lat, lon }) => [lat, lon])} ref={(polygon) => { this.polygon = polygon; }}>
            {points.length > 2 &&
              <Tooltip direction="center" permanent ref={(tooltip) => { this.tooltip = tooltip; }}>
                <span>
                  <div>{nf.format(areaSize)} m<sup>2</sup></div>
                  <div>{nf.format(areaSize / 100)} a</div>
                  <div>{nf.format(areaSize / 10000)} ha</div>
                  <div>{nf.format(areaSize / 1000000)} km<sup>2</sup></div>
                </span>
              </Tooltip>
            }
          </Polygon>
        }

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
    points: state.areaMeasurement.points,
  }),
  dispatch => ({
    onPointAdd(coordinates, position) {
      dispatch(areaMeasurementAddPoint(coordinates, position));
    },
    onPointUpdate(i, coordinates) {
      dispatch(areaMeasurementUpdatePoint(i, coordinates));
    },
    onPointRemove(i) {
      dispatch(areaMeasurementRemovePoint(i));
    },
    onSetMouseCursorToCrosshair() {
      dispatch(setMouseCursorToCrosshair());
    },
    onResetMouseCursor() {
      dispatch(resetMouseCursor());
    },
  }),
)(AreaMeasurementResult);
