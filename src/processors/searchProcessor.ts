import { searchSetResults, searchSetQuery } from 'fm3/actions/searchActions';
import { clearMap } from 'fm3/actions/mainActions';
import parseCoordinates from 'fm3/coordinatesParser';
import { formatGpsCoord } from 'fm3/geoutils';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { Point } from 'geojson';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const searchProcessor: IProcessor<typeof searchSetQuery> = {
  actionCreator: searchSetQuery,
  handle: async ({ dispatch, getState }) => {
    const {
      search: { query },
      l10n: { language },
    } = getState();

    if (!query) {
      return;
    }

    let coords;
    try {
      coords = parseCoordinates(query);
    } catch (e) {
      // bad format
    }

    if (coords) {
      const format = 'DM';
      const name = `${formatGpsCoord(
        coords.lat,
        'SN',
        format,
        language,
      )} ${formatGpsCoord(coords.lon, 'WE', format, language)}`;

      const geojson: Point = {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      };

      dispatch(
        searchSetResults([
          {
            id: -1,
            label: query.toUpperCase(),
            geojson,
            lat: coords.lat,
            lon: coords.lon,
            tags: {
              name,
              type: 'Point',
            },
          },
        ]),
      );

      return;
    }

    try {
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
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'search.fetchingError', err);
    }
  },
};
