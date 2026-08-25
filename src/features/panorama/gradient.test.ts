import { describe, expect, it } from 'vitest';
import {
  cssToStops,
  GRADIENT_MAX_STOPS,
  GRADIENT_PRESETS,
  gradientFarStepIndex,
  gradientFarSteps,
  gradientRequest,
  gradientToCss,
  MAX_RECENT_GRADIENTS,
  type PanoramaGradient,
  type PanoramaGradientStop,
  panoramaGroundInk,
  previewStops,
  rememberedGradients,
  SKY_COLOR,
  storedStops,
} from './gradient.js';

const gradient: PanoramaGradient = {
  stops: [
    { pos: 0, color: '#3a4a34' },
    { pos: 0.45, color: '#6f89a0' },
    { pos: 1, color: '#9fbcd6' },
  ],
  fadeToSky: true,
  farKm: 150,
  clip: true,
};

describe('gradientToCss / cssToStops', () => {
  it('round-trips the stops', () => {
    expect(cssToStops(gradientToCss(gradient.stops))).toEqual({
      stops: gradient.stops,
      active: undefined,
    });
  });

  it('carries which stop the picker has selected', () => {
    expect(cssToStops(gradientToCss(gradient.stops, 1))?.active).toBe(1);
  });

  it('answers nothing for a plain colour, which is how the solid tab reads', () => {
    expect(cssToStops('rgba(58,74,52,1)')).toBeNull();
  });

  it('reads back every preset it offers', () => {
    for (const preset of GRADIENT_PRESETS) {
      expect(cssToStops(preset)?.stops.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('gradientFarSteps', () => {
  it('offers Automatic and then the rungs the range reaches', () => {
    expect(gradientFarSteps(20)).toEqual([null, 1, 2, 3, 5, 7, 10, 15, 20]);
  });

  it('stands Automatic at the near end', () => {
    expect(gradientFarStepIndex(gradientFarSteps(400), null)).toBe(0);
  });

  it('finds the rung a stored distance sits on', () => {
    const steps = gradientFarSteps(400);

    expect(steps[gradientFarStepIndex(steps, 150)]).toBe(150);
  });

  // A range lowered under the stored figure: the knob has to land where the
  // request is clamped to, or the two say different things.
  it('lands on the farthest rung the range still reaches', () => {
    const steps = gradientFarSteps(100);

    expect(steps[gradientFarStepIndex(steps, 400)]).toBe(100);
  });
});

describe('panoramaGroundInk', () => {
  it('is the near ground, wherever in the list that stop sits', () => {
    expect(
      panoramaGroundInk('#000000', {
        ...gradient,
        stops: [...gradient.stops].reverse(),
      }),
    ).toBe('#3a4a34');
  });

  it('falls back to the plain colour without a ramp', () => {
    expect(panoramaGroundInk('#000000', null)).toBe('#000000');
  });
});

describe('rememberedGradients', () => {
  const ramp = (color: string) => [
    { pos: 0, color },
    { pos: 1, color: '#ffffff' },
  ];

  it('puts the newest first', () => {
    expect(rememberedGradients([ramp('#111111')], ramp('#222222'))).toEqual([
      ramp('#222222'),
      ramp('#111111'),
    ]);
  });

  it('moves one it already holds rather than keeping it twice', () => {
    expect(
      rememberedGradients([ramp('#111111'), ramp('#222222')], ramp('#222222')),
    ).toEqual([ramp('#222222'), ramp('#111111')]);
  });

  // A slot spent saying what is already on screen is a slot wasted.
  it('does not keep one of the built-in swatches', () => {
    const preset = cssToStops(GRADIENT_PRESETS[0])?.stops ?? [];

    expect(rememberedGradients([], preset)).toEqual([]);
  });

  it('keeps no more than the picker has room for', () => {
    let kept: PanoramaGradientStop[][] = [];

    for (let i = 0; i < MAX_RECENT_GRADIENTS + 3; i++) {
      kept = rememberedGradients(
        kept,
        ramp(`#0000${String(i).padStart(2, '0')}`),
      );
    }

    expect(kept).toHaveLength(MAX_RECENT_GRADIENTS);
  });
});

describe('previewStops', () => {
  it('shows the sky at the fading end, and nowhere else', () => {
    expect(previewStops(gradient).map((s) => s.color)).toEqual([
      '#3a4a34',
      '#6f89a0',
      SKY_COLOR,
    ]);
  });

  it('leaves the stops alone where the ramp ends in a colour', () => {
    expect(previewStops({ ...gradient, fadeToSky: false })).toBe(
      gradient.stops,
    );
  });
});

describe('storedStops', () => {
  const shown = previewStops(gradient);

  it('puts the fading end back to the colour it holds', () => {
    expect(storedStops(gradient, shown)).toEqual(gradient.stops);
  });

  // Otherwise the literal sky stands mid-ramp, to surface as a band nobody
  // chose the moment the fade is turned off.
  it('puts it back when a stop has been added beyond it', () => {
    const added = [...shown, { pos: 1, color: '#ff0000' }];

    expect(storedStops(gradient, added).map((s) => s.color)).toEqual([
      '#3a4a34',
      '#6f89a0',
      '#9fbcd6',
      '#ff0000',
    ]);
  });

  it('keeps a colour the user painted at that end', () => {
    const painted = shown.with(2, { pos: 1, color: '#123456' });

    expect(storedStops(gradient, painted).at(-1)?.color).toBe('#123456');
  });

  it('sorts and cuts to what the service takes', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      pos: 1 - i / 40,
      color: '#000000',
    }));

    const stored = storedStops(null, many);

    expect(stored).toHaveLength(GRADIENT_MAX_STOPS);

    expect(stored[0].pos).toBeLessThan(stored[1].pos);
  });
});

describe('gradientRequest', () => {
  it('asks for the sky at the last stop, and only there', () => {
    expect(gradientRequest(gradient, 300_000).stops).toEqual([
      [0, '#3a4a34'],
      [0.45, '#6f89a0'],
      [1, 'sky'],
    ]);
  });

  it('keeps the last colour where the ramp is not to fade', () => {
    expect(
      gradientRequest({ ...gradient, fadeToSky: false }, 300_000).stops.at(-1),
    ).toEqual([1, '#9fbcd6']);
  });

  it('measures the frame where no distance is pinned', () => {
    expect(
      gradientRequest({ ...gradient, farKm: null }, 300_000),
    ).toMatchObject({ far_distance: 'auto' });
  });

  // The service refuses a ramp ending past anything the render can draw, which
  // is what a range shrunk under a stored far distance would ask for.
  it('never reaches past the range', () => {
    expect(
      gradientRequest({ ...gradient, farKm: 400 }, 300_000).far_distance,
    ).toBe(300_000);
  });

  it('sorts stops the store may hold out of order', () => {
    expect(
      gradientRequest(
        {
          ...gradient,
          fadeToSky: false,
          stops: [
            { pos: 1, color: '#ffffff' },
            { pos: 0, color: '#000000' },
          ],
        },
        300_000,
      ).stops,
    ).toEqual([
      [0, '#000000'],
      [1, '#ffffff'],
    ]);
  });

  // What a previous pass measured, so several renders agree about colour.
  it('takes a pinned distance over the setting, in metres', () => {
    expect(gradientRequest(gradient, 300_000, 70_000).far_distance).toBe(
      70_000,
    );
  });
});
