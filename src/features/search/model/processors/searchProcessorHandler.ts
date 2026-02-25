import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { tileToGeoJSON } from '@mapbox/tilebelt';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import type { LatLon } from '@shared/types/common.js';
import { NominatimResult } from '@shared/types/nominatimResult.js';
import { bboxPolygon } from '@turf/bbox-polygon';
import { feature, point } from '@turf/helpers';
import { BBox } from 'geojson';
import { CRS, Point } from 'leaflet';
import { assert } from 'typia';
import { parseCoordinates } from '../../../../shared/coordinatesParser.js';
import {
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../actions.js';

export const handle: ProcessorHandler<typeof searchSetQuery> = async ({
  dispatch,
  getState,
  action,
}) => {
  const { query } = action.payload;

  if (!query) {
    return;
  }

  window._paq.push(['trackEvent', 'Search', 'search', query.slice(64)]);

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
          id: { type: 'other' },
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

  if (parts.length === 4 && parts.every((part) => !isNaN(part))) {
    const reproj = () => {
      const p1 = CRS.EPSG3857.unproject(new Point(parts[0], parts[1]));

      const p2 = CRS.EPSG3857.unproject(new Point(parts[2], parts[3]));

      return [p1.lng, p1.lat, p2.lng, p2.lat] as BBox;
    };

    dispatch(
      searchSetResults([
        {
          source: 'bbox',
          id: { type: 'other' },
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
            id: { type: 'other' },
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
          id: { type: 'other' },
          geojson: point([coords.lon, coords.lat]),
          displayName: query.toUpperCase(),
        },
      ]),
    );

    return;
  }

  // do geocoding

  const res = await httpRequest({
    getState,
    url:
      'https://nominatim.openstreetmap.org/search?' +
      objectToURLSearchParams({
        q: query,
        format: 'json',
        polygon_geojson: 1,
        extratags: 1,
        namedetails: 0, // TODO maybe use some more details
        limit: 20,
        'accept-language': getState().l10n.language,
        viewbox: action.payload.fromUrl
          ? undefined
          : (await mapPromise).getBounds().toBBoxString(),
        email: 'martin.zdila@freemap.sk',
      }),
    expectedStatus: 200,
    cancelActions: [clearMapFeatures, searchSetQuery],
  });

  const results = assert<NominatimResult[]>(await res.json()).map(
    (item, i): SearchResult => {
      return {
        source: 'nominatim-forward',
        id:
          item.osm_type !== undefined && item.osm_id !== undefined
            ? { type: 'osm', elementType: item.osm_type, id: item.osm_id }
            : { type: 'other', id: i },
        incomplete: true,
        displayName: item.display_name,
        geojson: feature(
          item.geojson ?? null,
          {
            [item.class]: item.type,
            name: item.name,
            ...item.extratags,
          },
          item.boundingbox
            ? {
                bbox: [
                  Number(item.boundingbox[2]),
                  Number(item.boundingbox[1]),
                  Number(item.boundingbox[3]),
                  Number(item.boundingbox[0]),
                ],
              }
            : undefined,
        ),
      };
    },
  );

  dispatch(searchSetResults(results));

  if (action.payload.fromUrl && results[0]) {
    dispatch(searchSelectResult({ result: results[0] }));
  }
};
