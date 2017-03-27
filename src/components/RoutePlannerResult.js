import React from 'react';
import { connect } from 'react-redux';
import { Polyline, Tooltip } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { routePlannerSetStart, routePlannerSetFinish, routePlannerAddMidpoint, routePlannerSetMidpoint, routePlannerRemoveMidpoint } from 'fm3/actions/routePlannerActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';

class RoutePlannerResult extends React.Component {

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdded);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdded);
  }

  handlePoiAdded = (lat, lon) => {
    switch (this.props.pickMode) {
      case 'start':
        this.props.onSetStart({ lat, lon });
        break;
      case 'finish':
        this.props.onSetFinish({ lat, lon });
        break;
      case 'midpoint':
        this.props.onAddMidpoint({ lat, lon });
        break;
      default:
        throw new Error('unknown pickMode');
    }
  }

  handleRouteMarkerDragend(movedPointType, position, event) {
    const { lat, lng: lon } = event.target.getLatLng();

    switch (movedPointType) {
      case 'start':
        this.props.onSetStart({ lat, lon });
        break;
      case 'finish':
        this.props.onSetFinish({ lat, lon });
        break;
      case 'midpoint':
        this.props.onSetMidpoint(position, { lat, lon });
        break;
      default:
        throw new Error('unknown pointType');
    }
  }

  midpointClicked(position) {
    const line1 = 'Odstrániť zastávku?';
    const line2 = [
      <Button key="yes" onClick={() => this.props.onRemoveMidpoint(position)}>
        <span style={{ fontWeight: 700 }}>Áno</span>
      </Button>,
      ' ',
      <Button key="no">Nie</Button>,
    ];
    this.props.onShowToast('info', line1, line2);
  }

  render() {
    const { start, midpoints, finish, shapePoints, time, distance, itinerary, itineraryIsVisible } = this.props;

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
            key={String(i)}
            zIndexOffset={9}
            label={i + 1}
            position={L.latLng(lat, lon)}
          />
          ),
        )}

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

        {itineraryIsVisible && itinerary.map(({ desc, lat, lon, km }, i) => (
          <MarkerWithInnerLabel
            faIcon="info"
            color="grey"
            key={String(i)}
            position={L.latLng(lat, lon)}
          >
            <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
              <span>{desc} ({km}km)</span>
            </Tooltip>
          </MarkerWithInnerLabel>
          ),
        )}

        {shapePoints && <Polyline positions={shapePoints} weight="8" opacity="0.8" interactive={false} />}
      </div>
    );
  }
}

RoutePlannerResult.propTypes = {
  start: FmPropTypes.point,
  finish: FmPropTypes.point,
  midpoints: FmPropTypes.points,
  shapePoints: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)),
  time: React.PropTypes.number,
  distance: React.PropTypes.number,
  itinerary: React.PropTypes.arrayOf(React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    desc: React.PropTypes.string.isRequired,
    km: React.PropTypes.number.isRequired,
  })),
  itineraryIsVisible: React.PropTypes.bool.isRequired,
  onSetStart: React.PropTypes.func.isRequired,
  onSetFinish: React.PropTypes.func.isRequired,
  onSetMidpoint: React.PropTypes.func.isRequired,
  onAddMidpoint: React.PropTypes.func.isRequired,
  onRemoveMidpoint: React.PropTypes.func.isRequired,
  pickMode: React.PropTypes.string.isRequired,
  onShowToast: React.PropTypes.func.isRequired,
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
    onSetStart(start) {
      dispatch(routePlannerSetStart(start));
    },
    onSetFinish(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onAddMidpoint(midpoint) {
      const position = 0;
      dispatch(routePlannerAddMidpoint(midpoint, position));
    },
    onSetMidpoint(position, midpoint) {
      dispatch(routePlannerSetMidpoint(position, midpoint));
    },
    onRemoveMidpoint(position) {
      dispatch(routePlannerRemoveMidpoint(position));
    },
  }),
)(RoutePlannerResult);
