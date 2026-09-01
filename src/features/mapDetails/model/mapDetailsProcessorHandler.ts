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
import {
  fetchFeaturesAt,
  type OsmApiFeature,
  osmApiFeatureId,
} from '@shared/osmApi.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { FeatureId } from '@shared/types/featureId.js';
import {
  PhotonResponseSchema,
  photonLang,
  photonOsmElementType,
} from '@shared/types/photonResult.js';
import { wmsBaseUrl } from '@shared/wms.js';
import { point } from '@turf/helpers';
import { toWgs84 } from '@turf/projection';
import type { FeatureCollection } from 'geojson';
import { CRS } from 'leaflet';
import type { Dispatch } from 'redux';
import { loadMapDetailsMessages } from '../translations/loadMapDetailsMessages.js';

/** An object is worth reporting when it carries one of these keys. */
const osmKeys = [
  'aerialway',
  'amenity',
  'barrier',
  'border',
  'boundary',
  'building',
  'highway',
  'historic',
  'information',
  'landuse',
  'leisure',
  'man_made',
  'natural',
  'place',
  'power',
  'railway',
  'route',
  'shop',
  'sport',
  'tourism',
  'waterway',
];

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

  const wmsLayerDefs = [
    ...integratedLayerDefs,
    ...getState().map.customLayers,
  ].filter(isWmsLayerDef);

  const wmsLayerTypes = wmsLayerDefs.map((def) => def.type);

  const wantNearby = !excludeSources.includes('overpass-nearby');

  const wantSurrounding = !excludeSources.includes('overpass-surrounding');

  const [resOsm, resReverse, ...wms] = await Promise.all([
    // Both halves come from one request, so one of them being switched off
    // saves nothing but the work of reading it.
    wantNearby || wantSurrounding
      ? fetchFeaturesAt({ lat, lon, radius: 33, keys: osmKeys }, { getState })
      : undefined,

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
              // The nearest one place; what else is here comes from OSM data.
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

  // Both arrive ordered: nearby by distance, surrounding by area ascending.
  const nearbyElements = wantNearby ? (resOsm?.nearby.features ?? []) : [];

  const surroundingElements = wantSurrounding
    ? (resOsm?.containing.features ?? [])
    : [];

  // Photon answers with a collection; `limit=1` makes it the nearest place.
  const reverseGeocodingElement = resReverse
    ? PhotonResponseSchema.parse(resReverse).features[0]
    : undefined;

  const reverseProps = reverseGeocodingElement?.properties;

  // In the same `type/id` form the OSM API answers with, so the reverse
  // geocoding hit and an object can be told apart below.
  const reverseOsm =
    reverseProps?.osm_type !== undefined && reverseProps.osm_id !== undefined
      ? `${photonOsmElementType(reverseProps.osm_type)}/${reverseProps.osm_id}`
      : undefined;

  const surroundingElementsSet = new Set(
    surroundingElements.map((item) => item.id),
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
        (e) => !surroundingElementsSet.has(e.id) && e.id !== reverseOsm,
      )
      .map((element) => ({ element, source: 'overpass-nearby' as const })),
    ...surroundingElements
      .filter((e) => e.id !== reverseOsm)
      .map((element) => ({
        element,
        source: 'overpass-surrounding' as const,
      })),
  ];

  for (const { element, source } of elements) {
    const id = osmApiFeatureId(element.id);

    sr.push({
      source,
      id,
      incomplete: true,
      geojson: osmApiGeojson(element, id.elementType === 'node'),
    });
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

/**
 * The label point the API answers with, carrying the element's tags. A node
 * gets no bbox: a zero-size one would make the map zoom all the way in.
 */
function osmApiGeojson(feature: OsmApiFeature, isNode: boolean) {
  return point(
    feature.geometry.coordinates,
    feature.properties,
    isNode ? {} : { bbox: feature.bbox },
  );
}
