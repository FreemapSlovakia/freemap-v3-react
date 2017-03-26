import React from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polygon } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';

import { measurementAddPoint, measurementUpdatePoint, measurementRemovePoint } from 'fm3/actions/measurementActions';
import { area } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

class AreaMeasurementResult extends React.Component {

  static propTypes = {
    points: React.PropTypes.array,
    onPointAdd: React.PropTypes.func.isRequired,
    onPointUpdate: React.PropTypes.func.isRequired,
    onPointRemove: React.PropTypes.func.isRequired,
    onShowToast: React.PropTypes.func.isRequired,
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

  pointClicked(position) {
    const line1 = 'Odstrániť bod?';
    const line2 = [
      <Button key="yes" onClick={() => this.props.onPointRemove(position)}>
        <span style={{ fontWeight: 700 }}>Áno</span>
      </Button>,
      ' ',
      <Button key="no">Nie</Button>,
    ];
    this.props.onShowToast('info', line1, line2);
  }

  render() {
    const { points } = this.props;
    const areaSize = points.length > 2 ? area(points) : NaN;

    return (
      <div>
        {points.map((p, i) =>
          <Marker
            key={i}
            position={L.latLng(p.lat, p.lon)}
            draggable
            onClick={() => this.pointClicked(i)}
            onDrag={() => this.handleMeasureMarkerDrag(i)}
          />,
        )}

        {points.length > 1 &&
          <Polygon positions={points.map(({ lat, lon }) => [lat, lon])}>
            {points.length > 2 &&
              <Tooltip direction="center" permanent>
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
    onPointRemove(i) {
      dispatch(measurementRemovePoint(i));
    },
  }),
)(AreaMeasurementResult);
