import type { ShadingComponent, ShadingComponentType } from './Shading.js';

/** Builds a freshly-added shading component of `type` with sensible defaults. */
export function createDefaultShadingComponent(
  type: ShadingComponentType,
  id: number,
  colorReliefMax = 2660,
): ShadingComponent {
  function interpolate(
    ratio: number,
    from = 0,
    to = type === 'aspect' ? 2 * Math.PI : colorReliefMax,
  ) {
    return (to - from) * ratio + from;
  }

  const base: Omit<ShadingComponent, 'elevation' | 'azimuth' | 'type'> = {
    id,
    brightness: 0,
    contrast: 1,
    colorStops:
      type === 'color-relief' || type === 'aspect'
        ? [
            { value: interpolate(0 / 6), color: [255, 0, 0, 1] },
            { value: interpolate(1 / 6), color: [255, 255, 0, 1] },
            { value: interpolate(2 / 6), color: [0, 255, 0, 1] },
            { value: interpolate(3 / 6), color: [0, 255, 255, 1] },
            { value: interpolate(4 / 6), color: [0, 0, 255, 1] },
            { value: interpolate(5 / 6), color: [255, 0, 255, 1] },
            { value: interpolate(6 / 6), color: [255, 0, 0, 1] },
          ]
        : [{ value: 0, color: [0xff, 0xff, 0xff, 1] }],
  };

  return type === 'hillshade-classic'
    ? {
        type,
        ...base,
        elevation: 45 * (Math.PI / 180),
        azimuth: 315 * (Math.PI / 180),
        exaggeration: 1,
      }
    : type === 'slope-classic'
      ? { type, ...base, elevation: 45 * (Math.PI / 180), exaggeration: 1 }
      : type === 'hillshade-igor'
        ? { type, ...base, azimuth: 315 * (Math.PI / 180), exaggeration: 1 }
        : type === 'slope-igor'
          ? { type, ...base, exaggeration: 1 }
          : { type, ...base };
}
