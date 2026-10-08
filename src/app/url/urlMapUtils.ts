import type { MapViewState } from '@features/map/model/actions.js';
import { resolveLayerAliases } from '@shared/mapDefinitions.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';
import { knownLayerIds, mapIndexById } from '@shared/mapLibrary/mapIndex.js';

const LAYERS_RE = new RegExp(`^(${knownLayerIds().join('|')})|[.:]\\d`);

// How precisely `map=` carries the zoom. Two decimals put roughly 140 steps
// between the widest and the closest view — finer than any gesture can be
// repeated — and a whole level still writes as a bare integer, so links to one
// read exactly as they always have.
const ZOOM_DECIMALS = 2;

// Half of the last digit `serializeZoom` keeps, so a URL compared against the
// full-precision zoom it was written from reads as unchanged.
const ZOOM_EPSILON = 0.5 / 10 ** ZOOM_DECIMALS;

export function serializeZoom(zoom: number): string {
  return String(Number(zoom.toFixed(ZOOM_DECIMALS)));
}

/** `isCustomType`: whether `layers=` may name this id as a custom map. */
export function getMapStateFromUrl(
  isCustomType: (id: string) => boolean = () => false,
): Partial<MapViewState> {
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

  const zoom = undefineNaN(parseFloat(zoomFrag ?? ''));

  const layersStr = query.get('layers');

  let layers: string[] | undefined;

  if (!layersStr) {
    // nothing
  } else if (layersStr.includes('~')) {
    layers = layersStr.split('~');
  } else if (knownLayerIds().includes(layersStr)) {
    layers = [layersStr];
  } else {
    // backward compatibility
    layers = [];

    let rest = layersStr;

    while (rest.length) {
      const m = LAYERS_RE.exec(rest);

      if (!m?.[1]) {
        break;
      }

      layers.push(m[1]);

      rest = rest.slice(m[1].length);
    }

    // What the legacy parse can't read whole may be one catalog id; it would
    // otherwise take `Z0003` for the alias `Z`.
    if (rest && isCatalogId(layersStr)) {
      layers = [layersStr];
    }
  }

  layers = layers && resolveLayerAliases(layers);

  // A catalog id is kept unchecked: the catalog loads after the link is read.
  // `@<n>` is a preset the link carries in `p.<n>` params.
  layers = layers?.filter(
    (layer) =>
      layer in mapIndexById ||
      isCatalogId(layer) ||
      isCustomType(layer) ||
      /^@\d+$/.test(layer),
  );

  // Nothing it names is known here: rather the map as it is than an empty one.
  if (layers?.length === 0) {
    layers = undefined;
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
  }

  if (lat !== undefined && Math.abs(lat - state2.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (lon !== undefined && Math.abs(lon - state2.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom !== undefined && Math.abs(zoom - state2.zoom) > ZOOM_EPSILON) {
    changes.zoom = zoom;
  }

  return changes;
}
