import React from 'react';
import { Marker, Polyline} from 'react-leaflet';
const xml2js = require('xml2js').parseString;

export default class RoutePlannerResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign({
      routePlannerPoints: this.props.routePlannerPoints,
      routeShapePoints: []
    }, {})
  }

  componentWillReceiveProps(newProps) {
    let p = newProps.routePlannerPoints

    // FIXME: there must be some nicer way to do this
    const changed = JSON.stringify(p) != JSON.stringify(this.state.routePlannerPoints)
    if(changed){
      this.setState({ routePlannerPoints: p });
    }
    const that = this
    if(changed && p.start.lat && p.finish.lat){
      const url = `http://www.freemap.sk/api/0.1/r/${p.start.lat}%7C${p.start.lon}/${p.finish.lat}%7C${p.finish.lon}/motorcar/fastest&Ajax=`
      fetch(url, {
        method: 'GET'
      }).then(res => res.text()).then(data => {
        xml2js(data, (error, json) => {
          const rawPointsWithMess = json.osmRoute.wkt[0]
          const rawPoints =  rawPointsWithMess.substring(14, rawPointsWithMess.length - 3)
          const points = rawPoints.split(', ').map((lonlat) => {
            const lonlatArray = lonlat.split(' ')
            return [parseFloat(lonlatArray[1]), parseFloat(lonlatArray[0])]
          })
          that.setState({ routeShapePoints: points});
        })

      });
    }
  }

  render() {
    const { routePlannerPoints, routeShapePoints } = this.state;
    const p = routePlannerPoints
    return (
        <div>
          {p.start.lat && <Marker key="routePlannerStart" position={L.latLng(p.start.lat, p.start.lon)} />}
          {p.finish.lat && <Marker key="routePlannerEnd" position={L.latLng(p.finish.lat, p.finish.lon)} />}
          <Polyline positions={routeShapePoints}/>
        </div>
    )
  }
}

RoutePlannerResults.propTypes = {
  routePlannerPoints: React.PropTypes.object,
};
