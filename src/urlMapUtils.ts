import { MapViewState } from './actions/mapActions.js';
import { integratedLayerDefMap } from './mapDefinitions.js';
import {
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
  getTrasformedParamsIfIsOldFreemapUrl,
} from './oldFreemapUtils.js';

const LAYERS_RE = new RegExp(
  '^(' + Object.keys(integratedLayerDefMap).join('|') + ')|[.:]\\d',
);

export function getMapStateFromUrl(): Partial<MapViewState> {
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

  let layersStr = query.get('layers');

  let layers: string[] | undefined;

  if (!layersStr) {
    // nothing
  } else if (layersStr.includes('~')) {
    layers = layersStr.split('~');
  } else if (layersStr in integratedLayerDefMap) {
    layers = [layersStr];
  } else {
    // backward compatibility
    layers = [];

    while (layersStr.length) {
      const m = LAYERS_RE.exec(layersStr);

      if (!m) {
        break;
      }

      if (m[1]) {
        layers.push(m[1]);
      }

      layersStr = layersStr.slice(m[1].length);
    }
  }

  return { lat, lon, zoom, layers };
}

function undefineNaN(val: number): number | undefined {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(
  state1: Partial<MapViewState>,
  state2: MapViewState,
): Partial<MapViewState> | null {
  const { lat, lon, zoom, layers } = state1;

  const changes: Partial<MapViewState> = {};

  if (layers && layers.join('\n') !== state2.layers.join('\n')) {
    changes.layers = layers;

    if (state2.layers.includes('i')) {
      changes.layers.push('i');
    }
  }

  if (lat !== undefined && Math.abs(lat - state2.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (lon !== undefined && Math.abs(lon - state2.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom !== undefined && zoom !== state2.zoom) {
    changes.zoom = zoom;
  }

  return changes;
}
