import PropTypes from 'prop-types';
import axios from 'axios';
import { GridLayer, withLeaflet, GridLayerProps } from 'react-leaflet';

import { createFilter } from 'fm3/galleryUtils';
import { DomUtil } from 'leaflet';

const galleryLayer = window['L'].GridLayer.extend({
  createTile(coords, done) {
    const size = this.getTileSize();
    const map = this._map;
    const pointAa = map.unproject(
      [coords.x * size.x - 6, coords.y * size.y - 6],
      coords.z,
    );
    const pointBa = map.unproject(
      [(coords.x + 1) * size.x + 6, (coords.y + 1) * size.y + 6],
      coords.z,
    );

    const pointA = map.unproject(
      [coords.x * size.x, coords.y * size.y],
      coords.z,
    );
    const pointB = map.unproject(
      [(coords.x + 1) * size.x, (coords.y + 1) * size.y],
      coords.z,
    );

    // create a <canvas> element for drawing
    const tile = DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;
    // setup tile width and height according to the options
    const dpr = window.devicePixelRatio || 1;
    tile.width = size.x * dpr;
    tile.height = size.y * dpr;
    // get a canvas context and draw something on it using coords.x, coords.y and coords.z
    const ctx = tile.getContext('2d');
    if (!ctx) {
      throw Error('no context');
    }

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#ff0';
    ctx.lineWidth = 1.5;

    const k = 2 ** coords.z;

    axios
      .get(`${process.env.API_URL}/gallery/pictures`, {
        params: {
          by: 'bbox',
          bbox: `${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`,
          ...createFilter(this.options.filter),
        },
        validateStatus: status => status === 200,
      })
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
          const y =
            size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
          const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });

        done(null, tile);
      })
      .catch(err => {
        done(err);
      });

    // return the tile so it can be rendered on screen
    return tile;
  },
});

interface IProps extends GridLayerProps {
  filter: any; // TODO
}

class GalleryLayer extends GridLayer<IProps> {
  static propTypes = {
    filter: PropTypes.object.isRequired,
  };

  createLeafletElement(props: IProps) {
    return new galleryLayer({ ...props });
  }

  // updateLeafletElement(fromProps, toProps) {
  //   if (['dirtySeq', 'filter'].some(p => JSON.stringify(fromProps[p]) !== JSON.stringify(toProps[p]))) {
  //     this.leafletElement.redraw();
  //   }
  // }
}

export default withLeaflet(GalleryLayer);
