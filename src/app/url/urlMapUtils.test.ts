import type { MapViewState } from '@features/map/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  getMapStateDiffFromUrl,
  getMapStateFromUrl,
  serializeZoom,
} from './urlMapUtils.js';

describe('serializeZoom', () => {
  it('writes a whole level as a bare integer', () => {
    // So links to a whole zoom read exactly as they always have.
    expect(serializeZoom(13)).toBe('13');
    expect(serializeZoom(0)).toBe('0');
  });

  it('keeps two decimals and drops trailing zeros', () => {
    expect(serializeZoom(13.75)).toBe('13.75');
    expect(serializeZoom(13.5)).toBe('13.5');
    expect(serializeZoom(13.756)).toBe('13.76');
  });
});

describe('getMapStateDiffFromUrl — zoom', () => {
  const state: MapViewState = {
    lat: 48.7,
    lon: 19.5,
    zoom: 13.756,
    layers: [],
  };

  it('reads a URL written from the same view as unchanged', () => {
    // The URL carries two decimals, the store the full precision it was
    // written from; the difference between them is not a change to apply.
    const zoom = Number(serializeZoom(state.zoom));

    expect(getMapStateDiffFromUrl({ zoom }, state)).toEqual({});
  });

  it('reports a zoom that really differs', () => {
    expect(getMapStateDiffFromUrl({ zoom: 13.5 }, state)).toEqual({
      zoom: 13.5,
    });
  });
});

describe('getMapStateFromUrl — layers', () => {
  const layersOf = (layers: string) => {
    location.hash = `#map=12/48.2/16.37&layers=${layers}`;

    return getMapStateFromUrl().layers;
  };

  it('reads a lone catalog id as itself, not as a legacy alias', () => {
    expect(layersOf('Z0003')).toEqual(['Z0003']);
  });

  it('reads a lone catalog id written with its `~` whole', () => {
    expect(layersOf('XSJ17~')).toEqual(['XSJ17']);
  });

  it('keeps reading legacy concatenated layers', () => {
    expect(layersOf('XSJ17')).toEqual(['X', 'S', 'J1', '7']);
  });
});
