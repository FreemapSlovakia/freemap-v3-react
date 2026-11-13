import type { Bbox } from '@features/mapArea/model/actions.js';
import type { StlOptions } from './stl.js';

export interface WorkerRequest extends StlOptions {
  bbox: Bbox;
  zoom: number;
  /** Tile URL template with `{z}`, `{x}` and `{y}`. */
  url: string;
  /** Bearer token, where the zoom is premium. */
  token?: string;
  /** The finest zoom served without a token; read instead where `zoom` is refused. */
  freeZoom: number;
}

export type WorkerResponse =
  | { type: 'progress'; phase: 'tiles'; done: number; total: number }
  | { type: 'progress'; phase: 'mesh' }
  | { type: 'noData' }
  | {
      type: 'done';
      stl: ArrayBuffer;
      triangles: number;
      heightMm: number;
      /** Share of the grid without elevation data. */
      nodata: number;
      /** The tiles' distinct `X-Attribution` values, unparsed. */
      attributions: string[];
      /** The zoom actually read; below the request's where premium was refused. */
      zoom: number;
    }
  | { type: 'error'; message: string };
