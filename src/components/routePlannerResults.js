import React from 'react';

import { Marker, Polyline, Tooltip} from 'react-leaflet';
import { parseString as xml2js } from 'xml2js';

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

const freemapTransportTypes = {
  'car': 'motorcar',
  'walk': 'hiking',
  'bicycle': 'bicycle'
};

export default class RoutePlannerResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transportType: this.props.transportType,
      routePlannerPoints: this.props.routePlannerPoints,
      routeShapePoints: [],
      distance: null,
      time: null
    };
  }

  componentWillReceiveProps({ routePlannerPoints, transportType }) {
    // FIXME: there must be some nicer way to do this
    const pointChanged = JSON.stringify(routePlannerPoints) !== JSON.stringify(this.state.routePlannerPoints);
    const transportChanged = transportType !== this.state.transportType;
    if (pointChanged || transportChanged) {
      this.setState({ routePlannerPoints, routeShapePoints: [], distance: null, time: null, transportType  });
      this.updateRoute(routePlannerPoints, transportType);
    }
  }

  updateRoute({ start, midpoints, finish }, transportType) {
    if (start && finish) {
      const allPoints = [
        [ start.lat, start.lon ].join('%7C'),
        ...midpoints.map(mp => [ mp.lat, mp.lon ].join('%7C')),
        [ finish.lat, finish.lon ].join('%7C')
      ].join('/');

      fetch(`https://www.freemap.sk/api/0.1/r/${allPoints}/${freemapTransportTypes[transportType]}/fastest&Ajax=`, {
        method: 'GET'
      }).then(res => res.text()).then(data => {
        xml2js(data, (error, json) => {
          const distance = json.osmRoute.length[0];
          const time = json.osmRoute.time[0];
          const rawPointsWithMess = json.osmRoute.wkt[0];
          const rawPoints = rawPointsWithMess.substring(14, rawPointsWithMess.length - 3).trim();
          const routeShapePoints = rawPoints ? rawPoints.split(', ').map((lonlat) => {
            const lonlatArray = lonlat.split(' ');
            return [ parseFloat(lonlatArray[1]), parseFloat(lonlatArray[0]) ];
          }) : [];
          this.setState({ routeShapePoints, distance, time });
        });
      });
    }
  }

  render() {
    const { routePlannerPoints: { start, midpoints, finish }, routeShapePoints, time, distance } = this.state;

    return (
      <div>
        {start &&
          <Marker
            icon={startIcon}
            draggable
            onDragend={this.props.onRouteMarkerDragend.bind(null, 'start', null)}
            position={L.latLng(start.lat, start.lon)}/>}

            {midpoints.map(({ lat, lon}, i) => (
                <Marker
                  icon={midPointIcon}
                  draggable
                  onDragend={this.props.onRouteMarkerDragend.bind(null, 'midpoint', i)}
                  key={i}
                  position={L.latLng(lat, lon)}>
                </Marker>
              )
            )}

        {finish &&
          <Marker
              icon={finishIcon}
              draggable
              onDragend={this.props.onRouteMarkerDragend.bind(null, 'finish', null)}
              position={L.latLng(finish.lat, finish.lon)}>

            {distance !== null && time !== null &&
              <Tooltip direction="right" permanent>
                <span>{distance}, {time}</span>
              </Tooltip>
            }
          </Marker>
        }
        <Polyline positions={routeShapePoints} color="#2F4F4F" weight="8" opacity="0.6"/>
      </div>
    );
  }
}

RoutePlannerResults.propTypes = {
  routePlannerPoints: React.PropTypes.object,
  onRouteMarkerDragend: React.PropTypes.func.isRequired,
  transportType: React.PropTypes.string
};
