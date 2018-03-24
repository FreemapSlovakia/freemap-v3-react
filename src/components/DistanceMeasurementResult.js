import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline } from 'react-leaflet';

import { distanceMeasurementAddPoint, distanceMeasurementUpdatePoint, distanceMeasurementRemovePoint } from 'fm3/actions/distanceMeasurementActions';

import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';

import { distance } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

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
    active: PropTypes.bool,
    language: PropTypes.string,
  };

  state = {
  };

  componentWillMount() {
    mapEventEmitter.on('mouseMove', this.handleMouseMove);
    mapEventEmitter.on('mouseOut', this.handleMouseOut);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mouseMove', this.handleMouseMove);
    mapEventEmitter.removeListener('mouseOut', this.handleMouseOut);
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

  handleMouseMove = (lat, lon, originalEvent) => {
    if (this.props.active && originalEvent.target.classList.contains('leaflet-container')) {
      this.setState({ lat, lon });
    } else {
      this.setState({ lat: undefined, lon: undefined });
    }
  }

  handleMouseOut = () => {
    this.setState({ lat: undefined, lon: undefined });
  }

  render() {
    let prev = null;
    let dist = 0;

    const { points, language } = this.props;

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

    const nf = Intl.NumberFormat(language, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

    return (
      <React.Fragment>
        {ps.length > 2 &&
          <Polyline
            weight={4}
            interactive={false}
            positions={ps.filter((_, i) => i % 2 === 0).map(({ lat, lon }) => [lat, lon])}
          />
        }
        {!!(ps.length && this.state.lat) &&
          <Polyline
            weight={4}
            interactive={false}
            dashArray="6,8"
            positions={[[ps[ps.length - 1].lat, ps[ps.length - 1].lon], [this.state.lat, this.state.lon]]}
          />
        }
        {
          ps.map((p, i) => {
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
                key={`95Lp1ukO7F-${p.id}`}
                draggable
                position={L.latLng(p.lat, p.lon)}
                {...props}
              >
                {i % 2 === 0 &&
                  <Tooltip key={`${p.id}-${ps.length}`} className="compact" offset={[-4, 0]} direction="right" permanent={i === ps.length - 1}>
                    <span>{nf.format(dist / 1000)} km</span>
                  </Tooltip>
                }
              </Marker>
            );
          })
        }

        <ElevationChartActivePoint />
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    points: state.distanceMeasurement.points,
    active: state.main.tool === 'measure-dist',
    language: state.l10n.language,
  }),
  dispatch => ({
    onPointAdd(point, position) {
      dispatch(distanceMeasurementAddPoint(point, position));
    },
    onPointUpdate(i, point) {
      dispatch(distanceMeasurementUpdatePoint(i, point));
    },
    onPointRemove(id) {
      dispatch(distanceMeasurementRemovePoint(id));
    },
  }),
)(DistanceMeasurementResult);
