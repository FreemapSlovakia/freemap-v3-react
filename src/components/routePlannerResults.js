import React from 'react';

import { Marker, Polyline, Tooltip} from 'react-leaflet';
import { parseString as xml2js } from 'xml2js';

export default class RoutePlannerResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transportType: this.props.transportType,
      routePlannerPoints: this.props.routePlannerPoints,
      routeShapePoints: [],
      distance: '0 km',
      time: '0 min.'
    };
  }

  componentWillReceiveProps({ routePlannerPoints, transportType }) {
    // FIXME: there must be some nicer way to do this
    const pointChanged = JSON.stringify(routePlannerPoints) !== JSON.stringify(this.state.routePlannerPoints);
    const transportChanged =  transportType !== this.state.transportType;
    if (pointChanged || transportChanged) {
      this.setState({ routePlannerPoints, routeShapePoints: [], distance: '0 km', time: '0 min.', transportType  });
      this.updateRoute(routePlannerPoints, transportType);
    }
  }

  updateRoute(routePlannerPoints, transportType) {
    const p = routePlannerPoints;
    if (p.start.lat && p.finish.lat) {
      const midpointsForBackend = p.midpoints.map(mp => {
        return [ mp.lat, mp.lon ].join('%7C');
      });
      const allPoints = [
        [ p.start.lat, p.start.lon ].join('%7C'),
        ...midpointsForBackend,
        [ p.finish.lat, p.finish.lon ].join('%7C')
      ];

      const freemapTransportTypes = {
        'car': 'motorcar',
        'walk': 'hiking',
        'bicycle': 'bicycle'
      };
      const freemapTransportType = freemapTransportTypes[transportType];
      const url = `https://www.freemap.sk/api/0.1/r/${allPoints.join('/')}/${freemapTransportType}/fastest&Ajax=`;
      fetch(url, {
        method: 'GET'
      }).then(res => res.text()).then(data => {
        xml2js(data, (error, json) => {
          const distance = json.osmRoute.length[0];
          const time = json.osmRoute.time[0];
          const rawPointsWithMess = json.osmRoute.wkt[0];
          const rawPoints =  rawPointsWithMess.substring(14, rawPointsWithMess.length - 3);
          const points = rawPoints.split(', ').map((lonlat) => {
            const lonlatArray = lonlat.split(' ');
            return [ parseFloat(lonlatArray[1]), parseFloat(lonlatArray[0]) ];
          });

          this.setState({ routeShapePoints: points, distance, time });
        });
      });
    }
  }

  render() {
    const { routePlannerPoints: { start, midpoints, finish }, routeShapePoints, time, distance } = this.state;

    const startIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconUrl: require('../images/marker-icon-green.png'),
      iconRetinaUrl: require('../images/marker-icon-2x-green.png')
    });

    const midPointIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconUrl: require('../images/marker-icon-grey.png'),
      iconRetinaUrl: require('../images/marker-icon-2x-grey.png')
    });

    const finishIcon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconUrl: require('../images/marker-icon-red.png'),
      iconRetinaUrl: require('../images/marker-icon-2x-red.png')
    });

    return (
      <div>
        {start.lat &&
          <Marker
            icon={startIcon}
            draggable
            onDragend={this.props.onRouteMarkerDragend.bind(null, 'start', null)}
            position={L.latLng(start.lat, start.lon)} />}

            {midpoints.map(({ lat, lon}, i) => {
              return (
                <Marker
                  icon={midPointIcon}
                  draggable
                  onDragend={this.props.onRouteMarkerDragend.bind(null, 'midpoint', i)}
                  key={i}
                  position={L.latLng(lat, lon)}>
                </Marker>
              );
            })}

        {finish.lat &&
          <Marker
            icon={finishIcon}
            draggable
            onDragend={this.props.onRouteMarkerDragend.bind(null, 'finish', null)}
            position={L.latLng(finish.lat, finish.lon)}>
              <Tooltip offset={new L.Point(10,0)} direction="right" permanent><span>{distance}, {time}</span></Tooltip>
            </Marker>}
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
