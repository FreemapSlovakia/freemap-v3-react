import { BaseLayerLetters, overlayLetters } from 'fm3/mapDefinitions';
import {
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
  getTrasformedParamsIfIsOldFreemapUrl,
} from 'fm3/oldFreemapUtils';
import { Location } from 'history';
import queryString from 'query-string';
import { is } from 'typescript-is';
import { MapViewState } from './actions/mapActions';

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

  const [zoomFrag, latFrag, lonFrag] = (typeof query['map'] === 'string'
    ? query['map']
    : ''
  ).split('/');

  const lat = undefineNaN(parseFloat(latFrag));

  const lon = undefineNaN(parseFloat(lonFrag));

  const zoom = undefineNaN(parseInt(zoomFrag, 10));

  const layers = typeof query['layers'] === 'string' ? query['layers'] : '';

  const base = layers.charAt(0);

  const mapType = is<BaseLayerLetters>(base) ? base : undefined;

  const ovl = layers.slice(1);

  const overlays = overlayLetters.filter((x) => ovl.includes(x));

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
