import { searchSetResults, searchSetQuery } from 'fm3/actions/searchActions';
import { clearMap } from 'fm3/actions/mainActions';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { latLonToString } from 'fm3/geoutils';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { LatLon } from 'fm3/types/common';
import { point } from '@turf/helpers';

export const searchProcessor: IProcessor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  errorKey: 'search.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const {
      search: { query },
      l10n: { language },
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
            tags: {
              name: latLonToString(coords, language),
              type: 'Point',
            },
          },
        ]),
      );

      return;
    }

    const { data } = await httpRequest({
      getState,
      url: `//old.freemap.sk/api/0.3/searchhint/${encodeURIComponent(query)}`,
      method: 'GET',
      params: {
        max_count: 10,
      },
      expectedStatus: 200,
      cancelActions: [clearMap, searchSetQuery],
    });

    const results = (data.results || []).map((d, id) => {
      const geometryType = d.geometry.type;
      let centerLonlat;
      if (geometryType === 'Point') {
        centerLonlat = d.geometry.coordinates;
      } else if (geometryType === 'MultiLineString') {
        [[centerLonlat]] = d.geometry.coordinates;
      } else {
        [centerLonlat] = d.geometry.coordinates;
      }
      const [centerLon, centerLat] = centerLonlat;
      const { name } = d.properties;
      return {
        id,
        label: name,
        geojson: d.geometry,
        lat: centerLat,
        lon: centerLon,
        tags: { name, type: geometryType },
      };
    });

    dispatch(searchSetResults(results));
  },
};
