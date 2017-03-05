import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

export default class EleMeasurement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      elePoi: null,
      ele: null
    };
  }

  handlePointAdded({ lat, lon }) {
    this.setState({ ele: null, elePoi: { lat, lon } });
    this.findEle();
  }

  handleDrag({ latlng: { lat, lng: lon } }) {
    this.setState({ elePoi: { lat, lon }, ele: null });
  }

  handleDragEnd() {
    this.findEle();
  }

  findEle() {
    const { lat, lon } = this.state.elePoi;
    fetch(`https://www.freemap.sk/api/0.1/elevation/${lat}%7C${lon}`, {
      method: 'GET'
    }).then(res => res.json()).then(data => {
      this.setState({ ele: parseFloat(data.ele), elePoi: { lat: parseFloat(data.lat), lon: parseFloat(data.lon) } });
    });
  }

  render() {
    const { elePoi, ele } = this.state;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return elePoi && (
      <Marker position={L.latLng(elePoi.lat, elePoi.lon)} draggable
          onDrag={b(this.handleDrag)}
          onDragend={b(this.handleDragEnd)}>
        {typeof ele === 'number' && <Tooltip direction="right" permanent><span>{ele} m</span></Tooltip>}
      </Marker>
    );
  }

}
