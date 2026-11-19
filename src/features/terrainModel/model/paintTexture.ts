import type { Bbox } from '@features/mapArea/model/actions.js';
import type { Paint } from './paint.js';
import { worldPixels } from './tileGrid.js';

const SIDE = 2048;

/**
 * The area view's texture with the coloured features drawn on it: over the map
 * draped there, else over the ground colour. Web Mercator, as `mapTexture`.
 */
export function paintTexture(
  base: HTMLCanvasElement | null,
  bbox: Bbox,
  paint: Paint,
  widthMm: number,
): HTMLCanvasElement {
  const [west, south, east, north] = bbox;

  const { px, py } = worldPixels(0);

  const w = px(east) - px(west);

  const h = py(south) - py(north);

  const canvas = document.createElement('canvas');

  canvas.width =
    base?.width ?? Math.max(1, Math.round((SIDE * w) / Math.max(w, h)));

  canvas.height =
    base?.height ?? Math.max(1, Math.round((SIDE * h) / Math.max(w, h)));

  const ctx = canvas.getContext('2d')!;

  if (base) {
    ctx.drawImage(base, 0, 0);
  } else {
    ctx.fillStyle = paint.palette[0]!;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const x = (lon: number) => ((px(lon) - px(west)) / w) * canvas.width;

  const y = (lat: number) => ((py(lat) - py(north)) / h) * canvas.height;

  const pxPerMm = canvas.width / widthMm;

  const trace = (coords: number[][]) => {
    coords.forEach(([lon, lat], i) => {
      if (i === 0) {
        ctx.moveTo(x(lon!), y(lat!));
      } else {
        ctx.lineTo(x(lon!), y(lat!));
      }
    });
  };

  for (const { colour, rings } of paint.fills) {
    ctx.fillStyle = paint.palette[colour]!;

    ctx.beginPath();

    for (const ring of rings) {
      trace(ring);

      ctx.closePath();
    }

    ctx.fill('evenodd');
  }

  // TODO: the model widens a line to a grid cell (`minR` in `paint.ts`); a
  // thin line on a coarse grid looks finer here than it prints.
  ctx.lineWidth = paint.lineWidthMm * pxPerMm;

  ctx.lineCap = 'round';

  ctx.lineJoin = 'round';

  for (const { colour, coords } of paint.lines) {
    ctx.strokeStyle = paint.palette[colour]!;

    ctx.beginPath();

    trace(coords);

    // A dot.
    if (coords.length === 1) {
      ctx.lineTo(x(coords[0]![0]!), y(coords[0]![1]!));
    }

    ctx.stroke();
  }

  for (const { colour, coords } of paint.points) {
    ctx.fillStyle = paint.palette[colour]!;

    ctx.beginPath();

    ctx.arc(
      x(coords[0]!),
      y(coords[1]!),
      (paint.pointSizeMm * pxPerMm) / 2,
      0,
      2 * Math.PI,
    );

    ctx.fill();
  }

  return canvas;
}
