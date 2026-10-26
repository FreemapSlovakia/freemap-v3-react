import { josmRemote } from '@features/openInExternalApp/josmRemote.js';
import type { Dispatch } from '@reduxjs/toolkit';
import { feature } from '@turf/helpers';
import type { Polygon } from 'geojson';
import z from 'zod';

export type TraceKind = 'streams' | 'forests';

export const TraceOutputSchema = z.enum(['josm', 'osm', 'geojson']);

export type TraceOutput = z.infer<typeof TraceOutputSchema>;

/** What a polygon's label says to open the trace modal by. */
export const TRACE_PHRASES: Record<TraceKind, string> = {
  streams: 'cry me a river',
  forests: 'run forest run',
};

const SERVICES: Record<TraceKind, string> = {
  streams: 'https://streamfinder.freemap.sk',
  forests: 'https://forester.freemap.sk',
};

/** The largest mask each service accepts, in m². */
export const TRACE_MAX_AREA: Record<TraceKind, number> = {
  streams: 200_000_000,
  forests: 800_000_000,
};

/** Traces `kind` within `mask`, holes left out: a download, or a new JOSM layer. */
export function runTrace(
  dispatch: Dispatch,
  kind: TraceKind,
  params: Record<string, string>,
  mask: Polygon,
  output: TraceOutput,
): void {
  // The mask travels in the URL, so it goes 2D and at about 1 cm precision.
  const round = (n: number) => Math.round(n * 1e7) / 1e7;

  const q = new URLSearchParams({
    ...params,
    mask: JSON.stringify(
      feature({
        type: 'Polygon',
        coordinates: mask.coordinates.map((ring) =>
          ring.map(([lon = 0, lat = 0]) => [round(lon), round(lat)]),
        ),
      }),
    ),
  });

  if (output !== 'geojson') {
    q.append('to-osm', '1');
  }

  const url = `${SERVICES[kind]}?${q.toString()}`;

  if (output === 'josm') {
    josmRemote(dispatch, 'import', { new_layer: 'true', url });
  } else {
    const aElem = document.createElement('a');

    aElem.href = url;

    aElem.target = '_blank';

    aElem.click();
  }
}
