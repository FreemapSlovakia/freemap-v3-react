import { createTileLayerComponent } from '@react-leaflet/core';
import {
  Coords,
  DoneCallback,
  GridLayerOptions,
  Map as LeafletMap,
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

    this.supportsOffscreen = typeof window.OffscreenCanvas !== 'undefined';

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

    const processTile = async () => {
      const controller = new AbortController();

      const key = `${coords.x}/${coords.y}/${coords.z}`;

      const { signal } = controller;

      this._acm.set(key, controller);

      let response: Response;

      try {
        response = await fetch(
          process.env['API_URL'] + '/gallery/pictures?' + sp.toString(),
          {
            signal,
            headers: this._options?.authToken
              ? { Authorization: 'Bearer ' + this._options?.authToken }
              : {},
          },
        );
      } catch (err) {
        if (String(err).includes('abort')) {
          return;
        }

        throw err;
      } finally {
        this._acm.delete(key);
      }

      if (response.status !== 200) {
        throw new Error('unexpected status ' + response.status);
      }

      const data = await response.json();

      const ctx = {
        data,
        dpr,
        zoom: coords.z,
        colorizeBy,
        pointA,
        pointB,
        myUserId,
        size,
      };

      if (this.supportsOffscreen) {
        const imageBitmap = await this._workerPool.addJob<ImageBitmap>(() => [
          ctx,
          [],
        ]);

        tile.getContext('2d')?.drawImage(imageBitmap, 0, 0);
      }

      renderGalleryTile({ ...ctx, tile });
    };

    processTile().then(
      () => {
        done(undefined, tile);
      },
      (err) => {
        // console.error('Error rendering tile:', err);

        done(err);
      },
    );

    return tile;
  }

  onRemove(map: LeafletMap): this {
    this._workerPool.destroy();

    return super.onRemove(map);
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
