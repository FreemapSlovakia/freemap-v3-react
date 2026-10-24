import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from '@reduxjs/toolkit';
import { polygon } from '@turf/helpers';
import type { Position } from 'geojson';

function openTool(
  dispatch: Dispatch,
  service: string,
  q: URLSearchParams,
  inJosm: boolean,
) {
  const url = `${service}?${q.toString()}`;

  if (inJosm) {
    fetch(
      `http://localhost:8111/import?new_layer=true&url=${encodeURIComponent(url)}`,
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error response from localhost:8111: ${res.status}`);
        }
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            messageKey: 'general.operationError',
            messageParams: { err },
            style: 'danger',
          }),
        );
      });
  } else {
    const aElem = document.createElement('a');

    aElem.href = url;

    aElem.target = '_blank';

    aElem.click();
  }
}

/**
 * Developer commands typed into a polygon's label, which take its outline
 * (`ring`, closed) as their area of interest. `true` says the label was one,
 * and nothing is to be saved.
 */
export function runDeveloperCommand(
  label: string,
  ring: Position[],
  dispatch: Dispatch,
): boolean {
  const mask = () => JSON.stringify(polygon([ring]));

  if (ring.length >= 4 && label === 'cry me a river') {
    const pixelSize = window.prompt('Pixel size?');

    if (pixelSize == null) {
      return true;
    }

    const threshold = window.prompt('Stream threshold?', '20000');

    if (!threshold) {
      return true;
    }

    const minLen = window.prompt('Minimum stream length?', '50');

    if (!minLen) {
      return true;
    }

    const simplifyTolerance = window.prompt('Simplify tolerance?', '1.5');

    if (!simplifyTolerance) {
      return true;
    }

    const inJosm = window.confirm('Open in JSOM?');

    const toOsm =
      inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

    const q = new URLSearchParams({
      threshold,
      'min-len': minLen,
      'simplify-tolerance': simplifyTolerance,
      mask: mask(),
    });

    if (pixelSize) {
      q.append('pixel-size', pixelSize);
    }

    if (toOsm) {
      q.append('to-osm', '1');
    }

    openTool(dispatch, 'https://streamfinder.freemap.sk', q, inJosm);

    return true;
  }

  if (label === 'run forest run') {
    const classifications = window.prompt('Classifications?', '4,5');

    if (!classifications) {
      return true;
    }

    const inJosm = window.confirm('Open in JSOM?');

    const toOsm =
      inJosm || window.confirm('Write as OSM? (otherwise ad GeoJSON)');

    const q = new URLSearchParams({
      classifications,
      mask: mask(),
      'to-osm': toOsm ? '1' : '',
    });

    openTool(dispatch, 'https://forester.freemap.sk', q, inJosm);

    return true;
  }

  return false;
}
