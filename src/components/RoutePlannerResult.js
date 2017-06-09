import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turfLineDistance from '@turf/line-distance';
import turfAlong from '@turf/along';
import { Polyline, Tooltip, Marker } from 'react-leaflet';

import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import ElevationChartActivePoint from 'fm3/components/ElevationChartActivePoint';
import { routePlannerSetStart, routePlannerSetFinish, routePlannerAddMidpoint, routePlannerSetMidpoint, routePlannerRemoveMidpoint } from 'fm3/actions/routePlannerActions';
import { setMouseCursorToCrosshair, resetMouseCursor } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import { sliceToGeojsonPoylines } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';

class RoutePlannerResult extends React.Component {

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdd);
    this.props.onOpen();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickMode) {
      this.props.onOpen(); // TODO use different callback name
    } else {
      this.props.onClose(); // TODO use different callback name
    }
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdd);
    this.props.onClose();
  }

  handlePoiAdd = (lat, lon) => {
    if (this.props.pickMode === 'start') {
      this.props.onStartSet({ lat, lon });
    } else if (this.props.pickMode === 'finish') {
      this.props.onFinishSet({ lat, lon });
    }
  }

  handleRouteMarkerDragend(movedPointType, position, event) {
    const { lat, lng: lon } = event.target.getLatLng();

    switch (movedPointType) {
      case 'start':
        this.props.onStartSet({ lat, lon });
        break;
      case 'finish':
        this.props.onFinishSet({ lat, lon });
        break;
      case 'midpoint':
        this.props.onMidpointSet(position, { lat, lon });
        break;
      default:
        throw new Error('unknown pointType');
    }
  }

  midpointClicked(position) {
    this.props.onRemoveMidpoint(position);
  }

  futureMidpointsAndDistances() {
    const { start, finish, midpoints, shapePoints } = this.props;
    const futureMidpoints = [];
    const midpointDistancesFromStart = [];
    if ((start && finish && shapePoints)) {
      const splitPoints = [start, ...midpoints, finish];
      const routeSlices = sliceToGeojsonPoylines(shapePoints, splitPoints);
      let distanceFromStart = 0;

      routeSlices.forEach((routeSlice) => {
        const length = turfLineDistance(routeSlice);
        distanceFromStart += length;
        const pointInMiddleOfSlice = turfAlong(routeSlice, length / 2);
        const lonlat = pointInMiddleOfSlice.geometry.coordinates;
        futureMidpoints.push({ lat: lonlat[1], lon: lonlat[0] });
        midpointDistancesFromStart.push(distanceFromStart);
      });
    }

    return { futureMidpoints, midpointDistancesFromStart };
  }

  render() {
    const { start, midpoints, finish, shapePoints, time, distance, itinerary, itineraryIsVisible } = this.props;
    const Icon = L.divIcon;
    const circularIcon = new Icon({ // CircleMarker is not draggable
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div class="circular-leaflet-marker-icon"></div>',
    });
    const { futureMidpoints, midpointDistancesFromStart } = this.futureMidpointsAndDistances();

    return (
      <div>
        {start &&
          <MarkerWithInnerLabel
            faIcon="play"
            zIndexOffset={10}
            faIconLeftPadding="2px"
            color="#409a40"
            draggable
            onDragend={e => this.handleRouteMarkerDragend('start', null, e)}
            position={L.latLng(start.lat, start.lon)}
          />
        }

        {midpoints.map(({ lat, lon }, i) => (
          <MarkerWithInnerLabel
            draggable
            onDragend={e => this.handleRouteMarkerDragend('midpoint', i, e)}
            onClick={() => this.midpointClicked(i)}
            key={i}
            zIndexOffset={9}
            label={i + 1}
            position={L.latLng(lat, lon)}
          >
            {!itineraryIsVisible &&
              <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
                <span>{midpointDistancesFromStart[i].toFixed(1)}km</span>
              </Tooltip>}
          </MarkerWithInnerLabel>
        ))}

        {finish &&
          <MarkerWithInnerLabel
            faIcon="stop"
            color="#d9534f"
            zIndexOffset={10}
            draggable
            onDragend={e => this.handleRouteMarkerDragend('finish', null, e)}
            position={L.latLng(finish.lat, finish.lon)}
          >
            {distance !== null && time !== null &&
              <Tooltip offset={new L.Point(9, -25)} direction="right" permanent>
                <span>{distance}km, {Math.floor(time / 60)}h {time % 60}m</span>
              </Tooltip>
            }
          </MarkerWithInnerLabel>
        }

        {futureMidpoints.map((p, i) => (
          <Marker
            key={i}
            draggable
            icon={circularIcon}
            onDragend={e => this.props.onAddMidpoint(i, {
              lat: e.target.getLatLng().lat,
              lon: e.target.getLatLng().lng,
            })}
            position={L.latLng(p.lat, p.lon)}
          />
        ))}

        {itineraryIsVisible && itinerary.map(({ desc, lat, lon, km }, i) => (
          <MarkerWithInnerLabel
            faIcon="info"
            color="grey"
            key={i}
            position={L.latLng(lat, lon)}
          >
            <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
              <span>{desc} ({km}km)</span>
            </Tooltip>
          </MarkerWithInnerLabel>
          ),
        )}

        {shapePoints &&
          <Polyline
            positions={shapePoints}
            weight="8"
            opacity="0.8"
            interactive={false}
          />
        }

        <ElevationChartActivePoint />
      </div>
    );
  }
}

RoutePlannerResult.propTypes = {
  start: FmPropTypes.point,
  finish: FmPropTypes.point,
  midpoints: FmPropTypes.points,
  shapePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  time: PropTypes.number,
  distance: PropTypes.number,
  itinerary: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    desc: PropTypes.string.isRequired,
    km: PropTypes.number.isRequired,
  })),
  itineraryIsVisible: PropTypes.bool.isRequired,
  onStartSet: PropTypes.func.isRequired,
  onFinishSet: PropTypes.func.isRequired,
  onMidpointSet: PropTypes.func.isRequired,
  onAddMidpoint: PropTypes.func.isRequired,
  onRemoveMidpoint: PropTypes.func.isRequired,
  pickMode: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    pickMode: state.routePlanner.pickMode,
    start: state.routePlanner.start,
    finish: state.routePlanner.finish,
    midpoints: state.routePlanner.midpoints,
    shapePoints: state.routePlanner.shapePoints,
    time: state.routePlanner.time,
    distance: state.routePlanner.distance,
    itinerary: state.routePlanner.itinerary,
    itineraryIsVisible: state.routePlanner.itineraryIsVisible,
  }),
  dispatch => ({
    onStartSet(start) {
      dispatch(routePlannerSetStart(start));
    },
    onFinishSet(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onAddMidpoint(position, midpoint) {
      dispatch(routePlannerAddMidpoint(midpoint, position));
    },
    onMidpointSet(position, midpoint) {
      dispatch(routePlannerSetMidpoint(position, midpoint));
    },
    onRemoveMidpoint(position) {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.removeMidpoint',
        message: 'Odstrániť zastávku?',
        style: 'warning',
        cancelType: 'SET_TOOL',
        actions: [
          { name: 'Áno', action: routePlannerRemoveMidpoint(position), style: 'danger' },
          { name: 'Nie' },
        ],
      }));
    },
    onOpen() {
      dispatch(setMouseCursorToCrosshair());
    },
    onClose() {
      dispatch(resetMouseCursor());
    },
  }),
)(RoutePlannerResult);
