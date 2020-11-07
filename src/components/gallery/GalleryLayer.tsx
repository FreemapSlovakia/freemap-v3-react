import axios from 'axios';
import { GridLayer, withLeaflet, GridLayerProps } from 'react-leaflet';

import { createFilter } from 'fm3/galleryUtils';
import {
  DomUtil,
  GridLayer as LGridLayer,
  Coords,
  DoneCallback,
  GridLayerOptions,
} from 'leaflet';
import { LatLon } from 'fm3/types/common';
import { GalleryFilter } from 'fm3/actions/galleryActions';

type GalleryLayerOptions = GridLayerOptions & {
  filter: GalleryFilter;
};

class LGalleryLayer extends LGridLayer {
  private _options?: GalleryLayerOptions;

  constructor(options?: GalleryLayerOptions) {
    super(options);
    this._options = options;
  }

  createTile(coords: Coords, done: DoneCallback) {
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

    const tile = DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;

    const dpr = window.devicePixelRatio || 1;
    tile.width = size.x * dpr;
    tile.height = size.y * dpr;

    const ctx = tile.getContext('2d');
    if (!ctx) {
      throw Error('no context');
    }

    const zk = Math.min(1, 1.1 ** coords.z / 3);

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#ff0';
    ctx.lineWidth = 1.5 * zk; // coords.z > 9 ? 1.5 : 1;

    const k = 2 ** coords.z;

    axios
      .get(`${process.env.API_URL}/gallery/pictures`, {
        params: {
          by: 'bbox',
          bbox: `${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`,
          ...(this._options ? createFilter(this._options.filter) : {}),
        },
        validateStatus: (status) => status === 200,
      })
      .then(({ data }) => {
        const s = new Set();
        const mangled = data
          .map(({ lat, lon }: LatLon) => {
            return { lat: Math.round(lat * k), lon: Math.round(lon * k) };
          })
          .filter(({ lat, lon }: LatLon) => {
            const key = `${lat},${lon}`;
            const has = s.has(key);
            if (!has) {
              s.add(key);
            }
            return !has;
          })
          .map(({ lat, lon }: LatLon) => ({ lat: lat / k, lon: lon / k }));

        mangled.forEach(({ lat, lon }: LatLon) => {
          const y =
            size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
          const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

          ctx.beginPath();
          ctx.arc(x, y, 4 * zk, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });

        done(undefined, tile);
      })
      .catch((err) => {
        done(err);
      });

    return tile;
  }
}

interface Props extends GridLayerProps {
  filter: GalleryFilter;
}

class GalleryLayerInt extends GridLayer<Props, LGalleryLayer> {
  createLeafletElement(props: Props) {
    return new LGalleryLayer({ ...props });
  }

  // updateLeafletElement(fromProps, toProps) {
  //   if (['dirtySeq', 'filter'].some(p => JSON.stringify(fromProps[p]) !== JSON.stringify(toProps[p]))) {
  //     this.leafletElement.redraw();
  //   }
  // }
}

export const GalleryLayer = withLeaflet(GalleryLayerInt);
