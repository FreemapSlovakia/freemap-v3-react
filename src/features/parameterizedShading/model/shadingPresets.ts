import {
  type Color,
  hasBackground,
  type Shading,
  type ShadingComponent,
} from './Shading.js';

export const MAP_PRESETS = [
  'classic',
  'outdoor',
  'shadow',
  'multidirectional',
  'plastic',
  'swiss',
  'slope',
  'hypsometric',
  'aspect',
  'contour',
  'fog',
] as const;

export const ARTISTIC_PRESETS = [
  'metallic',
  'sepia',
  'night',
  'moonlight',
  'golden',
  'glacier',
  'mars',
  'ink',
  'blueprint',
  'neon',
  'watercolor',
  'autumn',
] as const;

export const SHADING_PRESETS = [...MAP_PRESETS, ...ARTISTIC_PRESETS] as const;

export type ShadingPreset = (typeof SHADING_PRESETS)[number];

/** Presets built from what the user enters in a form. */
export const PARAMETERIZED_PRESETS = [
  'contour',
  'fog',
  'hypsometric',
  'metallic',
] as const satisfies readonly ShadingPreset[];

export type ParameterizedPreset = (typeof PARAMETERIZED_PRESETS)[number];

export const isParameterized = (
  preset: ShadingPreset,
): preset is ParameterizedPreset =>
  (PARAMETERIZED_PRESETS as readonly ShadingPreset[]).includes(preset);

export type PresetParams = {
  elevation: number;
  bandWidth: number;
  /** Contour's colour, fog's below colour, metallic's highlight. */
  color: Color;
  /** Fog's colour above the band. */
  aboveColor: Color;
  /** Where hypsometric tints reach their top colour. */
  maxElevation: number;
  /** Metallic's colour between the highlights. */
  darkColor: Color;
  /** Metallic's highlights around the compass. */
  repeats: number;
};

export const DEFAULT_PRESET_PARAMS: PresetParams = {
  elevation: 500,
  bandWidth: 10,
  color: [255, 255, 255, 1],
  aboveColor: [0xe6, 0xe6, 0xe6, 0],
  maxElevation: 3000,
  darkColor: [0, 0, 0, 1],
  repeats: 3,
};

const deg = (d: number) => d * (Math.PI / 180);

const levels = { contrast: 1, brightness: 0 };

/**
 * `azimuth` is where the light comes from; this Igor darkens the slopes facing
 * its own azimuth, so it gets the opposite one.
 */
const igor = (azimuth: number, color: Color): ShadingComponent => ({
  id: 0,
  type: 'hillshade-igor',
  ...levels,
  azimuth: deg((azimuth + 180) % 360),
  exaggeration: 1,
  colorStops: [{ value: 0, color }],
});

/** Light at 315°, 45°: `color` lit, `background` in shadow. */
const classic = (background: Color, color: Color): Shading => ({
  backgroundColor: background,
  components: [
    {
      id: 0,
      type: 'hillshade-classic',
      ...levels,
      azimuth: deg(315),
      elevation: deg(45),
      exaggeration: 1,
      colorStops: [{ value: 0, color }],
    },
  ],
});

const relief = (stops: [number, Color][]): ShadingComponent => ({
  id: 0,
  type: 'color-relief',
  ...levels,
  colorStops: stops.map(([value, color]) => ({ value, color })),
});

const slope = (color: Color): ShadingComponent => ({
  id: 0,
  type: 'slope-igor',
  ...levels,
  exaggeration: 1,
  colorStops: [{ value: 0, color }],
});

/**
 * Light from `azimuth`: `shadow` on the slopes facing away, `light` on those
 * facing it.
 */
const lit = (
  background: Color,
  azimuth: number,
  shadow: Color,
  light: Color,
): Shading => ({
  backgroundColor: background,
  components: [igor(azimuth, shadow), igor((azimuth + 180) % 360, light)],
});

function build(preset: ShadingPreset, p: PresetParams): Shading {
  switch (preset) {
    case 'classic':
      return classic([0, 0, 0, 1], [255, 255, 255, 1]);

    case 'sepia':
      return classic([0x40, 0x2c, 0x18, 1], [0xff, 0xee, 0xcc, 1]);

    case 'night':
      return classic([0x0e, 0x12, 0x1c, 1], [0xb0, 0xc4, 0xde, 1]);

    case 'shadow':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [igor(315, [0, 0, 0, 1])],
      };

    case 'plastic':
      return lit(
        [0x80, 0x80, 0x80, 1],
        315,
        [0, 0, 0, 0.8],
        [255, 255, 255, 0.8],
      );

    case 'slope':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [slope([0, 0, 0, 1])],
      };

    case 'moonlight':
      return {
        backgroundColor: [0x10, 0x18, 0x30, 1],
        components: [igor(135, [0xd8, 0xe4, 0xff, 0.9])],
      };

    // A low sun from the south-west: violet shadows, orange light.
    case 'golden':
      return lit(
        [0xf6, 0xe7, 0xcf, 1],
        225,
        [0x4a, 0x2c, 0x6e, 0.8],
        [0xff, 0x9a, 0x3c, 0.6],
      );

    case 'glacier':
      return lit(
        [0xff, 0xff, 0xff, 1],
        315,
        [0x1e, 0x5a, 0x8c, 0.9],
        [0xe0, 0xf4, 0xff, 0.6],
      );

    case 'mars':
      return lit(
        [0xc8, 0x6b, 0x3c, 1],
        315,
        [0x4a, 0x16, 0x0a, 0.9],
        [0xff, 0xd0, 0x90, 0.5],
      );

    case 'ink':
      return {
        backgroundColor: [0xf5, 0xf0, 0xe6, 1],
        components: [slope([0x1a, 0x1a, 0x1a, 0.9]), igor(315, [0, 0, 0, 0.5])],
      };

    case 'blueprint':
      return {
        backgroundColor: [0x0b, 0x3d, 0x91, 1],
        components: [slope([255, 255, 255, 1])],
      };

    case 'neon':
      return {
        backgroundColor: [0x14, 0x0a, 0x28, 1],
        components: [
          slope([0xff, 0x2e, 0xa6, 1]),
          igor(315, [0x2e, 0xe6, 0xff, 0.7]),
        ],
      };

    case 'watercolor':
      return {
        backgroundColor: [0xfb, 0xf7, 0xee, 1],
        components: [
          relief([
            [0, [0x9f, 0xd8, 0xcb, 0.45]],
            [400, [0xf7, 0xe1, 0xa0, 0.45]],
            [1200, [0xf4, 0xa6, 0x8c, 0.45]],
            [2500, [0xc9, 0xa7, 0xe0, 0.45]],
          ]),
          igor(315, [0x3c, 0x4a, 0x7a, 0.5]),
        ],
      };

    case 'autumn':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          relief([
            [0, [0x6b, 0x8e, 0x23, 1]],
            [300, [0xc8, 0xa0, 0x28, 1]],
            [700, [0xd2, 0x69, 0x1e, 1]],
            [1200, [0x8b, 0x25, 0x00, 1]],
            [2000, [0x5a, 0x3a, 0x2a, 1]],
            [3000, [0xf4, 0xf0, 0xe8, 1]],
          ]),
          igor(315, [0, 0, 0, 0.7]),
        ],
      };

    // The outdoor map's tiles: freemap-outdoor-map scripts/lib/shading.nu.
    case 'outdoor':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          igor(240, [0x20, 0x30, 0x60, 0.8]),
          igor(60, [0xff, 0xee, 0x00, 0.7]),
          igor(315, [0, 0, 0, 1]),
        ],
      };

    case 'multidirectional':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [225, 270, 315, 360].map((az) => igor(az, [0, 0, 0, 0.4])),
      };

    // Blue-grey shadows, warm light on the slopes facing the sun.
    case 'swiss':
      return lit(
        [0xf2, 0xef, 0xe4, 1],
        315,
        [0x2c, 0x3e, 0x6b, 0.8],
        [0xff, 0xe6, 0x80, 0.5],
      );

    // Metres for a 3000 m top, scaled to `maxElevation`; closer together low
    // down where most land is.
    case 'hypsometric': {
      const at = (metres: number) =>
        Math.round((metres / 3000) * p.maxElevation);

      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          relief([
            [0, [0x5a, 0x9e, 0x5a, 1]],
            [at(200), [0xa8, 0xc8, 0x78, 1]],
            [at(500), [0xe8, 0xdc, 0x96, 1]],
            [at(1000), [0xd4, 0xa8, 0x68, 1]],
            [at(1600), [0xb0, 0x7c, 0x54, 1]],
            [at(2300), [0x96, 0x82, 0x78, 1]],
            [at(3000), [0xff, 0xff, 0xff, 1]],
          ]),
          igor(315, [0, 0, 0, 0.8]),
        ],
      };
    }

    case 'contour': {
      const [r, g, b] = p.color;

      const from = p.elevation - p.bandWidth / 2;

      const to = p.elevation + p.bandWidth / 2;

      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          relief([
            [from, [r, g, b, 0]],
            [from, p.color],
            [to, p.color],
            [to, [r, g, b, 0]],
          ]),
        ],
      };
    }

    case 'fog':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          relief([
            [p.elevation - p.bandWidth / 2, p.color],
            [p.elevation + p.bandWidth / 2, p.aboveColor],
          ]),
        ],
      };

    // Alternating dark and light by aspect, like brushed metal; an odd stop
    // count makes north dark on both ends, so there is no seam.
    case 'metallic':
      return {
        backgroundColor: p.color,
        components: [
          {
            id: 0,
            type: 'aspect',
            ...levels,
            colorStops: Array.from({ length: 2 * p.repeats + 1 }, (_, i) => ({
              value: (i / (2 * p.repeats)) * 2 * Math.PI,
              color: i % 2 ? p.color : p.darkColor,
            })),
          },
        ],
      };

    case 'aspect':
      return {
        backgroundColor: [0, 0, 0, 0],
        components: [
          {
            id: 0,
            type: 'aspect',
            ...levels,
            colorStops: [
              [255, 0, 0],
              [255, 255, 0],
              [0, 255, 0],
              [0, 255, 255],
              [0, 0, 255],
              [255, 0, 255],
              [255, 0, 0],
            ].map(([r, g, b], i) => ({
              value: (i / 6) * 2 * Math.PI,
              color: [r, g, b, 0.6],
            })),
          },
          {
            id: 0,
            type: 'slope-igor',
            ...levels,
            exaggeration: 1,
            colorStops: [{ value: 0, color: [0, 0, 0, 0.6] }],
          },
        ],
      };
  }
}

/**
 * Whether the preset covers what is beneath: a background, or a colour relief
 * opaque at every stop (aspect leaves flat ground transparent).
 */
export function isOpaquePreset(preset: ShadingPreset) {
  const shading = build(preset, DEFAULT_PRESET_PARAMS);

  return (
    hasBackground(shading) ||
    shading.components.some(
      (c) =>
        c.type === 'color-relief' && c.colorStops.every((s) => s.color[3] >= 1),
    )
  );
}

/** The preset's shading, its components numbered by `newId`. */
export function shadingPreset(
  preset: ShadingPreset,
  newId: () => number,
  params = DEFAULT_PRESET_PARAMS,
): Shading {
  const shading = build(preset, params);

  return {
    ...shading,
    components: shading.components.map((c) => ({ ...c, id: newId() })),
  };
}
