import { point } from '@turf/helpers';
import { clearMap } from 'fm3/actions/mainActions';
import {
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/authAxios';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { LatLon } from 'fm3/types/common';
import { GeoJsonObject } from 'geojson';
import { assertType } from 'typescript-is';

interface NominatimResult {
  osm_id: number;
  geojson: GeoJsonObject;
  osm_type: 'node' | 'way' | 'relation';
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
}

export const searchProcessor: Processor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  errorKey: 'search.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const { query } = action.payload;
    // const {
    //   search: { query },
    //   // l10n: { language },
    // } = getState();

    if (!query) {
      return;
    }

    let coords: LatLon | undefined;
    try {
      coords = parseCoordinates(query);
    } catch (e) {
      // bad format
    }

    if (coords) {
      dispatch(
        searchSetResults([
          {
            id: -1,
            label: query.toUpperCase(),
            geojson: point([coords.lon, coords.lat]),
            lat: coords.lat,
            lon: coords.lon,
          },
        ]),
      );

      return;
    }

    const le = getMapLeafletElement();
    const bbox = le ? le.getBounds().toBBoxString() : undefined;

    const { data } = await httpRequest({
      getState,
      url: 'https://nominatim.openstreetmap.org/search',
      method: 'GET',
      params: {
        q: query,
        format: 'json',
        polygon_geojson: 1,
        limit: 20,
        'accept-language': getState().l10n.language,
        viewbox: action.payload.fromUrl ? undefined : bbox,
      },
      expectedStatus: 200,
      cancelActions: [clearMap, searchSetQuery],
    });

    const results = assertType<NominatimResult[]>(data)
      .filter(
        (item) =>
          item.osm_id && item.geojson && item.osm_type && item.lat && item.lon,
      )
      .map((item) => {
        return {
          id: item.osm_id,
          label: item.display_name,
          geojson: item.geojson,
          lat: Number.parseFloat(item.lat),
          lon: Number.parseFloat(item.lon),
          class: item.class,
          type: item.type,
          osmType: item.osm_type,
        };
      });

    dispatch(searchSetResults(results));

    if (action.payload.fromUrl && results[0]) {
      dispatch(searchSelectResult(results[0]));
    }
  },
};
