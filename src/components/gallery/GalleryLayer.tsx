import { createTileLayerComponent, LayerProps } from '@react-leaflet/core';
import axios from 'axios';
import { GalleryColorizeBy, GalleryFilter } from 'fm3/actions/galleryActions';
import { createFilter } from 'fm3/galleryUtils';
import {
  Coords,
  DoneCallback,
  GridLayer as LGridLayer,
  GridLayerOptions,
} from 'leaflet';
import qs from 'query-string';
import { renderGalleryTile } from './galleryTileRenderrer';

type GalleryLayerOptions = GridLayerOptions & {
  filter: GalleryFilter;
  colorizeBy: GalleryColorizeBy | null;
  myUserId?: number;
};

const jobMap = new Map<
  number,
  {
    reject(e: any): void;
    resolve(): void;
    run(w: Worker): void;
    started?: true;
  }
>();

function createWorker() {
  const w = new Worker(
    new URL(
      /* webpackChunkName: "galleryLayerWorker" */ './galleryLayerWorker',
      import.meta.url,
    ),
  );

  w.onmessage = (evt) => {
    // console.log('OK', evt.data.id, resMap.has(evt.data.id));
    const job = jobMap.get(evt.data.id);

    if (!job) {
      console.error('no such job', evt.data.id);
    } else {
      if (evt.data.error) {
        job.reject(evt.data.error);
      } else {
        job.resolve();
      }

      jobMap.delete(evt.data.id);
    }

    workerPool.push(w);

    runNextJob();
  };

  w.onerror = (err) => {
    console.error('worker error');
    console.error(err);
  };

  w.onmessageerror = (err) => {
    console.error('worker message error');
    console.error(err);
  };

  return w;
}

const workerPool: Worker[] = [];

let id = 0;

function runNextJob() {
  const job = [...jobMap.values()].find((v) => !v.started);

  if (job) {
    const w = workerPool.pop();

    if (w) {
      job.started = true;

      job.run(w);
    } else if (workerPool.length < Math.min(navigator.hardwareConcurrency, 8)) {
      const w1 = createWorker();

      job.started = true;

      job.run(w1);
    }
  }
}

let supportsOffscreen: boolean | undefined = undefined;

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

    const tile = document.createElement('canvas');

    const dpr = window.devicePixelRatio || 1;
    tile.width = size.x * dpr;
    tile.height = size.y * dpr;

    const colorizeBy = this._options?.colorizeBy ?? null;

    const myUserId = this._options?.myUserId ?? null;

    if (supportsOffscreen === undefined) {
      try {
        document.createElement('canvas').transferControlToOffscreen();

        supportsOffscreen = true;
      } catch {
        supportsOffscreen = false;
      }
    }

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
        const ctx = {
          data,
          dpr,
          zoom: coords.z,
          colorizeBy,
          pointA,
          pointB,
          myUserId,
          size,
          tile,
        };

        if (supportsOffscreen) {
          return new Promise<void>((resolve, reject) => {
            const myId = id++;

            jobMap.set(myId, {
              resolve,
              reject,
              run(w) {
                const offscreen = tile.transferControlToOffscreen();

                w.postMessage({ ...ctx, id: myId, tile: offscreen }, [
                  offscreen,
                ]);
              },
            });

            runNextJob();
          });
        } else {
          renderGalleryTile(ctx);
        }
      })
      .then(() => {
        done(undefined, tile);
      })
      .catch((err) => {
        console.error(err);
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
      ['dirtySeq', 'filter', 'colorizeBy', 'myUserId'].some(
        (p) =>
          JSON.stringify((props as any)[p]) !==
          JSON.stringify((prevProps as any)[p]),
      )
    ) {
      instance.redraw();
    }
  },
);
