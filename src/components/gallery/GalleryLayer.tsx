import { createTileLayerComponent } from '@react-leaflet/core';
import {
  Coords,
  DoneCallback,
  GridLayerOptions,
  GridLayer as LGridLayer,
} from 'leaflet';
import {
  GalleryColorizeBy,
  GalleryFilter,
} from '../../actions/galleryActions.js';
import { createFilter } from '../../galleryUtils.js';
import { createWorkerPool, WorkerPool } from '../../workerPool.js';
import { renderGalleryTile } from './galleryTileRenderrer.js';

type GalleryLayerOptions = GridLayerOptions & {
  filter: GalleryFilter;
  colorizeBy: GalleryColorizeBy | null;
  myUserId?: number;
  authToken?: string;
};

class LGalleryLayer extends LGridLayer {
  private _options?: GalleryLayerOptions;

  private _acm = new Map<string, AbortController>();

  private supportsOffscreen: boolean;

  private _workerPool: WorkerPool;

  constructor(options?: GalleryLayerOptions) {
    super(options);

    this._options = options;

    this.on('tileunload', ({ coords }: { coords: Coords }) => {
      const key = `${coords.x}/${coords.y}/${coords.z}`;

      const ac = this._acm.get(key);

      if (ac) {
        ac.abort();

        this._acm.delete(key);
      }
    });

    try {
      document.createElement('canvas').transferControlToOffscreen();

      this.supportsOffscreen = true;
    } catch {
      this.supportsOffscreen = false;
    }

    this._workerPool = createWorkerPool(
      () => new Worker(new URL('./galleryLayerWorker.js', import.meta.url)),
    );
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

    const controller = new AbortController();

    const key = `${coords.x}/${coords.y}/${coords.z}`;

    this._acm.set(key, controller);

    const { signal } = controller;

    const sp = new URLSearchParams({
      by: 'bbox',
      bbox: `${pointAa.lng},${pointBa.lat},${pointBa.lng},${pointAa.lat}`,
      fields: 'pano',
    });

    if (this._options) {
      for (const [k, v] of Object.entries(createFilter(this._options.filter))) {
        if (v != null) {
          sp.set(k, String(v));
        }
      }
    }

    if (colorizeBy) {
      sp.append(
        'fields',
        colorizeBy === 'mine'
          ? 'userId'
          : colorizeBy === 'season'
            ? 'takenAt'
            : colorizeBy,
      );
    }

    // https://backend.freemap.sk/gallery/pictures
    fetch(process.env['API_URL'] + '/gallery/pictures?' + sp.toString(), {
      signal,
      headers: this._options?.authToken
        ? { Authorization: 'Bearer ' + this._options?.authToken }
        : {},
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error('unexpected status ' + response.status);
        }

        return response.json();
      })
      .then((data) => {
        this._acm.delete(key);

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

        if (this.supportsOffscreen) {
          return this._workerPool.addJob(() => {
            const offscreen = tile.transferControlToOffscreen();

            return [{ ...ctx, tile: offscreen }, [offscreen]];
          });
        }

        renderGalleryTile(ctx);

        return undefined;
      })
      .then(() => {
        done(undefined, tile);
      })
      .catch((err) => {
        if (!String(err).includes('abort')) {
          console.error(err);
        }

        done(err);

        this._acm.delete(key);
      });

    return tile;
  }
}

type Props = GalleryLayerOptions & {
  dirtySeq?: number; // probably unused?
};

export const GalleryLayer = createTileLayerComponent<LGalleryLayer, Props>(
  (props, context) => ({
    instance: new LGalleryLayer(props),
    context,
  }),

  (instance, props, prevProps) => {
    if (
      (['dirtySeq', 'filter', 'colorizeBy', 'myUserId'] as const).some(
        (p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]),
      )
    ) {
      instance.redraw();
    }
  },
);

export default GalleryLayer;
