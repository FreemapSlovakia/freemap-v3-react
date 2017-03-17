import React from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polygon } from 'react-leaflet';

import { addPoint, updatePoint } from 'fm3/actions/measurementActions';
import { area } from 'fm3/geoutils';
import mapEventEmmiter from 'fm3/mapEventEmmiter';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

class AreaMeasurementResult extends React.Component {

  static propTypes = {
    points: React.PropTypes.array,
    onPointAdd: React.PropTypes.func.isRequired,
    onPointUpdate: React.PropTypes.func.isRequired
  };

  componentWillMount() {
    mapEventEmmiter.on('mapClick', this.handlePoiAdded);
  }

  componentWillUnmount() {
    mapEventEmmiter.removeListener('mapClick', this.handlePoiAdded);
  }

  handlePoiAdded = (lat, lon) => {
    this.props.onPointAdd({ lat, lon });
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.props.onPointUpdate(i, { lat, lon });
  }

  render() {
    const { points } = this.props;
    const areaSize = points.length > 2 ? area(points) : NaN;

    return (
      <div>
        {points.map((p, i) =>
          <Marker key={i} position={L.latLng(p.lat, p.lon)} draggable onDrag={this.handleMeasureMarkerDrag.bind(this, i)}/>
        )}

        {points.length > 1 &&
          <Polygon positions={points.map(({ lat, lon }) => [ lat, lon ])}>
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
  function (state) {
    return {
      points: state.measurement.points
    };
  },
  function (dispatch) {
    return {
      onPointAdd(point) {
        dispatch(addPoint(point));
      },
      onPointUpdate(i, point) {
        dispatch(updatePoint(i, point));
      }
    };
  }
)(AreaMeasurementResult);
