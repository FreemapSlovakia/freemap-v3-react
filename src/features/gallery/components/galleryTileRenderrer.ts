import type { LatLon } from '@shared/types/common.js';
import color from 'color';
import type { LatLng } from 'leaflet';
import { WIKIMEDIA_NO_DATA_MODES } from '../galleryUtils.js';
import { FALLBACK_LICENSE_COLOR, LICENSE_COLORS } from '../licenseColors.js';
import type { GalleryLicense } from '../licenseDefs.js';
import { GALLERY_COLOR, MUTED_COLOR, NO_DATA_COLOR } from '../markerColors.js';
import type { GalleryColorizeBy } from '../model/actions.js';

type Marble = LatLon & {
  rating: number;
  userId: number;
  createdAt: number;
  takenAt?: number | null;
  pano?: boolean;
  premium?: boolean;
  azimuth?: number;
  license?: string | null;
  // 0 = own gallery photo, 1 = Wikimedia Commons.
  source?: number;
};

type Props = {
  tile: HTMLCanvasElement | OffscreenCanvas;
  zoom: number;
  dpr: number;
  colorizeBy: GalleryColorizeBy | null;
  showDirection: boolean;
  data: Marble[];
  myUserId: number | null;
  size: { x: number; y: number };
  pointB: LatLng;
  pointA: LatLng;
};

type SortMarble = {
  sort: number;
  value: Marble;
};

function compare(a: SortMarble, b: SortMarble) {
  const v = a.sort - b.sort;

  return v === 0 ? (a.value.pano ? 1 : 0) - (b.value.pano ? 1 : 0) : v;
}

function sort(data: Marble[], toSort: (m: Marble) => number) {
  return data
    .map((a) => ({ sort: toSort(a), value: a }))
    .sort(compare)
    .map((a) => a.value);
}

type MarkerShape = 'circle' | 'square' | 'panorama';

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// Marker shape is an always-present channel, independent of the colorize fill,
// mirroring the importance hierarchy: round vs. angular is the primary (always
// clear) split, aspect ratio the secondary one.
//   circle   = Wikimedia photo — by far the most common, so the calm default
//   square   = our own photo
//   panorama = our own panorama — a wide, short rectangle (literally panoramic)
// Wikimedia is never a panorama for us, so there are only these three states.
function shapeOf(source?: number, pano?: boolean): MarkerShape {
  if (source) {
    return 'circle';
  }

  return pano ? 'panorama' : 'square';
}

// Panorama rectangle half-extents (× the circle radius): wider and shorter than
// the square. `PANO_CURVED` bows its top and bottom edges inward so it reads
// even more like a panoramic frame — a prototype toggle to compare on the map.
const PANO_HALF_W = 1.45;
const PANO_HALF_H = 0.95;
const PANO_CURVED = true;

/** Trace a marker of circle-radius `r`, centered on its visual center (x, y). */
function traceMarker(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  shape: MarkerShape,
): void {
  ctx.beginPath();

  if (shape === 'square') {
    ctx.rect(x - r, y - r, 2 * r, 2 * r);
  } else if (shape === 'panorama') {
    const hw = r * PANO_HALF_W;
    const hh = r * PANO_HALF_H;

    if (PANO_CURVED) {
      const c = r * 0.5; // inward bow of the top and bottom edges

      ctx.moveTo(x - hw, y - hh);
      ctx.quadraticCurveTo(x, y - hh + c, x + hw, y - hh);
      ctx.lineTo(x + hw, y + hh);
      ctx.quadraticCurveTo(x, y + hh - c, x - hw, y + hh);
      ctx.closePath();
    } else {
      ctx.rect(x - hw, y - hh, 2 * hw, 2 * hh);
    }
  } else {
    ctx.arc(x, y, r, 0, 2 * Math.PI);
  }
}

export function renderGalleryTile({
  tile,
  zoom,
  dpr,
  colorizeBy,
  showDirection,
  data,
  myUserId,
  size,
  pointB,
  pointA,
}: Props): void {
  const ctx = tile.getContext('2d');

  if (!ctx) {
    throw new Error('no context');
  }

  const zk = Math.min(1, 1.1 ** zoom / 3);

  ctx.scale(dpr, dpr);

  ctx.strokeStyle = '#000';

  ctx.lineWidth = zk; // zoom > 9 ? 1.5 : 1;

  const k = 2 ** zoom;

  const s = new Set();

  const items: Marble[] =
    colorizeBy === 'userId'
      ? sort(data, () => Math.random())
      : colorizeBy === 'takenAt' ||
          colorizeBy === 'createdAt' ||
          colorizeBy === 'rating'
        ? sort(data, (a) => Number(a[colorizeBy]))
        : colorizeBy === 'mine'
          ? sort(data, (a) => (a.userId === myUserId ? 1 : 0))
          : colorizeBy === 'premium'
            ? sort(data, (a) => (a.premium ? 1 : 0))
            : // No colorize (or a mode without its own order): own photos on top
              // of (and winning the pixel dedup against) Wikimedia ones.
              sort(data, (a) => (a.source ? 0 : 1));

  // remove "dense" pictures
  const marbles: Marble[] = items
    .reverse()
    .map(({ lat, lon, ...rest }) => {
      return {
        lat: Math.round(lat * k),
        lon: Math.round(lon * k),
        ...rest,
      };
    })
    .filter(({ lat, lon }) => {
      const key = `${lat},${lon}`;

      const has = s.has(key);

      if (!has) {
        s.add(key);
      }

      return !has;
    })
    .map(({ lat, lon, ...rest }) => ({
      lat: lat / k,
      lon: lon / k,
      ...rest,
    }))
    .reverse();

  for (const { lat, lon, pano, azimuth, source } of marbles) {
    const y =
      size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;

    const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

    if (showDirection && azimuth !== undefined) {
      const az = azimuth * (Math.PI / 180) - (3 * Math.PI) / 4;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 13.5 * zk * Math.cos(az), y + 13.5 * zk * Math.sin(az));
      ctx.arc(x, y, 13.5 * zk, az, az + Math.PI / 2);
      ctx.closePath();
      ctx.fillStyle = '#0000ff20';
      ctx.fill();
    }

    traceMarker(ctx, x, y, 4 * zk, shapeOf(source, pano));

    ctx.stroke();
  }

  ctx.fillStyle = '#ff0';

  ctx.lineWidth = 0.25 * zk; // zoom > 9 ? 1.5 : 1;

  const now = Date.now() / 1000;

  for (const {
    lat,
    lon,
    rating,
    createdAt,
    takenAt,
    userId,
    pano,
    premium,
    license,
    source,
  } of marbles) {
    const y =
      size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;

    const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

    traceMarker(ctx, x, y, 3.5 * zk, shapeOf(source, pano));

    if (source && colorizeBy && WIKIMEDIA_NO_DATA_MODES.has(colorizeBy)) {
      // Wikimedia photos have no author/date/season/license data of ours.
      ctx.fillStyle = NO_DATA_COLOR;
    } else {
      switch (colorizeBy) {
        case 'userId':
          ctx.fillStyle = color.lch(90, 70, -userId * 11313).hex();

          break;

        case 'rating':
          ctx.fillStyle = color
            .hsv(60, 100, (Math.tanh(rating - 2.5) + 1) * 50)
            .hex();

          break;

        case 'createdAt':
        case 'takenAt': {
          const v = colorizeBy === 'createdAt' ? createdAt : takenAt;

          ctx.fillStyle = v
            ? color
                .hsl(
                  60,
                  100,
                  (() => {
                    const y = (now - v) / 60 / 60 / 24 / 365;
                    return 100 - (0.333 * y * 100) / (1 + 0.333 * y);
                  })(),
                )
                .hex()
            : NO_DATA_COLOR;

          break;
        }

        case 'season':
          {
            if (!takenAt) {
              ctx.fillStyle = NO_DATA_COLOR;

              break;
            }

            const hs = 366 / 4;

            type Color = [number, number, number];

            const winter: Color = [70, -5, -52];

            const spring: Color = [70, -62, 42];

            const summer: Color = [90, -4, 74];

            const fall: Color = [70, 48, 43];

            // 2_847_600
            const x = ((takenAt - 1_206_000) % 31_557_600) / 60 / 60 / 24;

            const fill = (from: Color, to: Color, n: number) => {
              ctx.fillStyle = color
                .lab(...[0, 1, 2].map((i) => from[i] * (1 - n) + to[i] * n))
                .hex();
            };

            if (x < hs) {
              fill(winter, spring, x / hs);
            } else if (x < 2 * hs) {
              fill(spring, summer, (x - hs) / hs);
            } else if (x < 3 * hs) {
              fill(summer, fall, (x - 2 * hs) / hs);
            } else {
              fill(fall, winter, (x - 3 * hs) / hs);
            }
          }

          break;

        case 'mine':
          ctx.fillStyle = userId === myUserId ? GALLERY_COLOR : MUTED_COLOR;

          break;

        case 'premium':
          ctx.fillStyle = premium ? GALLERY_COLOR : MUTED_COLOR;

          break;

        case 'license':
          ctx.fillStyle =
            (license && LICENSE_COLORS[license as GalleryLicense]) ||
            FALLBACK_LICENSE_COLOR;

          break;

        default:
          // No colorize: a single fill — the marker shape shows the source.
          ctx.fillStyle = GALLERY_COLOR;

          break;
      }
    }

    ctx.fill();

    ctx.stroke();
  }
}
