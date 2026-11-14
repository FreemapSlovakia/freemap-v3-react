import type { Bbox } from '@features/mapArea/model/actions.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import parametricShading from '@shared/mapLibrary/defs/parametricShading.js';
import { useEffect, useState } from 'react';
import {
  type DatasetCredits,
  resolveDatasetCredits,
} from '../model/credits.js';
import { NoElevationDataError } from '../model/errors.js';
import { fetchHeights } from '../model/generate.js';
import { mapTexture, type TextureMap } from '../model/mapTexture.js';
import { MAX_TILES, planModel } from '../model/plan.js';
import { tileCount } from '../model/tileGrid.js';

// A phone gets a smaller area view.
const COARSE = window.matchMedia('(pointer: coarse)').matches;

/** Grid points of the preview: enough to read the relief, cheap to fetch and draw. */
const PREVIEW_SAMPLES = COARSE ? 90_000 : 250_000;

/** The texture's longest side, pixels. */
const TEXTURE_SIDE = 2048;

const DEBOUNCE_MS = 500;

export interface PreviewHeights {
  /** The area these were sampled for; one array per fetch, so it can key effects. */
  bbox: Bbox;
  heights: Float32Array;
  cols: number;
  rows: number;
}

export interface PreviewTextureData {
  canvas: HTMLCanvasElement;
  /** The map's credits, then the datasets its tiles reported. */
  credits: AttributionDef[];
}

/** Why there is no grid for the current area. */
export type PreviewProblem = 'failed' | 'noData' | 'tooLarge';

type Keyed<T> = { key: string; value: T | PreviewProblem };

/**
 * The heights and map texture the preview draws, fetched after the area has
 * stood still a moment; a newer area cancels what is in flight. `last` is the
 * newest grid of any area, to keep the view up while the current one loads.
 */
export function usePreviewData(
  bbox: Bbox | null | undefined,
  /** The finest zoom read: free tiles only, as premium's are spent on models. */
  freeZoom: number,
  textureMap: TextureMap | undefined,
) {
  const [heights, setHeights] = useState<Keyed<PreviewHeights> | null>(null);

  // By the grid they were read for.
  const [terrainCredits, setTerrainCredits] = useState<{
    heights: Float32Array;
    credits: DatasetCredits;
  } | null>(null);

  const [textureData, setTextureData] =
    useState<Keyed<PreviewTextureData> | null>(null);

  // Stands for `bbox`, whose identity changes on every render.
  const key = bbox?.join() ?? '';

  const textureKey = `${key}|${textureMap?.type ?? ''}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is `bbox`
  useEffect(() => {
    if (!bbox) {
      return;
    }

    let cancel = () => {};

    const timer = window.setTimeout(() => {
      // Width only scales the grid; the point count is what the preview needs.
      const plan = planModel(bbox, 200, freeZoom, PREVIEW_SAMPLES);

      // The model is refused there too; its tiles would not fit in memory.
      if (tileCount(bbox, plan.cols, plan.rows, plan.zoom) > MAX_TILES) {
        setHeights({ key, value: 'tooLarge' });

        return;
      }

      const run = fetchHeights({
        bbox,
        cols: plan.cols,
        rows: plan.rows,
        zoom: plan.zoom,
        url: parametricShading.url,
        freeZoom,
      });

      cancel = run.cancel;

      run.promise.then(
        ({ heights, attributions }) => {
          setHeights({
            key,
            value: { bbox, heights, cols: plan.cols, rows: plan.rows },
          });

          // Beside the grid, not in it: the view is memoized on the grid.
          resolveDatasetCredits(attributions, 'terrain').then(
            (credits) => setTerrainCredits({ heights, credits }),
            () => {},
          );
        },
        (err: unknown) => {
          if (!(err instanceof DOMException && err.name === 'AbortError')) {
            setHeights({
              key,
              value: err instanceof NoElevationDataError ? 'noData' : 'failed',
            });
          }
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);

      cancel();
    };
  }, [key, freeZoom]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `textureKey` is `bbox` and `textureMap`
  useEffect(() => {
    if (!bbox || !textureMap) {
      return;
    }

    const ac = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const { canvas, credits, attributions } = await mapTexture(
          textureMap,
          bbox,
          TEXTURE_SIDE,
          ac.signal,
        );

        // Renderer tiles name their datasets; the map's own credits don't. A
        // lookup that fails leaves the map's own rather than the texture.
        const datasets = await resolveDatasetCredits(
          attributions,
          'tiles',
        ).then(
          (c) => c.credits,
          () => [],
        );

        if (!ac.signal.aborted) {
          setTextureData({
            key: textureKey,
            value: { canvas, credits: [...credits, ...datasets] },
          });
        }
      } catch {
        if (!ac.signal.aborted) {
          setTextureData({ key: textureKey, value: 'failed' });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);

      ac.abort();
    };
  }, [textureKey]);

  const current = heights?.key === key ? heights.value : null;

  const last =
    heights && typeof heights.value !== 'string' ? heights.value : null;

  const currentTexture =
    textureData?.key === textureKey && typeof textureData.value !== 'string'
      ? textureData.value
      : null;

  return {
    /** The grid for the current area, `null` while it loads. */
    heights: typeof current === 'string' ? null : current,
    problem: typeof current === 'string' ? current : null,
    /** The newest grid of any area. */
    last,
    /** The elevation datasets of `last`; `null` while resolving. */
    lastCredits:
      last && terrainCredits?.heights === last.heights
        ? terrainCredits.credits
        : null,
    /** The texture for the current area and map only. */
    texture: currentTexture,
    textureFailed:
      textureData?.key === textureKey && textureData.value === 'failed',
  };
}
