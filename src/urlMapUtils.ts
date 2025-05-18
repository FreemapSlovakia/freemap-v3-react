import { is } from 'typia';
import { MapViewState } from './actions/mapActions.js';
import {
  BaseLayerLetters,
  OverlayLetters,
  overlayLetters,
} from './mapDefinitions.js';
import {
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
  getTrasformedParamsIfIsOldFreemapUrl,
} from './oldFreemapUtils.js';

export function getMapStateFromUrl(): Partial<MapViewState> &
  Pick<MapViewState, 'overlays'> {
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

  const layers = query.get('layers') ?? '';

  let base = layers.charAt(0);

  const isTwoChar = base === '.' || base === 'V';

  if (isTwoChar) {
    base += layers.charAt(1);
  }

  const mapType = is<BaseLayerLetters>(base) ? base : undefined;

  const ovl = layers.slice(isTwoChar ? 2 : 1);

  const overlays: OverlayLetters[] = overlayLetters.filter((x) =>
    ovl.includes(x),
  );

  overlays.push(...((ovl.match(/:\d+/g) ?? []) as OverlayLetters[]));

  return { lat, lon, zoom, mapType, overlays };
}

function undefineNaN(val: number): number | undefined {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(
  state1: Partial<MapViewState> & Pick<MapViewState, 'overlays'>,
  state2: MapViewState,
): Partial<MapViewState> | null {
  const { lat, lon, zoom, mapType, overlays = [] } = state1;

  const changes: Partial<MapViewState> = {};

  if (mapType && mapType !== state2.mapType) {
    changes.mapType = mapType;
  }

  if (mapType && overlays.join('') !== state2.overlays.join('')) {
    changes.overlays = overlays;

    if (state2.overlays.includes('i')) {
      changes.overlays.push('i');
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
