import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';

import { distanceMeasurementAddPoint, distanceMeasurementUpdatePoint, distanceMeasurementRemovePoint } from 'fm3/actions/distanceMeasurementActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';

import { distance } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

// const defaultIcon = new L.Icon.Default();

const circularIcon = new L.divIcon({ // CircleMarker is not draggable
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: '<div class="circular-leaflet-marker-icon"></div>',
});

class DistanceMeasurementResult extends React.Component {
  static propTypes = {
    points: FmPropTypes.points.isRequired,
    onPointAdd: PropTypes.func.isRequired,
    onPointUpdate: PropTypes.func.isRequired,
    onPointRemove: PropTypes.func.isRequired,
  };

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdd);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdd);
  }

  handlePoiAdd = (lat, lon, position, id0) => {
    const { points } = this.props;
    const pos = position ? Math.ceil(position / 2) : points.length;
    let id;
    if (id0) {
      id = id0;
    } else if (pos === 0) {
      id = points.length ? points[pos].id - 1 : 0;
    } else if (pos === points.length) {
      id = points[pos - 1].id + 1;
    } else {
      id = (points[pos - 1].id + points[pos].id) / 2;
    }
    this.props.onPointAdd({ lat, lon, id }, pos);
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }, id) {
    this.props.onPointUpdate(i, { lat, lon, id });
  }

  handleMarkerClick(id) {
    this.props.onPointRemove(id);
  }

  render() {
    let prev = null;
    let dist = 0;

    const { points } = this.props;
    const ps = [];
    for (let i = 0; i < points.length; i += 1) {
      ps.push(points[i]);
      if (i < points.length - 1) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;
        ps.push({ lat, lon, id: (p1.id + p2.id) / 2 });
      }
    }

    return (
      <div>
        {ps.length > 2 && <Polyline interactive={false} positions={ps.filter((_, i) => i % 2 === 0).map(({ lat, lon }) => [lat, lon])} />}

        {ps.map((p, i) => {
          if (i % 2 === 0) {
            if (prev) {
              dist += distance(p.lat, p.lon, prev.lat, prev.lon);
            }
            prev = p;
          }

          const props = i % 2 ? {
            icon: circularIcon,
            opacity: 0.5,
            onDragstart: e => this.handlePoiAdd(e.target.getLatLng().lat, e.target.getLatLng().lng, i, p.id),
          } : {
            // icon: defaultIcon, // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
            icon: circularIcon,
            opacity: 1,
            onDrag: e => this.handleMeasureMarkerDrag(i / 2, e, p.id),
            onClick: () => this.handleMarkerClick(p.id),
          };

          return (
            <Marker
              key={p.id}
              draggable
              position={L.latLng(p.lat, p.lon)}
              {...props}
            >
              {i % 2 === 0 &&
                <Tooltip className="compact" offset={[-4, 0]} direction="right" permanent>
                  <span>{nf.format(dist / 1000)} km</span>
                </Tooltip>
              }
            </Marker>
          );
        })}
        <ElevationChartActivePoint />
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
    onPointRemove(id) {
      dispatch(toastsAdd({
        collapseKey: 'distanceMeasurement.removePoint',
        message: 'Odstrániť bod?',
        style: 'warning',
        cancelType: 'SET_TOOL',
        actions: [
          { name: 'Áno', action: distanceMeasurementRemovePoint(id), style: 'danger' },
          { name: 'Nie' },
        ],
      }));
    },
  }),
)(DistanceMeasurementResult);
