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

    const k = 2 ** coords.z;

    const { tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo } = this.options.filter;
    fetch(`${API_URL}/gallery/pictures?by=bbox&bbox=${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`
      + `${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`
      + `${userId ? `&userId=${userId}` : ''}`
      + `${ratingFrom ? `&ratingFrom=${ratingFrom}` : ''}`
      + `${ratingTo ? `&ratingTo=${ratingTo}` : ''}`
      + `${takenAtFrom ? `&takenAtFrom=${takenAtFrom.toISOString().replace(/T.*/, '')}` : ''}`
      + `${takenAtTo ? `&takenAtTo=${takenAtTo.toISOString().replace(/T.*/, '')}` : ''}`
      ,
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((payload) => {
        const s = new Set();
        const mangled = payload
          .map(({ lat, lon }) => {
            const la = Math.round(lat * k);
            const lo = Math.round(lon * k);
            return { la, lo };
          })
          .filter(({ la, lo }) => {
            const key = `${la},${lo}`;
            const has = s.has(key);
            if (!has) {
              s.add(key);
            }
            return !has;
          })
          .map(({ la, lo }) => ({ lat: la / k, lon: lo / k }));

        // console.log('xxxxxxxxxxx', payload.length, mangled.length);

        mangled.forEach(({ lat, lon }) => {
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
    filter: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line
  createLeafletElement(props) {
    return new galleryLayer({ zIndex: 1000, ...props });
  }

  // updateLeafletElement(fromProps, toProps) {
  //   if (['uploadSeq', 'filter'].some(p => JSON.stringify(fromProps[p]) !== JSON.stringify(toProps[p]))) {
  //     this.leafletElement.redraw();
  //   }
  // }
}
