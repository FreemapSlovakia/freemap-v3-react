import {
  type ColorStop,
  DEFAULT_CURVATURE_RADIUS,
  type ShadingComponent,
  type ShadingComponentType,
  type SkyMode,
} from './Shading.js';

/** Hollows teal, ridges cream, flat ground clear. */
const CURVATURE_STOPS: ColorStop[] = [
  { value: -0.07, color: [0xee, 0xd6, 0xb0, 1] },
  { value: -0.007, color: [0xee, 0xd6, 0xb0, 0] },
  { value: 0.007, color: [0x2e, 0x58, 0x66, 0] },
  { value: 0.07, color: [0x2e, 0x58, 0x66, 1] },
];

/** Enclosed ground dark and open ground clear; openness lightens ridges too. */
export function skyViewStops(mode: SkyMode): ColorStop[] {
  switch (mode) {
    case 'svf':
      return [
        { value: 0.6, color: [0, 0, 0, 0.8] },
        { value: 1, color: [0, 0, 0, 0] },
      ];
    case 'pos':
      return [
        { value: 70, color: [0, 0, 0, 0.8] },
        { value: 90, color: [0, 0, 0, 0] },
        { value: 110, color: [255, 255, 255, 0.8] },
      ];
    case 'neg':
      return [
        { value: 70, color: [255, 255, 255, 0.8] },
        { value: 90, color: [0, 0, 0, 0] },
        { value: 110, color: [0, 0, 0, 0.8] },
      ];
  }
}

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

  const base = {
    id,
    brightness: 0,
    contrast: 1,
    colorStops: [{ value: 0, color: [0xff, 0xff, 0xff, 1] }] as ColorStop[],
  };

  switch (type) {
    case 'hillshade-classic':
      return {
        type,
        ...base,
        elevation: 45 * (Math.PI / 180),
        azimuth: 315 * (Math.PI / 180),
        exaggeration: 1,
      };
    case 'slope-classic':
      return {
        type,
        ...base,
        elevation: 45 * (Math.PI / 180),
        exaggeration: 1,
      };
    case 'hillshade-igor':
      return {
        type,
        ...base,
        azimuth: 315 * (Math.PI / 180),
        exaggeration: 1,
      };
    case 'slope-igor':
      return { type, ...base, exaggeration: 1 };
    case 'curvature':
      return {
        type,
        ...base,
        colorStops: CURVATURE_STOPS,
        exaggeration: 1,
        radius: DEFAULT_CURVATURE_RADIUS,
        radiusUnit: 'px',
      };
    case 'sky-view':
      return {
        type,
        ...base,
        colorStops: skyViewStops('svf'),
        skyMode: 'svf',
        exaggeration: 1,
        radius: 10,
        radiusUnit: 'px',
      };
    case 'contours':
      return {
        type,
        ...base,
        colorStops: [{ value: 0, color: [0x8b, 0x5a, 0x2b, 0.8] }],
        interval: 20,
        lineWidth: 1,
      };
    case 'color-relief':
    case 'aspect':
      return {
        type,
        ...base,
        colorStops: [
          { value: interpolate(0 / 6), color: [255, 0, 0, 1] },
          { value: interpolate(1 / 6), color: [255, 255, 0, 1] },
          { value: interpolate(2 / 6), color: [0, 255, 0, 1] },
          { value: interpolate(3 / 6), color: [0, 255, 255, 1] },
          { value: interpolate(4 / 6), color: [0, 0, 255, 1] },
          { value: interpolate(5 / 6), color: [255, 0, 255, 1] },
          { value: interpolate(6 / 6), color: [255, 0, 0, 1] },
        ],
      };
  }
}
