import { describe, expect, it } from 'vitest';
import { panoramaSetRender } from './actions.js';
import {
  type PanoramaRenderInfo,
  type PanoramaState,
  panoramaInitialState,
  panoramaReducer,
} from './reducer.js';

/** A render of `fov` degrees facing `middle`, at a tenth of a degree a column. */
function render(middle: number, fov: number): PanoramaRenderInfo {
  return {
    id: 1,
    viewpoint: { lat: 49, lon: 20 },
    key: 'k',
    preview: false,
    eyeElevation: 1000,
    width: fov / 0.1,
    height: 300,
    azStart: middle - fov / 2,
    fov,
    altMin: -18,
    altMax: 12,
    stepDeg: 0.1,
    depthLift: 0,
    rangeM: 300_000,
    labels: [],
  };
}

const at = (state: Partial<PanoramaState>) => ({
  ...panoramaInitialState,
  ...state,
});

describe('panoramaSetRender', () => {
  it('leaves a bearing the picture holds alone, so an Update keeps the view', () => {
    const next = panoramaReducer(
      at({ azimuth: 20 }),
      panoramaSetRender(render(0, 90)),
    );

    expect(next.azimuth).toBe(20);
  });

  it('puts a bearing the picture never held in the middle of it', () => {
    // Not at the near end: a bearing this picture cannot show says nothing
    // about where in it to look, and the middle is what it was aimed at.
    const next = panoramaReducer(
      at({ azimuth: 200 }),
      panoramaSetRender(render(0, 90)),
    );

    expect(next.azimuth).toBe(0);
  });

  it('holds every bearing of a full turn', () => {
    const next = panoramaReducer(
      at({ azimuth: 200 }),
      panoramaSetRender(render(180, 360)),
    );

    expect(next.azimuth).toBe(200);
  });

  it('keeps a place named on the map, the eye not having moved', () => {
    const probe = { lat: 49.1, lon: 20.1, distance: 5000, azimuth: 10 };

    const next = panoramaReducer(
      at({ probe, render: render(90, 90) }),
      panoramaSetRender(render(0, 90)),
    );

    expect(next.probe).toEqual(probe);
  });

  it('drops it where the eye moved, its bearing being measured from there', () => {
    const from = render(90, 90);

    const next = panoramaReducer(
      at({
        probe: { lat: 49.1, lon: 20.1, distance: 5000, azimuth: 10 },
        render: from,
      }),
      panoramaSetRender({
        ...render(0, 90),
        viewpoint: { lat: from.viewpoint.lat + 0.01, lon: from.viewpoint.lon },
      }),
    );

    expect(next.probe).toBeNull();
  });

  // Both start from a render at the same viewpoint, or the eye-moved rule would
  // clear the probe before the one being tested got a say.
  it('drops a reading taken off the picture, its row being of that picture', () => {
    const next = panoramaReducer(
      at({
        probe: {
          lat: 49.1,
          lon: 20.1,
          distance: 5000,
          azimuth: 10,
          iy: 120,
        },
        render: render(90, 90),
      }),
      panoramaSetRender(render(0, 90)),
    );

    expect(next.probe).toBeNull();
  });

  it('drops a picked summit, which answers for the labels that came with it', () => {
    const next = panoramaReducer(
      at({
        probe: {
          lat: 49.1,
          lon: 20.1,
          distance: 5000,
          azimuth: 10,
          peak: { id: 'p1', name: 'Kriváň', ele: 2494 },
        },
        render: render(90, 90),
      }),
      panoramaSetRender(render(0, 90)),
    );

    expect(next.probe).toBeNull();
  });
});
