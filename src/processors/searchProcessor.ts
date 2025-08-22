import { tileToGeoJSON } from '@mapbox/tilebelt';
import { bboxPolygon } from '@turf/bbox-polygon';
import { feature, point } from '@turf/helpers';
import { BBox } from 'geojson';
import { CRS, Point } from 'leaflet';
import { assert } from 'typia';
import { clearMapFeatures } from '../actions/mainActions.js';
import {
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../actions/searchActions.js';
import { parseCoordinates } from '../coordinatesParser.js';
import { httpRequest } from '../httpRequest.js';
import { mapPromise } from '../leafletElementHolder.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { objectToURLSearchParams } from '../stringUtils.js';
import type { LatLon } from '../types/common.js';
import { NominatimResult } from '../types/nominatimResult.js';

export const searchProcessor: Processor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  errorKey: 'search.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
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

      dispatch(searchSetResults([{ id: { type: 'other', id: 0 }, geojson }]));

      return;
    } catch {
      // ignore
    }

    // try BBox

    const parts = query.split(/\s*,\s*|\s+/).map((n) => parseFloat(n));

    if (parts.length === 4 && parts.every((part) => !isNaN(part))) {
      const tags = { name: 'BBox ' + parts.join(', ') };

      const reproj = () => {
        const p1 = CRS.EPSG3857.unproject(new Point(parts[0], parts[1]));

        const p2 = CRS.EPSG3857.unproject(new Point(parts[2], parts[3]));

        return [p1.lng, p1.lat, p2.lng, p2.lat] as BBox;
      };

      dispatch(
        searchSetResults([
          {
            id: { type: 'other', id: 0 },
            geojson: bboxPolygon(
              parts.some((p) => Math.abs(p) > 180) ? reproj() : (parts as BBox),
              { properties: tags },
            ),
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
              id: { type: 'other', id: 0 },
              geojson: feature(poly, {
                name: query.trim(),
              }),
              zoom: Number(m[1]),
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
            id: { type: 'other', id: 0 },
            geojson: point([coords.lon, coords.lat], {
              name: query.toUpperCase(),
            }),
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
      (item): SearchResult => {
        return {
          id:
            item.osm_type !== undefined && item.osm_id !== undefined
              ? { type: item.osm_type, id: item.osm_id }
              : { type: 'other', id: Math.random() },
          geojson: feature(
            item.geojson ?? null,
            {
              [item.class]: item.type,
              name: item.name,
              ...item.extratags,
              display_name: item.display_name,
            },
            item.boundingbox
              ? {
                  bbox: item.boundingbox.map((a) => Number(a)) as BBox,
                }
              : undefined,
          ),
          incomplete: true,
        };
      },
    );

    dispatch(searchSetResults(results));

    if (action.payload.fromUrl && results[0]) {
      dispatch(searchSelectResult({ result: results[0] }));
    }
  },
};
