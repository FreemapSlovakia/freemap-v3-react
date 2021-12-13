import {
  clearMap,
  deleteFeature,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import { SearchResult, searchSetResults } from 'fm3/actions/searchActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { distance } from 'fm3/geoutils';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OverpassElement } from 'fm3/types/common';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const cancelType = [
  getType(clearMap),
  getType(selectFeature),
  getType(deleteFeature),
  getType(setTool),

  getType(mapDetailsSetUserSelectedPosition),
];

interface SimpleOverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags?: Record<string, string>;
}

export const mapDetailsProcessor: Processor = {
  actionCreator: mapDetailsSetUserSelectedPosition,
  errorKey: 'mapDetails.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { userSelectedLat, userSelectedLon } = getState().mapDetails;

    if (userSelectedLat === null || userSelectedLon === null) {
      return;
    }

    const kvFilter =
      '[~"^(aerialway|amenity|barrier|border|boundary|building|highway|historic|information|landuse|leisure|man_made|natural|place|power|railway|route|shop|sport|tourism|waterway)$"~"."]';

    const [res0, res1] = await Promise.all([
      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        body:
          '[out:json];(' +
          `nwr(around:33,${userSelectedLat},${userSelectedLon})${kvFilter};` +
          ');out tags center;',
        expectedStatus: 200,
      }),

      httpRequest({
        getState,
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        body: `[out:json];
          is_in(${userSelectedLat},${userSelectedLon})->.a;
          nwr(pivot.a)${kvFilter};
          out tags;`,
        expectedStatus: 200,
      }),
    ]);

    const oRes = assertType<{
      elements: OverpassElement[];
    }>(await res0.json());

    console.log(oRes.elements);

    oRes.elements.sort((a, b) => {
      return (
        distance(
          userSelectedLat,
          userSelectedLon,
          a.type === 'node' ? a.lat : a.center.lat,
          a.type === 'node' ? a.lon : a.center.lon,
        ) -
        distance(
          userSelectedLat,
          userSelectedLon,
          b.type === 'node' ? b.lat : b.center.lat,
          b.type === 'node' ? b.lon : b.center.lon,
        )
      );
    });

    const oRes1 = assertType<{ elements: SimpleOverpassElement[] }>(
      await res1.json(),
    );

    const res1Set = new Set(oRes1.elements.map((item) => item.id));

    const elements = [
      ...oRes.elements.filter((item) => !res1Set.has(item.id)), // remove dupes
      ...oRes1.elements.reverse(),
    ];

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
