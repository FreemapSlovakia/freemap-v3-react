import type { Bbox } from '@features/mapArea/model/actions.js';
import type { StlOptions } from './stl.js';

/** Which grid to sample, and from where. */
export interface GridRequest {
  bbox: Bbox;
  cols: number;
  rows: number;
  zoom: number;
  /** Tile URL template with `{z}`, `{x}` and `{y}`. */
  url: string;
  /** Bearer token, where the zoom is premium. */
  token?: string;
  /** The finest zoom served without a token; read instead where `zoom` is refused. */
  freeZoom: number;
}

/** The STL, or only the sampled heights (for the area view). */
export type WorkerRequest =
  | ({ kind: 'stl' } & GridRequest & StlOptions)
  | ({ kind: 'heights' } & GridRequest);

export type WorkerResponse =
  | { type: 'progress'; phase: 'tiles'; done: number; total: number }
  | { type: 'progress'; phase: 'mesh' }
  | { type: 'noData' }
  | {
      type: 'done';
      stl: ArrayBuffer;
      triangles: number;
      /** The first this many triangles are the top surface. */
      topTriangles: number;
      heightMm: number;
      /** Share of the grid without elevation data. */
      nodata: number;
      /** The tiles' distinct `X-Attribution` values, unparsed. */
      attributions: string[];
      /** The zoom actually read; below the request's where premium was refused. */
      zoom: number;
    }
  | {
      type: 'heights';
      /** Metres, row-major from the north; `NaN` where there is no data. */
      heights: Float32Array;
    }
  | { type: 'error'; message: string };
