import { distance } from '@turf/distance';
import { feature, point } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { CRS } from 'leaflet';
import { Dispatch } from 'redux';
import { assert, is } from 'typia';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import {
  type SearchResult,
  searchSetQuery,
  searchSetResults,
} from '../actions/searchActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { mapPromise } from '../leafletElementHolder.js';
import {
  integratedLayerDefs,
  IsWmsLayerDef,
  LayerDef,
} from '../mapDefinitions.js';
import { RootState } from '../store.js';
import { objectToURLSearchParams } from '../stringUtils.js';
import { FeatureId } from '../types/featureId.js';
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
  const { excludeSources } = getState().mapDetails;

  window._paq.push(['trackEvent', 'MapDetails', 'search']);

  const kvFilter =
    '[~"^(aerialway|amenity|barrier|border|boundary|building|highway|historic|information|landuse|leisure|man_made|natural|place|power|railway|route|shop|sport|tourism|waterway)$"~"."]';

  const wmsLayerDefs = [
    ...integratedLayerDefs,
    ...getState().map.customLayers,
  ].filter((def): def is LayerDef<IsWmsLayerDef, IsWmsLayerDef> =>
    is<IsWmsLayerDef>(def),
  );

  const wmsLayerTypes = wmsLayerDefs.map((def) => def.type);

  const [resNearby, resSurrounding, resReverse, ...wms] = await Promise.all([
    excludeSources.includes('overpass-nearby')
      ? undefined
      : httpRequest({
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
        }).then((res) => res.json()),

    excludeSources.includes('overpass-surrounding')
      ? undefined
      : httpRequest({
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
        }).then((res) => res.json()),

    excludeSources.includes('nominatim-reverse')
      ? undefined
      : httpRequest({
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
        }).then((res) => res.json()),

    ...getState()
      .map.layers.filter(
        (layer) =>
          wmsLayerTypes.includes(layer) &&
          !excludeSources.includes(`wms:${layer}`),
      )
      .map((layer) => wmsLayerDefs.find((def) => def.type === layer))
      .filter((def): def is LayerDef<IsWmsLayerDef, IsWmsLayerDef> =>
        Boolean(def),
      )
      .map((def) =>
        mapPromise.then(async (map) => {
          const name =
            'name' in def
              ? (def.name ?? def.type)
              : window.translations?.mapLayers.letters[def.type];

          const bounds = map.getBounds();
          const size = map.getSize();
          const point = map.latLngToContainerPoint({ lat, lng: lon });

          const a = CRS.EPSG3857.project(bounds.getSouthWest());
          const b = CRS.EPSG3857.project(bounds.getNorthEast());

          const url = new URL(def.url);

          url.searchParams.set('request', 'GetFeatureInfo');
          url.searchParams.set('service', 'WMS');
          url.searchParams.set('version', '1.3.0');
          url.searchParams.set('LAYERS', def.layers.join(','));
          url.searchParams.set('QUERY_LAYERS', def.layers.join(','));
          url.searchParams.set('INFO_FORMAT', 'application/geo+json'); // TODO
          url.searchParams.set('CRS', 'EPSG:3857'); // TODO
          url.searchParams.set('I', point.x.toFixed());
          url.searchParams.set('J', point.y.toFixed());
          url.searchParams.set('WIDTH', size.x.toFixed());
          url.searchParams.set('HEIGHT', size.y.toFixed());
          url.searchParams.set('BBOX', [a.x, a.y, b.x, b.y].join(','));

          const res = await httpRequest({ getState, url: url.toString() });

          return {
            type: def.type,
            name,
            info: (await res.json()) as FeatureCollection, // TODO validate
          };
        }),
      ),
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

  sr.push(
    ...wms
      .flatMap((wms) =>
        wms.info.features.map((feature) => ({
          ...wms,
          info: feature,
        })),
      )
      .map((wms, seq) => {
        const idProperty =
          wms.info.properties &&
          ['OBJECTID', 'GLOBALID', 'ID', 'id', 'FID', 'fid', 'GID', 'gid'].find(
            (property) => property in wms.info.properties!,
          );

        const id: FeatureId | null =
          idProperty == null
            ? null
            : {
                type: 'wms',
                property: idProperty,
                map: wms.type,
                id: wms.info.properties![idProperty],
                seq,
              };

        return {
          geojson: wms.info.geometry
            ? wms.info
            : {
                ...wms.info,
                geometry: { type: 'Point', coordinates: [lon, lat] },
              },
          id: id ?? {
            type: 'wms',
            map: wms.type,
            seq,
          },
          genericName: (wms.info as unknown as { layerName: unknown })
            .layerName as string, // ArcGIS only?,
          source: `wms:${wms.type}`,
          showToast: true,
        } satisfies SearchResult;
      }),
  );

  if (reverseGeocodingElement) {
    sr.push({
      source: 'nominatim-reverse',
      id:
        reverseGeocodingElement.osm_type && reverseGeocodingElement.osm_id
          ? {
              type: 'osm',
              elementType: reverseGeocodingElement.osm_type,
              id: reverseGeocodingElement.osm_id,
            }
          : { type: 'other' },
      incomplete: true,
      displayName: reverseGeocodingElement.display_name,
      geojson: feature(
        reverseGeocodingElement.geojson ?? null,
        {
          [reverseGeocodingElement.class]: reverseGeocodingElement.type,
          name: reverseGeocodingElement.name,
          ...reverseGeocodingElement.extratags,
        },
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
          id: { type: 'osm', elementType: 'node', id: element.id },
          geojson: point([element.lon, element.lat], element.tags),
          incomplete: true,
        });

        break;

      case 'way':
        sr.push({
          source: element.source,
          id: { type: 'osm', elementType: 'way', id: element.id },
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
            id: { type: 'osm', elementType: 'relation', id: element.id },
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
