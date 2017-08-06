import { GridLayer } from 'react-leaflet';
import PropTypes from 'prop-types';

import { API_URL } from 'fm3/backendDefinitions';

const galleryLayer = L.GridLayer.extend({
  createTile(coords, done) {
    const size = this.getTileSize();
    // eslint-disable-next-line
    const map = this._map;
    const pointAa = map.unproject([(coords.x) * size.x - 6, (coords.y) * size.y - 6], coords.z);
    const pointBa = map.unproject([(coords.x + 1) * size.x + 6, (coords.y + 1) * size.y + 6], coords.z);

    const pointA = map.unproject([coords.x * size.x, coords.y * size.y], coords.z);
    const pointB = map.unproject([(coords.x + 1) * size.x, (coords.y + 1) * size.y], coords.z);

    // create a <canvas> element for drawing
    const tile = L.DomUtil.create('canvas', 'leaflet-tile');
    // setup tile width and height according to the options
    tile.width = size.x;
    tile.height = size.y;
    // get a canvas context and draw something on it using coords.x, coords.y and coords.z
    const ctx = tile.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#ff0';
    ctx.lineWidth = 1.5;

    fetch(`${API_URL}/gallery/pictures?by=bbox&bbox=${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`
      + `${this.options.tag ? `&tag=${encodeURIComponent(this.options.tag)}` : ''}${this.options.userId ? `&userId=${this.options.userId}` : ''}`,
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((payload) => {
        payload.forEach(({ lat, lon }) => {
          const y = size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat) * size.y);
          const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng) * size.x);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });

        done(null, tile);
      }).catch((err) => {
        done(err);
      });

    // return the tile so it can be rendered on screen
    return tile;
  },
});

export default class FooLayer extends GridLayer {
  static propTypes = {
    userId: PropTypes.number,
    tag: PropTypes.string,
  };

  // eslint-disable-next-line
  createLeafletElement(props) {
    return new galleryLayer({ zIndex: 1000, ...props });
  }

  updateLeafletElement(fromProps, toProps) {
    if (['userId', 'tag'].some(p => fromProps[p] !== toProps[p])) {
      this.leafletElement.redraw();
    }
  }
}
