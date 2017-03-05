import React from 'react';
import { Marker, Tooltip, Polyline } from 'react-leaflet';
import update from 'immutability-helper';

import { distance } from 'fm3/geoutils';

const km = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default class Measurement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      points: []
    };
  }

  handlePointAdded({ lat, lon }) {
    this.setState({ points: update(this.state.points, { $push: [ { lat, lon } ] }) });
  }

  handleMeasureMarkerDrag(i, { latlng: { lat, lng: lon } }) {
    this.setState({ points: update(this.state.points, { i: { $set: { lat, lon } } }) });
  }

  render() {
    const { points } = this.state;

    let prev = null;
    let dist = 0;

    return (
      <div>
        {points.map((p, i) => {
          if (prev) {
            dist += distance(p.lat, p.lon, prev.lat, prev.lon);
          }
          prev = p;

          const m = (
            <Marker key={i} position={L.latLng(p.lat, p.lon)} draggable onDrag={this.handleMeasureMarkerDrag.bind(this, i)}>
              <Tooltip direction="right" permanent><span>{km.format(dist / 1000)} km</span></Tooltip>
            </Marker>
          );

          return m;
        })}

        {points.length > 1 && <Polyline positions={points.map(({ lat, lon }) => [ lat, lon ])}/>}
      </div>
    );
  }

}
