import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { FeatureCollection } from 'geojson';
import z from 'zod';
import { parseDataBuffer, parseDataFile } from './parseDataFile.js';

/**
 * Where a link's track is fetched from: a track stored on our server by an
 * older build (`track-uid=`), or a file anywhere (`import-url=`).
 */
export type RemoteSource = { trackUID: string } | { gpxUrl: string };

/** The source a map document or working copy names, if any. */
export function remoteSourceOf(
  named: { trackUID?: string | null; gpxUrl?: string | null } | undefined,
): RemoteSource | undefined {
  return named?.trackUID
    ? { trackUID: named.trackUID }
    : named?.gpxUrl
      ? { gpxUrl: named.gpxUrl }
      : undefined;
}

/** The source's track, or `null` when it holds nothing usable. Throws on a failed fetch. */
export async function fetchRemoteTrack(
  source: RemoteSource,
  getState: () => RootState,
): Promise<FeatureCollection | null> {
  if ('trackUID' in source) {
    const res = await httpRequest({
      getState,
      url: `/tracklogs/${source.trackUID}`,
    });

    const gpx = decodeURIComponent(
      escape(atob(z.object({ data: z.string() }).parse(await res.json()).data)),
    );

    return parseDataFile(gpx, `${source.trackUID}.gpx`);
  }

  const res = await httpRequest({
    getState,
    url: source.gpxUrl,
    expectedStatus: 200,
  });

  return parseDataBuffer(await res.arrayBuffer(), source.gpxUrl);
}
