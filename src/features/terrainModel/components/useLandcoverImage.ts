import type { Bbox } from '@features/mapArea/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { useEffect, useState } from 'react';
import { computeLandcover } from '../model/generate.js';
import type { LandcoverImage, ModelGrid } from '../model/landcover.js';
import type { Paint } from '../model/paint.js';

type Done = {
  paint: Paint;
  bbox: Bbox;
  gridKey: string;
  image?: LandcoverImage;
};

/**
 * The area view's landcover image, made in a worker on the model's own grid
 * while `paint` is given; the last one of the same area stays while the next
 * is made.
 */
export function useLandcoverImage(
  paint: Paint | undefined,
  bbox: Bbox | undefined,
  grid: ModelGrid | undefined,
): { image?: LandcoverImage; drawing: boolean } {
  const [done, setDone] = useState<Done | null>(null);

  // By value: the plan is a new object on every render.
  const gridKey = grid
    ? `${grid.cols}|${grid.rows}|${grid.widthMm}|${grid.depthMm}`
    : '';

  const current =
    done?.paint === paint && done?.bbox === bbox && done?.gridKey === gridKey;

  useEffect(() => {
    // Made already, as when a built model is dropped unchanged.
    if (!paint || !bbox || !gridKey || current) {
      return;
    }

    const [cols = 0, rows = 0, widthMm = 0, depthMm = 0] = gridKey
      .split('|')
      .map(Number);

    // TODO: every colour or detail step copies all the polygons to a new
    // worker; one kept per area would need only the palette and the detail.
    const job = computeLandcover({
      bbox,
      paint,
      grid: { cols, rows, widthMm, depthMm },
    });

    job.promise.then(
      ({ image }) => setDone({ paint, bbox, gridKey, image }),
      (err: unknown) => {
        if (!isAbortError(err)) {
          // TODO: the preview then shows no landcover and says nothing.
          console.error(err);

          setDone({ paint, bbox, gridKey });
        }
      },
    );

    return job.cancel;
  }, [paint, bbox, gridKey, current]);

  return {
    image: paint && done && done.bbox === bbox ? done.image : undefined,
    drawing: paint !== undefined && !current,
  };
}
