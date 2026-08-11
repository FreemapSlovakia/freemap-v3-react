import { useEffect, useRef, useState } from 'react';
import { fallbackTilesSize, sampleTilesSize } from '../tileSizeSampler.js';

const DEBOUNCE = 700;

export type TilesSizeEstimateParams = {
  urlTemplate: string | undefined;
  bbox: [number, number, number, number] | undefined;
  minZoom: number;
  maxZoom: number;
  tileCount: number | undefined;
  /** The `@Nx` variant that will really be downloaded; see `pickTileScale`. */
  scale?: number;
  enabled?: boolean;
};

export type TilesSizeEstimate = {
  bytes: number | undefined;
  /** `false` while the flat-constant fallback is being shown. */
  sampled: boolean;
  sampling: boolean;
};

/**
 * Debounced download-size estimate for a tile bbox × zoom range, sampled from
 * the real layer; shows the flat-constant fallback until the first samples
 * land.
 */
export function useTilesSizeEstimate({
  urlTemplate,
  bbox,
  minZoom,
  maxZoom,
  tileCount,
  scale,
  enabled = true,
}: TilesSizeEstimateParams): TilesSizeEstimate {
  // the average is kept per tile and keyed by layer so that editing the area or
  // the zoom range rescales the shown size right away, while the fresh samples
  // are still on their way
  const [sample, setSample] = useState<{ key: string; bytesPerTile: number }>();

  const [sampling, setSampling] = useState(false);

  const bboxKey = bbox?.join(',');

  const tileCountRef = useRef(tileCount);

  tileCountRef.current = tileCount;

  const key = `${urlTemplate}@${scale}`;

  useEffect(() => {
    if (
      !enabled ||
      !urlTemplate ||
      !bboxKey ||
      !Number.isFinite(tileCountRef.current) ||
      minZoom > maxZoom
    ) {
      setSampling(false);

      return;
    }

    const abortController = new AbortController();

    setSampling(true);

    const timeout = setTimeout(() => {
      sampleTilesSize({
        urlTemplate,
        bbox: bboxKey.split(',').map(Number) as [
          number,
          number,
          number,
          number,
        ],
        minZoom,
        maxZoom,
        scale,
        signal: abortController.signal,
      })
        .then((estimate) => {
          if (abortController.signal.aborted) {
            return;
          }

          const count = tileCountRef.current;

          if (estimate && count) {
            setSample({ key, bytesPerTile: estimate.totalBytes / count });
          }

          setSampling(false);
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setSampling(false);
          }
        });
    }, DEBOUNCE);

    return () => {
      clearTimeout(timeout);

      abortController.abort();
    };
  }, [enabled, urlTemplate, bboxKey, minZoom, maxZoom, scale, key]);

  const bytesPerTile = sample?.key === key ? sample.bytesPerTile : undefined;

  return {
    bytes:
      tileCount === undefined || !Number.isFinite(tileCount)
        ? undefined
        : bytesPerTile === undefined
          ? fallbackTilesSize(tileCount, scale ?? 1)
          : // the sampled average is fractional; bytes are not
            Math.round(bytesPerTile * tileCount),
    sampled: bytesPerTile !== undefined,
    sampling,
  };
}
