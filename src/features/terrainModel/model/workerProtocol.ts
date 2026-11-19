import type { Bbox } from '@features/mapArea/model/actions.js';
import type { LandcoverImage, ModelGrid } from './landcover.js';
import type { Paint } from './paint.js';
import type { Mesh, StlOptions } from './stl.js';

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

/** The model's mesh, only the sampled heights (for the area view), or a mesh's 3MF. */
export type WorkerRequest =
  | ({ kind: 'stl'; paint?: Paint } & GridRequest & StlOptions)
  | ({ kind: 'heights' } & GridRequest)
  | {
      kind: '3mf';
      mesh: Mesh;
      palette: string[];
      metadata: Record<string, string>;
    }
  | { kind: 'landcover'; bbox: Bbox; paint: Paint; grid: ModelGrid };

export type WorkerResponse =
  | { type: 'progress'; phase: 'tiles'; done: number; total: number }
  | { type: 'progress'; phase: 'mesh' }
  | { type: 'noData' }
  | {
      type: 'done';
      /** Shown as it is, and written as a file only when downloaded. */
      mesh: Mesh;
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
      /** The tiles' distinct `X-Attribution` values, unparsed. */
      attributions: string[];
    }
  | { type: 'file'; blob: Blob }
  | { type: 'landcover'; image: LandcoverImage }
  | { type: 'error'; message: string };
