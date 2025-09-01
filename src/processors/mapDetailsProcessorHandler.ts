import { distance } from '@turf/distance';
import { feature, point } from '@turf/helpers';
import { Dispatch } from 'redux';
import { assert } from 'typia';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import {
  type SearchResult,
  searchSelectResult,
  searchSetQuery,
  searchSetResults,
} from '../actions/searchActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { RootState } from '../store.js';
import { objectToURLSearchParams } from '../stringUtils.js';
import { NominatimResult } from '../types/nominatimResult.js';
import type { OverpassBounds, OverpassElement } from '../types/overpass.js';

const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
  setTool.type,

  searchSetQuery.type,
];

export async function handle(
  [lat, lon]: [number, number],
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const { sources } = getState().mapDetails;

  if (sources.length === 0) {
    return;
  }

  window._paq.push(['trackEvent', 'MapDetails', 'search']);

  const kvFilter =
    '[~"^(aerialway|amenity|barrier|border|boundary|building|highway|historic|information|landuse|leisure|man_made|natural|place|power|railway|route|shop|sport|tourism|waterway)$"~"."]';

  const [resNearby, resSurrounding, resReverse] = await Promise.all([
    sources.includes('nearby')
      ? httpRequest({
          getState,
          method: 'POST',
          url: 'https://overpass.freemap.sk/api/interpreter',
          // url: 'https://overpass-api.de/api/interpreter',
          headers: { 'Content-Type': 'text/plain' },
          body:
            '[out:json];(' +
            `nwr(around:33,${lat},${lon})${kvFilter};` +
            ');out tags bb;',
          expectedStatus: 200,
        }).then((res) => res.json())
      : undefined,

    sources.includes('surrounding')
      ? httpRequest({
          getState,
          method: 'POST',
          url: 'https://overpass.freemap.sk/api/interpreter', // was: fails with memory error
          // url: 'https://overpass-api.de/api/interpreter',
          headers: { 'Content-Type': 'text/plain' },
          body: `[out:json];
          is_in(${lat},${lon});
          wr(pivot)${kvFilter};
          out tags bb;`,
          expectedStatus: 200,
        }).then((res) => res.json())
      : undefined,

    sources.includes('reverse')
      ? await httpRequest({
          getState,
          url:
            'https://nominatim.openstreetmap.org/reverse?' +
            objectToURLSearchParams({
              lat,
              lon,
              format: 'json',
              polygon_geojson: 1,
              extratags: 1,
              zoom: getState().map.zoom,
              namedetails: 0, // TODO maybe use some more details
              limit: 20,
              'accept-language': getState().l10n.language,
              email: 'martin.zdila@freemap.sk',
            }),
          expectedStatus: 200,
        }).then((res) => res.json())
      : undefined,
  ]);

  const nearbyElements = (
    resNearby
      ? assert<{
          elements: OverpassElement<'bounds'>[];
        }>(resNearby).elements
      : []
  )
    .map((e) => ({
      e,
      d: distance(
        [lon, lat],
        e.type === 'node'
          ? [e.lon, e.lat]
          : [
              (e.bounds.minlon + e.bounds.maxlon) / 2,
              (e.bounds.minlat + e.bounds.maxlat) / 2,
            ],
        { units: 'meters' },
      ),
    }))
    .sort((a, b) => a.d - b.d)
    .map((a) => a.e);

  const surroundingElements = resSurrounding
    ? assert<{ elements: OverpassElement<'bounds'>[] }>(resSurrounding).elements
    : [];

  const reverseGeocodingElement = assert<NominatimResult | undefined>(
    resReverse,
  );

  const surroundingElementsSet = new Set(
    surroundingElements.map((item) => item.type + item.id),
  );

  const sr: SearchResult[] = [];

  if (reverseGeocodingElement) {
    const tags = {
      [reverseGeocodingElement.class]: reverseGeocodingElement.type,
      name: reverseGeocodingElement.name,
      ...reverseGeocodingElement.extratags,
      display_name: reverseGeocodingElement.display_name,
    };

    sr.push({
      source: 'nominatim-reverse',
      id:
        reverseGeocodingElement.osm_type && reverseGeocodingElement.osm_id
          ? {
              type: reverseGeocodingElement.osm_type,
              id: reverseGeocodingElement.osm_id,
            }
          : { type: 'other', id: 0 },
      incomplete: true,
      geojson: feature(
        reverseGeocodingElement.geojson ?? null,
        tags,
        reverseGeocodingElement.boundingbox
          ? {
              bbox: [
                Number(reverseGeocodingElement.boundingbox[2]),
                Number(reverseGeocodingElement.boundingbox[1]),
                Number(reverseGeocodingElement.boundingbox[3]),
                Number(reverseGeocodingElement.boundingbox[0]),
              ],
            }
          : undefined,
      ),
    });
  }

  const elements = [
    ...nearbyElements
      .filter(
        // remove dupes
        (e) =>
          !surroundingElementsSet.has(e.type + e.id) &&
          (!reverseGeocodingElement ||
            reverseGeocodingElement.osm_type !== e.type ||
            reverseGeocodingElement.osm_id !== e.id),
      )
      .map((element) => ({ ...element, source: 'overpass-nearby' as const })),
    ...surroundingElements
      .filter(
        (e) =>
          !reverseGeocodingElement ||
          reverseGeocodingElement.osm_type !== e.type ||
          reverseGeocodingElement.osm_id !== e.id,
      )
      .map((e) => ({
        e,
        area: e.type === 'node' ? 0 : approxAreaMeters2(e.bounds),
      }))
      .sort((a, b) => a.area - b.area)
      .map((a) => ({ ...a.e, source: 'overpass-surrounding' as const })),
  ];

  for (const element of elements) {
    switch (element.type) {
      case 'node':
        sr.push({
          source: element.source,
          id: { type: 'node', id: element.id },
          geojson: point([element.lon, element.lat], element.tags),
          showToast: true,
          incomplete: true,
        });

        break;

      case 'way':
        sr.push({
          source: element.source,
          id: { type: 'way', id: element.id },
          showToast: true,
          incomplete: true,
          geojson: point(
            [
              (element.bounds.minlon + element.bounds.maxlon) / 2,
              (element.bounds.minlat + element.bounds.maxlat) / 2,
            ],
            element.tags,
            {
              bbox: [
                element.bounds.minlon,
                element.bounds.minlat,
                element.bounds.maxlon,
                element.bounds.maxlat,
              ],
            },
          ),
        });

        break;

      case 'relation':
        {
          sr.push({
            source: element.source,
            id: { type: 'relation', id: element.id },
            showToast: true,
            incomplete: true,
            geojson: point(
              [
                (element.bounds.minlon + element.bounds.maxlon) / 2,
                (element.bounds.minlat + element.bounds.maxlat) / 2,
              ],
              element.tags,
              {
                bbox: [
                  element.bounds.minlon,
                  element.bounds.minlat,
                  element.bounds.maxlon,
                  element.bounds.maxlat,
                ],
              },
            ),
          });
        }

        break;
    }
  }

  if (sr.length > 0) {
    // dispatch(setTool(null));

    dispatch(searchSetResults(sr));

    if (reverseGeocodingElement) {
      dispatch(
        searchSelectResult({
          result: sr[0],
          showToast: false,
          focus: false,
        }),
      );
    }
  } else {
    dispatch(
      toastsAdd({
        id: 'mapDetails.detail',
        messageKey: 'mapDetails.notFound',
        cancelType,
        timeout: 5000,
        style: 'warning',
      }),
    );
  }
}

export default handle;

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
