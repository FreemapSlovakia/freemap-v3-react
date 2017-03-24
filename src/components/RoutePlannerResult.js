import React from 'react';
import { connect } from 'react-redux';
import { Polyline, Tooltip } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';
import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { routePlannerSetStart, routePlannerSetFinish, routePlannerAddMidpoint, routePlannerSetMidpoint, routePlannerRemoveMidpoint } from 'fm3/actions/routePlannerActions';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

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
    } // TODO default - log error
  }

  handleRouteMarkerDragend(movedPointType, position, event) {
    const { lat, lng: lon } = event.target._latlng;

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
    } // TODO default - log error
  }

  midpointClicked(position) {
    const line1 = 'Odstrániť zastávku?';
    const line2 = [
      <Button key="yes" onClick={() => this.props.onRemoveMidpoint(position)}>
          <span style={{ fontWeight:700 }}>Áno</span>
      </Button>,
      ' ',
      <Button key="no">Nie</Button>
    ];
    this.props.onShowToast('info', line1, line2);
  }

  render() {
    const { start, midpoints, finish, shapePoints, time, distance } = this.props;
    return (
      <div>
        {start &&
          <MarkerWithInnerLabel
            faIcon="play"
            faIconLeftPadding="2px"
            color="#409a40"
            draggable
            onDragend={(e) => this.handleRouteMarkerDragend('start', null, e)}
            position={L.latLng(start.lat, start.lon)}
          />
        }

        {midpoints.map(({ lat, lon }, i) => (
            <MarkerWithInnerLabel
              draggable
              onDragend={(e) => this.handleRouteMarkerDragend('midpoint', i, e)}
              onClick={() => this.midpointClicked(i)}
              key={i}
              label={i+1}
              position={L.latLng(lat, lon)}>
            </MarkerWithInnerLabel>
          )
        )}

        {finish &&
          <MarkerWithInnerLabel
            faIcon="stop"
            color="#d9534f"
            draggable
            onDragend={(e) => this.handleRouteMarkerDragend('finish', null, e)}
            position={L.latLng(finish.lat, finish.lon)}
          >

            {distance !== null && time !== null &&
              <Tooltip offset={new L.Point(14, -25)} direction="right" permanent>
                <span>{distance}, {time}</span>
              </Tooltip>
            }
          </MarkerWithInnerLabel>
        }
        {shapePoints && <Polyline positions={shapePoints} weight="8" opacity="0.8" interactive={false}/>}
      </div>
    );
  }
}

RoutePlannerResult.propTypes = {
  start: React.PropTypes.object,
  finish: React.PropTypes.object,
  midpoints: React.PropTypes.array,
  shapePoints: React.PropTypes.array,
  time: React.PropTypes.string,
  distance: React.PropTypes.string,
  onSetStart: React.PropTypes.func.isRequired,
  onSetFinish: React.PropTypes.func.isRequired,
  onSetMidpoint: React.PropTypes.func.isRequired,
  onAddMidpoint: React.PropTypes.func.isRequired,
  onRemoveMidpoint: React.PropTypes.func.isRequired,
  pickMode: React.PropTypes.string.isRequired,
  onShowToast: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      pickMode: state.routePlanner.pickMode,
      start: state.routePlanner.start,
      finish: state.routePlanner.finish,
      midpoints: state.routePlanner.midpoints,
      shapePoints: state.routePlanner.shapePoints,
      time: state.routePlanner.time,
      distance: state.routePlanner.distance
    };
  },
  function (dispatch) {
    return {
      onSetStart: function(start) {
        dispatch(routePlannerSetStart(start));
      },
      onSetFinish: function(finish) {
        dispatch(routePlannerSetFinish(finish));
      },
      onAddMidpoint: function(midpoint) {
        const position = 0;
        dispatch(routePlannerAddMidpoint(midpoint, position));
      },
      onSetMidpoint: function(position, midpoint) {
        dispatch(routePlannerSetMidpoint(position, midpoint));
      },
      onRemoveMidpoint: function(position) {
        dispatch(routePlannerRemoveMidpoint(position));
      }
    };
  }
)(RoutePlannerResult);
