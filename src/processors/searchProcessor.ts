import { searchSetResults, searchSetQuery } from 'fm3/actions/searchActions';
import { clearMap } from 'fm3/actions/mainActions';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { LatLon } from 'fm3/types/common';
import { point } from '@turf/helpers';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export const searchProcessor: Processor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  errorKey: 'search.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const {
      search: { query },
      // l10n: { language },
    } = getState();

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
      url: `https://nominatim.openstreetmap.org/search/${encodeURIComponent(
        query,
      )}`,
      method: 'GET',
      params: {
        format: 'json',
        // eslint-disable-next-line
        polygon_geojson: 1,
        limit: 20,
        'accept-language': getState().l10n.language,
        viewbox: bbox,
      },
      expectedStatus: 200,
      cancelActions: [clearMap, searchSetQuery],
    });

    const results = data.map(d => {
      return {
        id: d.osm_id,
        label: d.display_name,
        geojson: d.geojson,
        lat: d.lat,
        lon: d.lon,
        class: d.class,
        type: d.type,
      };
    });

    dispatch(searchSetResults(results));
  },
};
