import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { SearchResult, searchSetResults } from 'fm3/actions/searchActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const cancelType = [
  getType(clearMap),
  getType(selectFeature),
  getType(deleteFeature),
  getType(setTool),

  getType(mapDetailsSetUserSelectedPosition),
];

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags?: Record<string, string>;
}

interface OverpassResult {
  elements: OverpassElement[];
}

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { userSelectedLat, userSelectedLon } = getState().mapDetails;

    const le = getMapLeafletElement();

    if (!le) {
      return;
    }

    const kvFilter =
      '[~"^(amenity|highway|waterway|border|landuse|route|building|man_made|natural|leisure|information|shop|tourism|barrier|sport|place|power|boundary|railway|aerialway|historic)$"~"."]';

    const [{ data }, { data: data1 }] = await Promise.all([
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data:
          '[out:json];(' +
          `nwr(around:33,${userSelectedLat},${userSelectedLon})${kvFilter};` +
          ');out tags;',
        expectedStatus: 200,
      }),
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data: `[out:json];
          is_in(${userSelectedLat},${userSelectedLon})->.a;
          nwr(pivot.a)${kvFilter};
          out tags;`,
        expectedStatus: 200,
      }),
    ]);

    const oRes = assertType<OverpassResult>(data);

    const oRes1 = assertType<OverpassResult>(data1);

    const res1Set = new Set(oRes1.elements.map((item) => item.id));

    const elements = [
      ...oRes1.elements,
      ...oRes.elements.filter((item) => !res1Set.has(item.id)), // remove dupes
    ].reverse();

    const sr: SearchResult[] = [];

    for (const element of elements) {
      const tags = element.tags ?? {};

      switch (element.type) {
        case 'node':
          sr.push({
            id: element.id,
            osmType: 'node',
            tags,
          });

          break;
        case 'way':
          sr.push({
            id: element.id,
            osmType: 'way',
            tags,
          });

          break;
        case 'relation':
          {
            sr.push({
              id: element.id,
              osmType: 'relation',
              tags,
            });
          }

          break;
      }
    }

    if (elements.length > 0) {
      // dispatch(setTool(null));

      dispatch(searchSetResults(sr));
    } else {
      dispatch(
        toastsAdd({
          id: 'mapDetails.trackInfo.detail',
          messageKey: 'mapDetails.notFound',
          cancelType,
          timeout: 5000,
          style: 'info',
        }),
      );
    }
  },
};
