import React from 'react';

import { Marker, Polyline, Tooltip} from 'react-leaflet';
import { parseString as xml2js } from 'xml2js';

export default class RoutePlannerResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      routePlannerPoints: this.props.routePlannerPoints,
      routeShapePoints: [],
      distance: '0 km',
      time: '0 min.'
    };
  }

  componentWillReceiveProps({ routePlannerPoints }) {
    // FIXME: there must be some nicer way to do this
    const changed = JSON.stringify(routePlannerPoints) !== JSON.stringify(this.state.routePlannerPoints);
    if (changed) {
      this.setState({ routePlannerPoints, routeShapePoints: [], distance: '0 km', time: '0 min.'  });
      this.updateRoute(routePlannerPoints);
    }
  }

  updateRoute(routePlannerPoints) {
    const p = routePlannerPoints
    if (p.start.lat && p.finish.lat) {
      const url = `http://www.freemap.sk/api/0.1/r/${p.start.lat}%7C${p.start.lon}/${p.finish.lat}%7C${p.finish.lon}/motorcar/fastest&Ajax=`;
      fetch(url, {
        method: 'GET'
      }).then(res => res.text()).then(data => {
        xml2js(data, (error, json) => {
          const distance = json.osmRoute.length[0]
          const time = json.osmRoute.time[0]
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
    const { routePlannerPoints: { start, finish }, routeShapePoints, time, distance } = this.state;
    const b = (fn, ...args) => fn.bind(this, ...args);

    const startIcon = new L.Icon({ 
      iconSize: [23, 37],
      iconUrl: 'images/marker-icon-green.png', 
      iconRetinaUrl: 'images/marker-icon-2x-green.png'
    })
    const finishIcon = new L.Icon({ 
      iconSize: [23, 37],
      iconUrl: 'images/marker-icon-red.png', 
      iconRetinaUrl: 'images/marker-icon-2x-red.png'
    }) 

    return (
      <div>
        {start.lat && 
          <Marker 
            icon={startIcon}
            draggable
            onDragend={this.props.onRouteMarkerDragend.bind(null, 'start')}
            position={L.latLng(start.lat, start.lon)} />}
        {finish.lat && 
          <Marker 
            icon={finishIcon}
            draggable
            onDragend={this.props.onRouteMarkerDragend.bind(null, 'finish')}
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
  onRouteMarkerDragend: React.PropTypes.func.isRequired
};
