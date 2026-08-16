import { httpRequest } from '@app/httpRequest.js';
import {
  clearMapFeatures,
  deleteFeature,
  selectFeature,
} from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import {
  type SearchResult,
  searchSetQuery,
  searchSetResults,
} from '@features/search/model/actions.js';
import { photonToSearchResult } from '@features/search/model/resultUtils.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  type IsWmsLayerDef,
  integratedLayerDefs,
  isWmsLayerDef,
  type LayerDef,
} from '@shared/mapDefinitions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { FeatureId } from '@shared/types/featureId.js';
import {
  type OverpassBounds,
  OverpassBoundsExtraSchema,
  overpassResultSchema,
} from '@shared/types/overpass.js';
import {
  PhotonResponseSchema,
  photonLang,
  photonOsmElementType,
} from '@shared/types/photonResult.js';
import { wmsBaseUrl } from '@shared/wms.js';
import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import { toWgs84 } from '@turf/projection';
import type { FeatureCollection } from 'geojson';
import { CRS } from 'leaflet';
import type { Dispatch } from 'redux';
import { loadMapDetailsMessages } from '../translations/loadMapDetailsMessages.js';

const OverpassResultBoundsSchema = overpassResultSchema(
  OverpassBoundsExtraSchema,
);

const cancelType = [
  clearMapFeatures.type,
  selectFeature.type,
  deleteFeature.type,
  searchSetQuery.type,
];

// Dismiss the details toast once the map-details tool is gone.
const mapDetailsClosed = (state: RootState) =>
  state.main.mapTool !== 'map-details';

export async function handle(
  [lat, lon]: [number, number],
  getState: () => RootState,
  dispatch: Dispatch,
) {
  const { excludeSources } = getState().mapDetails;

  trackMatomo(['trackEvent', 'MapDetails', 'search']);

  const kvFilter =
    '[~"^(aerialway|amenity|barrier|border|boundary|building|highway|historic|information|landuse|leisure|man_made|natural|place|power|railway|route|shop|sport|tourism|waterway)$"~"."]';

  const wmsLayerDefs = [
    ...integratedLayerDefs,
    ...getState().map.customLayers,
  ].filter(isWmsLayerDef);

  const wmsLayerTypes = wmsLayerDefs.map((def) => def.type);

  const [resNearby, resSurrounding, resReverse, ...wms] = await Promise.all([
    excludeSources.includes('overpass-nearby')
      ? undefined
      : httpRequest({
          getState,
          method: 'POST',
          url: process.env['OVERPASS_URL']!,
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
          url: process.env['OVERPASS_URL']!,
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
            process.env['PHOTON_URL'] +
            '/reverse?' +
            objectToURLSearchParams({
              lat,
              lon,
              // Never left out: without it Photon reads `Accept-Language`,
              // which the vhost blanks so one URL means one thing to the cache.
              lang: photonLang(getState().l10n.language),
              // The nearest one place; what else is here comes from Overpass.
              limit: 1,
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
              : getMessages()?.mapLayers.letters[def.type];

          const bounds = map.getBounds();
          const size = map.getSize();
          const point = map.latLngToContainerPoint({ lat, lng: lon });

          const a = CRS.EPSG3857.project(bounds.getSouthWest());
          const b = CRS.EPSG3857.project(bounds.getNorthEast());

          const url = new URL(
            wmsBaseUrl(def.url, [
              ...(def.layers.length ? ['layers'] : []),
              'query_layers',
              'info_format',
              'i',
              'j',
              'feature_count',
            ]),
          );

          url.searchParams.set('request', 'GetFeatureInfo');
          url.searchParams.set('service', 'WMS');
          url.searchParams.set('version', '1.3.0');
          url.searchParams.set('LAYERS', def.layers.join(','));
          url.searchParams.set('QUERY_LAYERS', def.layers.join(','));
          // Part of the map request GetFeatureInfo copies, and mandatory there.
          url.searchParams.set('STYLES', '');
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
            info: toWgs84(
              JSON.parse(
                (await res.text())
                  // kataster.skgeodesy.sk returns number with decimal comma, try to fix it
                  .replace(/\[(\d+),(\d+),(\d+),(\d+)\]/g, '[$1.$2,$3.$4]'),
              ),
            ) as FeatureCollection, // TODO validate
          };
        }),
      ),
  ]);

  const nearbyElements = (
    resNearby ? OverpassResultBoundsSchema.parse(resNearby).elements : []
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
    ? OverpassResultBoundsSchema.parse(resSurrounding).elements
    : [];

  // Photon answers with a collection; `limit=1` makes it the nearest place.
  const reverseGeocodingElement = resReverse
    ? PhotonResponseSchema.parse(resReverse).features[0]
    : undefined;

  const reverseProps = reverseGeocodingElement?.properties;

  // What Overpass calls the element, so the two can be told apart below.
  const reverseOsm =
    reverseProps?.osm_type !== undefined && reverseProps.osm_id !== undefined
      ? {
          type: photonOsmElementType(reverseProps.osm_type),
          id: reverseProps.osm_id,
        }
      : undefined;

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
        } satisfies SearchResult;
      }),
  );

  if (reverseGeocodingElement) {
    sr.push(photonToSearchResult(reverseGeocodingElement, 'nominatim-reverse'));
  }

  const elements = [
    ...nearbyElements
      .filter(
        // remove dupes
        (e) =>
          !surroundingElementsSet.has(e.type + e.id) &&
          (!reverseOsm || reverseOsm.type !== e.type || reverseOsm.id !== e.id),
      )
      .map((element) => ({ ...element, source: 'overpass-nearby' as const })),
    ...surroundingElements
      .filter(
        (e) =>
          !reverseOsm || reverseOsm.type !== e.type || reverseOsm.id !== e.id,
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
    // dispatch(closeTool('map-details'));

    dispatch(searchSetResults(sr));
  } else {
    dispatch(
      toastsAdd({
        id: 'mapDetails.detail',
        messageKey: 'notFound',
        messageLoader: loadMapDetailsMessages,
        cancelType,
        statePredicate: mapDetailsClosed,
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
