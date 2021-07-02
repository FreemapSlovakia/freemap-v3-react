import color from 'color';
import { GalleryColorizeBy } from 'fm3/actions/galleryActions';
import { LatLon } from 'fm3/types/common';
import { LatLng } from 'leaflet';

type Sortable<T = unknown> = {
  sort: number;
  value: T;
};

type Props = {
  tile: HTMLCanvasElement | OffscreenCanvas;
  zoom: number;
  dpr: number;
  colorizeBy: GalleryColorizeBy | null;
  data: any[];
  myUserId: number | null;
  size: { x: number; y: number };
  pointB: LatLng;
  pointA: LatLng;
};

export function renderGalleryTile({
  tile,
  zoom,
  dpr,
  colorizeBy,
  data,
  myUserId,
  size,
  pointB,
  pointA,
}: Props): void {
  const ctx = tile.getContext('2d');

  if (!ctx) {
    throw Error('no context');
  }

  const zk = Math.min(1, 1.1 ** zoom / 3);

  ctx.scale(dpr, dpr);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#ff0';
  ctx.lineWidth = 1 * zk; // zoom > 9 ? 1.5 : 1;

  const k = 2 ** zoom;

  const s = new Set();

  if (colorizeBy === 'userId') {
    data = data
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
      .map((a: Sortable) => a.value);
  } else if (
    colorizeBy === 'takenAt' ||
    colorizeBy === 'createdAt' ||
    colorizeBy === 'rating'
  ) {
    data = data
      .map((a) => ({ sort: a[colorizeBy], value: a }))
      .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
      .map((a: Sortable) => a.value);
  } else if (colorizeBy === 'mine') {
    data = data
      .map((a) => ({
        sort: a.userId === myUserId ? 1 : 0,
        value: a,
      }))
      .sort((a: Sortable, b: Sortable) => a.sort - b.sort)
      .map((a: Sortable) => a.value);
  }

  // remove "dense" pictures
  data = data
    .reverse()
    .map(({ lat, lon, ...rest }: LatLon) => {
      return {
        lat: Math.round(lat * k),
        lon: Math.round(lon * k),
        ...rest,
      };
    })
    .filter(({ lat, lon }: LatLon) => {
      const key = `${lat},${lon}`;
      const has = s.has(key);
      if (!has) {
        s.add(key);
      }
      return !has;
    })
    .map(({ lat, lon, ...rest }: LatLon) => ({
      lat: lat / k,
      lon: lon / k,
      ...rest,
    }))
    .reverse();

  data.forEach(({ lat, lon }: LatLon) => {
    const y =
      size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
    const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

    ctx.beginPath();
    ctx.arc(x, y, 4 * zk, 0, 2 * Math.PI);

    ctx.stroke();
  });

  ctx.lineWidth = 0.25 * zk; // zoom > 9 ? 1.5 : 1;

  const now = Date.now() / 1000;

  data.forEach(
    ({
      lat,
      lon,
      rating,
      createdAt,
      takenAt,
      userId,
    }: LatLon & {
      rating: number;
      userId: number;
      createdAt: number;
      takenAt?: number | null;
    }) => {
      const y =
        size.y - ((lat - pointB.lat) / (pointA.lat - pointB.lat)) * size.y;
      const x = ((lon - pointA.lng) / (pointB.lng - pointA.lng)) * size.x;

      ctx.beginPath();
      ctx.arc(x, y, 3.5 * zk, 0, 2 * Math.PI);

      switch (colorizeBy) {
        case 'userId':
          ctx.fillStyle = color.lch(90, 70, -userId * 11313).hex();
          break;
        case 'rating':
          ctx.fillStyle = color
            .hsv(60, 100, (Math.tanh(rating - 2.5) + 1) * 50)
            .hex();
          break;
        case 'takenAt':
          ctx.fillStyle = !takenAt
            ? '#a22'
            : color
                .hsl(
                  60,
                  100,
                  // 100 - ((now - takenAt) * 10) ** 0.2,
                  100 - ((now - takenAt) * 100) ** 0.185,
                )
                .hex();
        case 'createdAt':
          ctx.fillStyle = color
            .hsl(
              60,
              100,
              // 100 - ((now - createdAt) * 10) ** 0.2,
              100 - ((now - createdAt) * 100) ** 0.185,
            )
            .hex();
          break;
        case 'mine':
          ctx.fillStyle = userId === myUserId ? '#ff0' : '#fa4';
          break;
      }

      ctx.fill();
      ctx.stroke();
    },
  );
}
