import queryString from 'query-string';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import {
  getTrasformedParamsIfIsOldFreemapUrl,
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
} from 'fm3/oldFreemapUtils';
import { Location } from 'history';
import { MapViewState } from './actions/mapActions';

const baseLetters = baseLayers.map(({ type }) => type);
const overlayLetters = overlayLayers.map(({ type }) => type);

export function getMapStateFromUrl(
  location: Location,
): Partial<MapViewState> & Pick<MapViewState, 'overlays'> {
  {
    const transformedParams = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(
      location,
    );
    if (transformedParams) {
      return transformedParams;
    }
  }

  {
    const transformedParams = getTrasformedParamsIfIsOldFreemapUrl(location);
    if (transformedParams) {
      return transformedParams;
    }
  }

  const query = queryString.parse(location.search);

  const [zoomFrag, latFrag, lonFrag] = (typeof query.map === 'string'
    ? query.map
    : ''
  ).split('/');

  const lat = undefineNaN(parseFloat(latFrag));
  const lon = undefineNaN(parseFloat(lonFrag));
  const zoom = undefineNaN(parseInt(zoomFrag, 10));

  const layers = typeof query.layers === 'string' ? query.layers : '';

  const base = layers.charAt(0);
  const mapType = baseLetters.includes(base) ? base : undefined;
  const ovl = layers.substring(1).replace(/s\D|s$/, 's0');
  const overlays = overlayLetters.filter(x => ovl.includes(x));

  return { lat, lon, zoom, mapType, overlays };
}

function undefineNaN(val: number) {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(
  state1:
    | Partial<MapViewState> & Pick<MapViewState, 'overlays'>
    | null
    | undefined,
  state2: MapViewState,
) {
  if (!state1 || !state2) {
    return null;
  }

  const { lat, lon, zoom, mapType, overlays = [] } = state1;
  const changes: Partial<MapViewState> = {};

  if (mapType && mapType !== state2.mapType) {
    changes.mapType = mapType;
  }

  if (mapType && overlays.join('') !== state2.overlays.join('')) {
    changes.overlays = overlays;
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
