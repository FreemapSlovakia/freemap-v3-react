import axios from 'axios';
import { GridLayer } from 'react-leaflet';

import { galleryFilter } from 'fm3/propTypes';

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

    const { tag, userId, ratingFrom, ratingTo, takenAtFrom, takenAtTo, createdAtFrom, createdAtTo } = this.options.filter;
    axios.get(
      `${process.env.API_URL}/gallery/pictures`,
      {
        params: {
          by: 'bbox',
          bbox: `${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`,
          tag,
          userId,
          ratingFrom,
          ratingTo,
          takenAtFrom: takenAtFrom && takenAtFrom.toISOString(),
          takenAtTo: takenAtTo && takenAtTo.toISOString(),
          createdAtFrom: createdAtFrom && createdAtFrom.toISOString(),
          createdAtTo: createdAtTo && createdAtTo.toISOString(),
        },
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        const s = new Set();
        const mangled = data
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

        // console.log('xxxxxxxxxxx', data.length, mangled.length);

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
    filter: galleryFilter.isRequired,
  };

  // eslint-disable-next-line
  createLeafletElement(props) {
    return new galleryLayer({ ...props });
  }

  // updateLeafletElement(fromProps, toProps) {
  //   if (['dirtySeq', 'filter'].some(p => JSON.stringify(fromProps[p]) !== JSON.stringify(toProps[p]))) {
  //     this.leafletElement.redraw();
  //   }
  // }
}
