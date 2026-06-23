import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { ActionCreatorMatchable } from '@shared/cancelRegister.js';
import { along } from '@turf/along';
import { distance } from '@turf/distance';
import { getCoord, getCoords } from '@turf/invariant';
import { length } from '@turf/length';
import type { Feature, LineString, Position } from 'geojson';
import z from 'zod';

const ElevationsSchema = z.array(z.number().nullable());

/**
 * Resolves elevation for a batch of `[lat, lon]` pairs via the elevation API.
 * Returns one value (or `null` where the API has no data) per input pair, in
 * the same order. An empty input resolves to an empty array without a request.
 */
export async function fetchElevations(
  latLons: [number, number][],
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
): Promise<(number | null)[]> {
  if (latLons.length === 0) {
    return [];
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/elevation',
    data: latLons,
    expectedStatus: 200,
    cancelActions,
  });

  return ElevationsSchema.parse(await res.json());
}

/**
 * Returns copies of the given `LineString` features with elevation filled from
 * the server. `mode: 'missing'` fills only coordinates that lack a `z` ordinate
 * (length < 3); `mode: 'all'` overwrites every `z`. Coordinates the API has no
 * data for are left unchanged. Inputs are never mutated. With `'missing'` and
 * nothing to fill the input array is returned as-is (no request).
 */
export async function enrichElevations(
  features: Feature<LineString>[],
  mode: 'missing' | 'all',
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
): Promise<Feature<LineString>[]> {
  const enriched = features.map((feature) => ({
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: feature.geometry.coordinates.map((coord) => coord.slice()),
    },
  }));

  // Direct references into the cloned coordinates so we can write `z` back in
  // input order after the single batched request.
  const targets = enriched.flatMap((feature) =>
    feature.geometry.coordinates.filter(
      (coord) => mode === 'all' || coord.length < 3,
    ),
  );

  if (targets.length === 0) {
    return features;
  }

  const eles = await fetchElevations(
    targets.map((coord) => [coord[1]!, coord[0]!]),
    getState,
    cancelActions,
  );

  targets.forEach((coord, i) => {
    const ele = eles[i];

    if (ele != null) {
      coord[2] = ele;
    }
  });

  return enriched;
}

/**
 * Densifies a `LineString` for rendering: every segment long enough to draw as
 * a coarse straight line gets intermediate points inserted at roughly screen
 * resolution, each DEM-sampled from the elevation API. Existing vertices keep
 * their elevation; only the inserted points are sampled. A dense line (no
 * segment long enough) is a no-op and the same feature reference is returned.
 *
 * Per-point series (`coordTimes`, `coordinateProperties`) are dropped — they
 * can't be meaningfully interpolated onto inserted points — so this output is
 * for elevation-derived rendering (chart, elevation/steepness colorize,
 * climb/descent stats), not for export.
 */
export async function densifyAlong(
  feature: Feature<LineString>,
  getState: () => RootState,
  cancelActions?: ActionCreatorMatchable[],
): Promise<Feature<LineString>> {
  const coords = getCoords(feature);

  if (coords.length < 2) {
    return feature;
  }

  const totalKm = length(feature);

  // ~2 px per sample at the current viewport width, never finer than 100 m.
  const stepKm = Math.min(0.1, totalKm / (window.innerWidth / 2));

  if (!(stepKm > 0)) {
    return feature;
  }

  // Points to insert, tagged with the vertex they follow, so one batched
  // request fills them all.
  const inserts: { after: number; lon: number; lat: number }[] = [];

  let cumKm = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const segKm = distance(coords[i], coords[i + 1], { units: 'kilometers' });

    // Only subdivide segments that would otherwise span several pixels.
    if (segKm > stepKm * 2) {
      const parts = Math.round(segKm / stepKm);

      for (let k = 1; k < parts; k++) {
        const [lon, lat] = getCoord(
          along(feature, cumKm + (segKm * k) / parts, {
            units: 'kilometers',
          }),
        );

        inserts.push({ after: i, lon, lat });
      }
    }

    cumKm += segKm;
  }

  if (inserts.length === 0) {
    return feature;
  }

  const eles = await fetchElevations(
    inserts.map(({ lat, lon }) => [lat, lon]),
    getState,
    cancelActions,
  );

  const out: Position[] = [];

  let ins = 0;

  for (let i = 0; i < coords.length; i++) {
    out.push(coords[i].slice());

    while (ins < inserts.length && inserts[ins].after === i) {
      const { lon, lat } = inserts[ins];

      const ele = eles[ins];

      out.push(ele == null ? [lon, lat] : [lon, lat, ele]);

      ins++;
    }
  }

  const properties = { ...(feature.properties ?? {}) };

  delete properties['coordTimes'];

  delete properties['coordinateProperties'];

  return {
    type: 'Feature',
    properties,
    geometry: { type: 'LineString', coordinates: out },
  };
}
