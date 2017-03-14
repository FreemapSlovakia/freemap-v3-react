import React from 'react';
import { connect } from 'react-redux';
import { Marker, Polyline, Tooltip } from 'react-leaflet';
import Button from 'react-bootstrap/lib/Button';

import { setStart, setFinish, addMidpoint, setMidpoint, removeMidpoint } from 'fm3/actions/routePlannerActions';

function createIcon(color) {
  return new L.Icon({
    iconSize: [ 23, 37 ],
    iconAnchor: [ 12, 37 ],
    iconUrl: require(`../images/marker-icon-${color}.png`),
    iconRetinaUrl: require(`../images/marker-icon-2x-${color}.png`)
  });
}

const startIcon = createIcon('green');
const midPointIcon = createIcon('grey');
const finishIcon = createIcon('red');

class RoutePlannerResults extends React.Component {

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

  handlePointAdded({ lat, lon }) {
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

  midpointClicked(position) {
    const line1 = 'Odstrániť bod?';
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
          <Marker
            icon={startIcon}
            draggable
            onDragend={this.handleRouteMarkerDragend.bind(this, 'start', null)}
            position={L.latLng(start.lat, start.lon)}
          />
        }

        {midpoints.map(({ lat, lon }, i) => (
            <Marker
              icon={midPointIcon}
              draggable
              onClick={() => this.midpointClicked(i)}
              onDragend={this.handleRouteMarkerDragend.bind(this, 'midpoint', i)}
              key={i}
              position={L.latLng(lat, lon)}>
            </Marker>
          )
        )}

        {finish &&
          <Marker
            icon={finishIcon}
            draggable
            onDragend={this.handleRouteMarkerDragend.bind(this, 'finish', null)}
            position={L.latLng(finish.lat, finish.lon)}
          >

            {distance !== null && time !== null &&
              <Tooltip offset={new L.Point(14, -25)} direction="right" permanent>
                <span>{distance}, {time}</span>
              </Tooltip>
            }
          </Marker>
        }
        {shapePoints && <Polyline positions={shapePoints} color="#2F4F4F" weight="8" opacity="0.6"/>}
      </div>
    );
  }
}

RoutePlannerResults.propTypes = {
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
        dispatch(setStart(start));
      },
      onSetFinish: function(finish) {
        dispatch(setFinish(finish));
      },
      onAddMidpoint: function(midpoint) {
        const position = 0;
        dispatch(addMidpoint(midpoint, position));
      },
      onSetMidpoint: function(position, midpoint) {
        dispatch(setMidpoint(position, midpoint));
      },
      onRemoveMidpoint: function(position) {
        dispatch(removeMidpoint(position));
      }
    };
  },
  null,
  { withRef: true }
)(RoutePlannerResults);
