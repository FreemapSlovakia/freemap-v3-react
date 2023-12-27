import { tileToGeoJSON } from '@mapbox/tilebelt';
import bboxPolygon from '@turf/bbox-polygon';
import { feature, Geometries, GeometryCollection, point } from '@turf/helpers';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import { clearMap } from 'fm3/actions/mainActions';
import {
  SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { httpRequest } from 'fm3/httpRequest';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { LatLon } from 'fm3/types/common';
import { CRS, Point } from 'leaflet';
import { assert } from 'typia';

interface NominatimResult {
  osm_id?: number;
  osm_type?: 'node' | 'way' | 'relation';
  geojson?: Geometries | GeometryCollection;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  extratags?: null | Record<string, string>;
}

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

      dispatch(
        searchSetResults([
          {
            id: -1,
            geojson,
            osmType: 'relation',
            tags: { name: 'GeoJSON' },
            detailed: true,
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
      const tags = { name: 'BBox ' + parts.join(', ') };

      const reproj = () => {
        const p1 = CRS.EPSG3857.unproject(new Point(parts[0], parts[1]));

        const p2 = CRS.EPSG3857.unproject(new Point(parts[2], parts[3]));

        console.log(p1, p2);

        return [p1.lng, p1.lat, p2.lng, p2.lat] as BBox2d;
      };

      dispatch(
        searchSetResults([
          {
            id: -1,
            geojson: bboxPolygon(
              parts.some((p) => Math.abs(p) > 180)
                ? reproj()
                : (parts as BBox2d),
              {
                properties: tags,
              },
            ),
            osmType: 'relation',
            tags,
            detailed: true,
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
        const tags = {
          name: query.trim(),
        };

        dispatch(
          searchSetResults([
            {
              id: -1,
              geojson: feature(poly, tags),
              osmType: 'relation',
              tags,
              detailed: true,
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
    } catch (e) {
      // bad format
    }

    if (coords) {
      const tags = {
        name: query.toUpperCase(),
      };

      dispatch(
        searchSetResults([
          {
            id: -1,
            geojson: point([coords.lon, coords.lat], tags),
            osmType: 'node',
            tags,
            detailed: true,
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
        }),
      expectedStatus: 200,
      cancelActions: [clearMap, searchSetQuery],
    });

    const results = assert<NominatimResult[]>(await res.json())
      .filter(
        (item) =>
          item.osm_id && item.geojson && item.osm_type && item.lat && item.lon,
      )
      .map((item): SearchResult => {
        const tags = {
          name: item.display_name,
          [item.class]: item.type,
          ...item.extratags,
        };

        return {
          id: item.osm_id!,
          geojson: feature(item.geojson!, tags),
          osmType: item.osm_type!,
          tags,
        };
      });

    dispatch(searchSetResults(results));

    if (action.payload.fromUrl && results[0]) {
      dispatch(searchSelectResult({ result: results[0] }));
    }
  },
};
