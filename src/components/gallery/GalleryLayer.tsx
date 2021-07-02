import { createTileLayerComponent, LayerProps } from '@react-leaflet/core';
import axios from 'axios';
import color from 'color';
import { GalleryColorizeBy, GalleryFilter } from 'fm3/actions/galleryActions';
import { createFilter } from 'fm3/galleryUtils';
import { LatLon } from 'fm3/types/common';
import {
  Coords,
  DomUtil,
  DoneCallback,
  GridLayer as LGridLayer,
  GridLayerOptions,
} from 'leaflet';
import qs from 'query-string';

type Sortable<T = unknown> = {
  sort: number;
  value: T;
};

type GalleryLayerOptions = GridLayerOptions & {
  filter: GalleryFilter;
  colorizeBy: GalleryColorizeBy | null;
  myUserId?: number;
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

    // TODO use offscreen canvas if available

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
    ctx.lineWidth = 1 * zk; // coords.z > 9 ? 1.5 : 1;

    const k = 2 ** coords.z;

    const colorizeBy = this._options?.colorizeBy ?? null;
    const myUserId = this._options?.myUserId ?? null;

    axios
      // .get(`${process.env['API_URL']}/gallery/pictures`, {
      .get(`https://backend.freemap.sk/gallery/pictures`, {
        params: {
          by: 'bbox',
          bbox: `${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`,
          ...(this._options ? createFilter(this._options.filter) : {}),
          fields: colorizeBy === 'mine' ? 'userId' : colorizeBy,
        },
        paramsSerializer: (params) => qs.stringify(params),
        validateStatus: (status) => status === 200,
      })
      .then(({ data }) => {
        const s = new Set();

        if (colorizeBy === 'userId') {
          data = data
            .map((a: unknown) => ({ sort: Math.random(), value: a }))
            .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
            .map((a: Sortable) => a.value);
        } else if (
          colorizeBy === 'takenAt' ||
          colorizeBy === 'createdAt' ||
          colorizeBy === 'rating'
        ) {
          data = data
            .map((a: any) => ({ sort: a[colorizeBy], value: a }))
            .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
            .map((a: Sortable) => a.value);
        } else if (colorizeBy === 'mine') {
          data = data
            .map((a: any) => ({
              sort: a.userId === myUserId ? 1 : 0,
              value: a,
            }))
            .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
            .map((a: Sortable) => a.value);
        }

        // remove "dense" pictures
        data = data
          .reverse()
          .map(({ lat, lon, ...rest }: LatLon) => {
            return {
              lat: Math.round(lat * k),
              lon: Math.round(lon * k),
              ...rest,
            };
          })
          .filter(({ lat, lon }: LatLon) => {
            const key = `${lat},${lon}`;
            const has = s.has(key);
            if (!has) {
              s.add(key);
            }
            return !has;
          })
          .map(({ lat, lon, ...rest }: LatLon) => ({
            lat: lat / k,
            lon: lon / k,
            ...rest,
          }))
          .reverse();

        data.forEach(({ lat, lon }: LatLon) => {
          const y =
            size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
          const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

          ctx.beginPath();
          ctx.arc(x, y, 4 * zk, 0, 2 * Math.PI);

          ctx.stroke();
        });

        ctx.lineWidth = 0.25 * zk; // coords.z > 9 ? 1.5 : 1;

        const now = Date.now() / 1000;

        data.forEach(
          ({
            lat,
            lon,
            rating,
            createdAt,
            takenAt,
            userId,
          }: LatLon & {
            rating: number;
            userId: number;
            createdAt: number;
            takenAt?: number | null;
          }) => {
            const y =
              size.y -
              ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
            const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

            ctx.beginPath();
            ctx.arc(x, y, 3.5 * zk, 0, 2 * Math.PI);

            switch (colorizeBy) {
              case 'userId':
                ctx.fillStyle = color.lch(90, 70, -userId * 11313).hex();
                break;
              case 'rating':
                ctx.fillStyle = color
                  .hsv(60, 100, (Math.tanh(rating - 2.5) + 1) * 50)
                  .hex();
                break;
              case 'takenAt':
                ctx.fillStyle = !takenAt
                  ? '#a22'
                  : color
                      .hsl(
                        60,
                        100,
                        // 100 - ((now - takenAt) * 10) ** 0.2,
                        100 - ((now - takenAt) * 100) ** 0.185,
                      )
                      .hex();
              case 'createdAt':
                ctx.fillStyle = color
                  .hsl(
                    60,
                    100,
                    // 100 - ((now - createdAt) * 10) ** 0.2,
                    100 - ((now - createdAt) * 100) ** 0.185,
                  )
                  .hex();
                break;
              case 'mine':
                ctx.fillStyle = userId === myUserId ? '#ff0' : '#fa4';
                break;
            }

            ctx.fill();
            ctx.stroke();
          },
        );

        done(undefined, tile);
      })
      .catch((err) => {
        done(err);
      });

    return tile;
  }
}

interface Props extends LayerProps {
  filter: GalleryFilter;
  colorizeBy: GalleryColorizeBy | null;
  myUserId?: number;
  opacity?: number;
  zIndex?: number;
}

export const GalleryLayer = createTileLayerComponent<LGalleryLayer, Props>(
  (props, context) => {
    return {
      instance: new LGalleryLayer(props),
      context,
    };
  },

  (instance, props, prevProps) => {
    if (
      ['dirtySeq', 'filter'].some(
        (p) =>
          JSON.stringify((props as any)[p]) !==
          JSON.stringify((prevProps as any)[p]),
      )
    ) {
      instance.redraw();
    }
  },
);
