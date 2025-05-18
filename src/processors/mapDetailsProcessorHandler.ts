import { distance } from '@turf/distance';
import { assert } from 'typia';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import { mapDetailsSetUserSelectedPosition } from '../actions/mapDetailsActions.js';
import { SearchResult, searchSetResults } from '../actions/searchActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import { OverpassElement } from '../types/common.js';

const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
  setTool.type,

  mapDetailsSetUserSelectedPosition.type,
];

interface SimpleOverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags?: Record<string, string>;
}

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
  const { userSelectedLat, userSelectedLon } = getState().mapDetails;

  if (userSelectedLat === null || userSelectedLon === null) {
    return;
  }

  window._paq.push(['trackEvent', 'MapDetails', 'search']);

  const kvFilter =
    '[~"^(aerialway|amenity|barrier|border|boundary|building|highway|historic|information|landuse|leisure|man_made|natural|place|power|railway|route|shop|sport|tourism|waterway)$"~"."]';

  const [res0, res1] = await Promise.all([
    httpRequest({
      getState,
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      // url: 'https://overpass-api.de/api/interpreter',
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
      // url: 'https://overpass.freemap.sk/api/interpreter', // fails with memory error
      url: 'https://overpass-api.de/api/interpreter',
      headers: { 'Content-Type': 'text/plain' },
      body: `[out:json];
          is_in(${userSelectedLat},${userSelectedLon})->.a;
          nwr(pivot.a)${kvFilter};
          out tags;`,
      expectedStatus: 200,
    }),
  ]);

  const oRes = assert<{
    elements: OverpassElement[];
  }>(await res0.json());

  oRes.elements.sort((a, b) => {
    return (
      distance(
        [userSelectedLon, userSelectedLat],
        [
          a.type === 'node' ? a.lon : a.center.lon,
          a.type === 'node' ? a.lat : a.center.lat,
        ],
        { units: 'meters' },
      ) -
      distance(
        [userSelectedLon, userSelectedLat],
        [
          b.type === 'node' ? b.lon : b.center.lon,
          b.type === 'node' ? b.lat : b.center.lat,
        ],
        { units: 'meters' },
      )
    );
  });

  const oRes1 = assert<{ elements: SimpleOverpassElement[] }>(
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
          showToast: true,
        });

        break;

      case 'way':
        sr.push({
          id: element.id,
          osmType: 'way',
          tags,
          showToast: true,
        });

        break;

      case 'relation':
        {
          sr.push({
            id: element.id,
            osmType: 'relation',
            tags,
            showToast: true,
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
};

export default handle;
