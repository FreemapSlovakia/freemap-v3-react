import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import {
  startProgress,
  stopProgress,
} from '@features/progress/model/actions.js';
import { tileToGeoJSON } from '@mapbox/tilebelt';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import type { LatLon } from '@shared/types/common.js';
import {
  stringifyFeatureId,
  syntheticFeatureId,
} from '@shared/types/featureId.js';
import {
  PhotonResponseSchema,
  photonLang,
} from '@shared/types/photonResult.js';
import { bboxPolygon } from '@turf/bbox-polygon';
import { feature, point } from '@turf/helpers';
import type { BBox } from 'geojson';
import { CRS, Point } from 'leaflet';
import {
  SEARCH_PROGRESS_ID,
  type SearchResult,
  searchLimitStep,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../actions.js';
import { photonToSearchResult } from '../resultUtils.js';

export const handle: ProcessorHandler<typeof searchSetQuery> = async ({
  dispatch,
  getState,
  action,
}) => {
  const { query } = action.payload;

  // None of the four attempts below needs a server; `isLocalSearchQuery` says
  // which queries they cover, and the search box reads it to know what it can
  // still offer offline — keep the two in step.

  // try GeoJSON

  try {
    const geojson = JSON.parse(query);

    if (
      !geojson ||
      typeof geojson !== 'object' ||
      typeof geojson.type !== 'string'
    ) {
      throw 1;
    }

    dispatch(
      searchSetResults([
        {
          source: 'geojson',
          id: syntheticFeatureId(),
          geojson,
        },
      ]),
    );

    return;
  } catch {
    // ignore
  }

  // try BBox

  const parts = query.split(/\s*,\s*|\s+/).map((n) => parseFloat(n));

  if (parts.length === 4 && parts.every((part) => !Number.isNaN(part))) {
    const reproj = () => {
      const p1 = CRS.EPSG3857.unproject(new Point(parts[0], parts[1]));

      const p2 = CRS.EPSG3857.unproject(new Point(parts[2], parts[3]));

      return [p1.lng, p1.lat, p2.lng, p2.lat] as BBox;
    };

    dispatch(
      searchSetResults([
        {
          source: 'bbox',
          id: syntheticFeatureId(),
          geojson: bboxPolygon(
            parts.some((p) => Math.abs(p) > 180) ? reproj() : (parts as BBox),
          ),
          displayName: parts.join(', '),
        },
      ]),
    );

    return;
  }

  // try tile

  const m = /^\s*(\d+)\/(\d+)\/(\d+)\s*$/.exec(query);

  if (m) {
    const poly = tileToGeoJSON([Number(m[2]), Number(m[3]), Number(m[1])]);

    if (poly) {
      dispatch(
        searchSetResults([
          {
            source: 'tile',
            id: syntheticFeatureId(),
            geojson: feature(poly),
            zoom: Number(m[1]),
            displayName: query.trim(),
          },
        ]),
      );

      return;
    }
  }

  // try human-readable GPS coordinates

  let coords: LatLon | undefined;

  try {
    coords = parseCoordinates(query);
  } catch {
    // bad format
  }

  if (coords) {
    dispatch(
      searchSetResults([
        {
          source: 'coords',
          id: syntheticFeatureId(),
          geojson: point([coords.lon, coords.lat]),
          displayName: query.toUpperCase(),
        },
      ]),
    );

    return;
  }

  // do geocoding

  const { autocomplete, fromUrl } = action.payload;

  const limit = action.payload.limit ?? searchLimitStep;

  // Photon ranks by distance from the given point as well as by relevance. A
  // query from the URL names a place outright, so it is left unbiased.
  const biasMap = fromUrl ? undefined : await mapPromise;

  let results: SearchResult[];

  let more = false;

  dispatch(startProgress(SEARCH_PROGRESS_ID));

  try {
    const res = await httpRequest({
      getState,
      url:
        process.env['PHOTON_URL'] +
        '/api?' +
        objectToURLSearchParams({
          q: query,
          // Never left out: without it Photon reads `Accept-Language`, which the
          // vhost blanks precisely so one URL means one thing to the cache.
          lang: photonLang(getState().l10n.language),
          limit,
          // Coarsened to ~100 m: the URL is the geocoder's cache key, and at
          // full precision no two people ever share one — the same word from
          // centres a metre apart misses, which is the traffic the 24 h cache
          // is there to absorb. Ranking cannot tell the difference.
          lat: biasMap && round(biasMap.getCenter().lat),
          lon: biasMap && round(biasMap.getCenter().lng),
          // How wide around that point to prefer. Photon assumes 12 — a region
          // — however close the map actually is, so someone looking at one
          // street gets the same spread as someone looking at a country.
          // Rounded because a fractional zoom step can leave it between levels.
          zoom: biasMap && Math.round(biasMap.getZoom()),
        }),
      expectedStatus: 200,
      cancelActions: [clearMapFeatures, searchSetQuery],
    });

    // Photon serves one OSM element more than once — Nominatim holds a row per
    // classifying tag, so a relation tagged `boundary=cadastral` *and*
    // `place=cadastral_community` (every Slovak cadastral community) is indexed
    // twice. Both copies answer to the same id: the same React key in the list,
    // and the same element for anything that looks a result up by it. The first
    // is kept, Photon's own ranking deciding which that is.
    const byId = new Map<string, SearchResult>();

    const { features } = PhotonResponseSchema.parse(await res.json());

    for (const feature of features) {
      const result = photonToSearchResult(feature, 'nominatim-forward');

      const key = stringifyFeatureId(result.id);

      if (!byId.has(key)) {
        byId.set(key, result);
      }
    }

    results = [...byId.values()];

    // Read off what the geocoder sent, not off what survived the dedupe: a
    // full page holding a duplicate arrives shorter than it was asked for and
    // would otherwise read as the end of the results.
    more = features.length >= limit;
  } catch (err) {
    if (!autocomplete) {
      throw err;
    }

    // The next keystroke asks again; a failed suggestion is not worth a toast.
    return;
  } finally {
    dispatch(stopProgress(SEARCH_PROGRESS_ID));
  }

  // Aborting reaches only a request still in flight, so one that already
  // answered would otherwise replace the list with results for a query the box
  // has since moved on from.
  if (getState().search.query !== query) {
    return;
  }

  dispatch(searchSetResults(results, more));

  if (fromUrl && results[0]) {
    dispatch(searchSelectResult({ result: results[0] }));
  }
};

/** Three decimals — a shade over 100 m of latitude. */
function round(deg: number): number {
  return Math.round(deg * 1000) / 1000;
}
