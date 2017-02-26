import React from 'react';
import { Marker, Polyline} from 'react-leaflet';
import { parseString as xml2js } from 'xml2js';

export default class RoutePlannerResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      routePlannerPoints: this.props.routePlannerPoints,
      routeShapePoints: []
    };
  }

  componentWillReceiveProps({ routePlannerPoints }) {
    // FIXME: there must be some nicer way to do this
    const changed = JSON.stringify(routePlannerPoints) !== JSON.stringify(this.state.routePlannerPoints);
    if (changed) {
      this.setState({ routePlannerPoints, routeShapePoints: [] });
      if (routePlannerPoints.start.lat && routePlannerPoints.finish.lat) {
        this.computeNewRoute(routePlannerPoints);
      }
    }
  }

  computeNewRoute({ start, finish }) {
    const url = `http://www.freemap.sk/api/0.1/r/${start.lat}%7C${start.lon}/${finish.lat}%7C${finish.lon}/motorcar/fastest&Ajax=`;
    fetch(url, {
      method: 'GET'
    }).then(res => res.text()).then(data => {
      xml2js(data, (error, json) => {
        const rawPointsWithMess = json.osmRoute.wkt[0];
        const rawPoints =  rawPointsWithMess.substring(14, rawPointsWithMess.length - 3);
        const points = rawPoints.split(', ').map((lonlat) => {
          const lonlatArray = lonlat.split(' ');
          return [ parseFloat(lonlatArray[1]), parseFloat(lonlatArray[0]) ];
        });

        this.setState({ routeShapePoints: points });
      });
    });
  }

  render() {
    const { routePlannerPoints: { start, finish }, routeShapePoints } = this.state;
    return (
      <div>
        {start.lat && <Marker key="routePlannerStart" position={L.latLng(start.lat, start.lon)}/>}
        {finish.lat && <Marker key="routePlannerEnd" position={L.latLng(finish.lat, finish.lon)}/>}
        <Polyline positions={routeShapePoints} color="blue" weight="10" opacity="0.4"/>
      </div>
    );
  }
}

RoutePlannerResults.propTypes = {
  routePlannerPoints: React.PropTypes.object,
};
