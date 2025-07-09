import { MapViewState } from './actions/mapActions.js';
import { integratedLayerDefs } from './mapDefinitions.js';
import {
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
  getTrasformedParamsIfIsOldFreemapUrl,
} from './oldFreemapUtils.js';

export function getMapStateFromUrl(): Partial<MapViewState> &
  Pick<MapViewState, 'layers'> {
  {
    const transformedParams = getTrasformedParamsIfIsOldEmbeddedFreemapUrl();

    if (transformedParams) {
      return transformedParams;
    }
  }

  {
    const transformedParams = getTrasformedParamsIfIsOldFreemapUrl();

    if (transformedParams) {
      return transformedParams;
    }
  }

  const query = new URLSearchParams(
    (location.hash || location.search).slice(1),
  );

  const [zoomFrag, latFrag, lonFrag] = query.get('map')?.split('/') ?? [];

  const lat = undefineNaN(parseFloat(latFrag));

  const lon = undefineNaN(parseFloat(lonFrag));

  const zoom = undefineNaN(parseInt(zoomFrag, 10));

  let layersStr = query.get('layers') ?? '';

  const layers: string[] = [];

  const re = new RegExp(
    '^(' + integratedLayerDefs.map((def) => def.type).join('|') + '|[.:]\\d)',
  );

  while (layersStr.length > 0) {
    const m = re.exec(layersStr);
    if (!m) {
      break;
    }
    layers.push(m[1]);
    layersStr = layersStr.slice(m[1].length);
  }

  return { lat, lon, zoom, layers };
}

function undefineNaN(val: number): number | undefined {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(
  state1: Partial<MapViewState> & Pick<MapViewState, 'layers'>,
  state2: MapViewState,
): Partial<MapViewState> | null {
  const { lat, lon, zoom, layers = [] } = state1;

  const changes: Partial<MapViewState> = {};

  if (layers.join('') !== state2.layers.join('')) {
    changes.layers = layers;

    if (state2.layers.includes('i')) {
      changes.layers.push('i');
    }
  }

  if (lat && Math.abs(lat - state2.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (lon && Math.abs(lon - state2.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom && zoom !== state2.zoom) {
    changes.zoom = zoom;
  }

  return changes;
}
