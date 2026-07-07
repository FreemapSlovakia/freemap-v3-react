import type { MapViewState } from '@features/map/model/actions.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';

const LAYERS_RE = new RegExp(
  `^(${Object.keys(integratedLayerDefMap).join('|')})|[.:]\\d`,
);

export function getMapStateFromUrl(): Partial<MapViewState> {
  const query = new URLSearchParams(
    (location.hash || location.search).slice(1),
  );

  let [zoomFrag, latFrag, lonFrag] = query.get('map')?.split('/') ?? [];

  if (!latFrag || !lonFrag) {
    const geo = parseGeoUri(query.get('geo'));

    if (geo) {
      latFrag = String(geo.lat);
      lonFrag = String(geo.lon);

      if (geo.zoom !== undefined && !zoomFrag) {
        zoomFrag = String(geo.zoom);
      }
    }
  }

  const lat = undefineNaN(parseFloat(latFrag ?? ''));

  const lon = undefineNaN(parseFloat(lonFrag ?? ''));

  const zoom = undefineNaN(parseInt(zoomFrag ?? '', 10));

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

      if (!m?.[1]) {
        break;
      }

      layers.push(m[1]);

      layersStr = layersStr.slice(m[1].length);
    }
  }

  layers = layers?.filter((layer) => layer in integratedLayerDefMap);

  if (
    layers &&
    !layers.some((layer) => integratedLayerDefMap[layer]?.layer === 'base')
  ) {
    layers.push('X'); // fallback
  }

  return {
    lat,
    lon,
    zoom,
    layers,
  };
}

function undefineNaN(val: number): number | undefined {
  return Number.isNaN(val) ? undefined : val;
}

function parseGeoUri(
  raw: string | null,
): { lat: number; lon: number; zoom?: number } | undefined {
  if (!raw) {
    return undefined;
  }

  const m =
    /^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?(?:[?;](.*))?$/i.exec(
      raw,
    );

  if (!m) {
    return undefined;
  }

  let lat = parseFloat(m[1]!);
  let lon = parseFloat(m[2]!);
  let zoom: number | undefined;

  const params = m[3];

  if (params) {
    const qMatch = /(?:^|[;&])q=([^;&]*)/i.exec(params);

    if (qMatch) {
      const qVal = decodeURIComponent(qMatch[1]!);

      const llMatch = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(qVal);

      if (llMatch) {
        lat = parseFloat(llMatch[1]!);
        lon = parseFloat(llMatch[2]!);
      }
    }

    const zMatch = /(?:^|[;&])z=(\d+)/i.exec(params);

    if (zMatch) {
      zoom = parseInt(zMatch[1]!, 10);
    }
  }

  if (Number.isNaN(lat) || Number.isNaN(lon) || (lat === 0 && lon === 0)) {
    return undefined;
  }

  return { lat, lon, zoom };
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
