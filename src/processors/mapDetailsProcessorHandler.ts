import { distance } from '@turf/distance';
import { assert } from 'typia';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import { mapDetailsSetUserSelectedPosition } from '../actions/mapDetailsActions.js';
import {
  type SearchResult,
  searchSetResults,
} from '../actions/searchActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import type { OverpassBounds, OverpassElement } from '../types/overpass.js';

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
  bounds?: OverpassBounds;
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
          out tags bb;`,
      expectedStatus: 200,
    }),
  ]);

  const oRes = assert<{
    elements: OverpassElement[];
  }>(await res0.json());

  oRes.elements = oRes.elements
    .map((e) => ({
      e,
      d: distance(
        [userSelectedLon, userSelectedLat],
        e.type === 'node' ? [e.lon, e.lat] : [e.center.lon, e.center.lat],
        { units: 'meters' },
      ),
    }))
    .sort((a, b) => a.d - b.d)
    .map((a) => a.e);

  const oRes1 = assert<{ elements: SimpleOverpassElement[] }>(
    await res1.json(),
  );

  const res1Set = new Set(oRes1.elements.map((item) => item.id));

  function approxAreaMeters2(b?: OverpassBounds): number {
    if (!b) {
      return 0;
    }

    const midLatRad = (b.minlat + b.maxlat) * 0.5 * (Math.PI / 180);
    const metersPerDegLon = 111_320 * Math.cos(midLatRad);

    const dx = Math.max(0, b.maxlon - b.minlon) * metersPerDegLon;
    const dy = Math.max(0, b.maxlat - b.minlat) * 111_132;

    return dx * dy;
  }

  const elements = [
    ...oRes.elements.filter((item) => !res1Set.has(item.id)), // remove dupes
    ...oRes1.elements
      .map((e) => ({ e, area: approxAreaMeters2(e.bounds) }))
      .sort((a, b) => a.area - b.area)
      .map((a) => a.e),
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
