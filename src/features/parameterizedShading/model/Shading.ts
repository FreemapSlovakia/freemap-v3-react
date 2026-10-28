import Color from 'color';
import z from 'zod';

export const SHADING_COMPONENT_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  'color-relief',
  'aspect',
  'curvature',
  'contours',
  'sky-view',
] as const;

/** What the shader holds per component (`NUM_STOPS` in `shading.wgsl`). */
export const MAX_COLOR_STOPS = 16;

/** Curvature's neighbourhood, pixels each way: by default 5×5. */
export const DEFAULT_CURVATURE_RADIUS = 2;

/** The widest neighbourhood in pixels: the widest border terrain-tiles serves. */
export const MAX_RADIUS_PX = 64;

export const MAX_RADIUS_M = 10_000;

export const RADIUS_UNITS = ['px', 'm'] as const;

export type RadiusUnit = (typeof RADIUS_UNITS)[number];

/** Sky-view factor (0–1), or positive or negative openness (degrees). */
export const SKY_MODES = ['svf', 'pos', 'neg'] as const;

export type SkyMode = (typeof SKY_MODES)[number];

/** Ground metres per pixel along the middle of tile row `y` at zoom `z`, as terrain-tiles takes it. */
export function centreGroundPx(z: number, y: number) {
  const px = (2 * Math.PI * 6378137) / 256 / 2 ** z;

  const mercY = Math.PI * (1 - (2 * (y + 0.5)) / 2 ** z);

  return px * Math.cos(Math.atan(Math.sinh(mercY)));
}

/** A metre radius in pixels at tile `z`/`y`, unclamped. */
export const metresToPx = (metres: number, z: number, y: number) =>
  Math.round(metres / centreGroundPx(z, y));

/** A layer's radius in pixels at tile `z`/`y`, as terrain-tiles reads it. */
export function radiusPx(
  c: { radius: number; radiusUnit: RadiusUnit },
  z: number,
  y: number,
) {
  return c.radiusUnit === 'px'
    ? c.radius
    : Math.min(Math.max(metresToPx(c.radius, z, y), 1), MAX_RADIUS_PX);
}

export const ColorSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export type Color = z.infer<typeof ColorSchema>;

/** Parse an `#rrggbb`/`#rrggbbaa` string into a `[r, g, b, a]` shading color. */
export function hexaToColor(hexa: string): Color {
  const c = Color(hexa);

  return [
    Math.round(c.red()),
    Math.round(c.green()),
    Math.round(c.blue()),
    c.alpha(),
  ];
}

/** A gradient's most opaque stop, which shows what it draws better than its first. */
export const swatchColor = (stops: ColorStop[]): Color =>
  stops.reduce((a, b) => (b.color[3] > a.color[3] ? b : a)).color;

/** The inverse of `hexaToColor`. */
export const colorToHexa = ([r, g, b, a]: Color) =>
  Color.rgb(r, g, b).alpha(a).hexa();

export const ColorStopSchema = z.object({
  value: z.number(),
  color: ColorSchema,
});

export type ColorStop = z.infer<typeof ColorStopSchema>;

export const ShadingComponentTypeSchema = z.enum(SHADING_COMPONENT_TYPES);

export type ShadingComponentType = z.infer<typeof ShadingComponentTypeSchema>;

const ShadingComponentBaseShape = {
  id: z.number(),
  contrast: z.number(),
  brightness: z.number(),
  colorStops: z.array(ColorStopSchema),
};

/** How far a neighbourhood reaches each way, in pixels or ground metres. */
const RadiusShape = {
  radius: z.number().default(DEFAULT_CURVATURE_RADIUS),
  radiusUnit: z.enum(RADIUS_UNITS).default('px'),
};

export const ShadingComponentSchema = z.discriminatedUnion('type', [
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('hillshade-igor'),
    azimuth: z.number(),
    exaggeration: z.number(),
  }),
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('hillshade-classic'),
    elevation: z.number(),
    azimuth: z.number(),
    exaggeration: z.number(),
  }),
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('slope-classic'),
    elevation: z.number(),
    exaggeration: z.number(),
  }),
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('slope-igor'),
    exaggeration: z.number(),
  }),
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('color-relief'),
  }),
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('aspect'),
  }),
  /**
   * Stops over the mean height within `radius` above the point, per metre of
   * ground: a local relief model.
   */
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('curvature'),
    exaggeration: z.number(),
    ...RadiusShape,
  }),
  /** A line every `interval` metres, `lineWidth` pixels wide. */
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('contours'),
    interval: z.number(),
    lineWidth: z.number(),
  }),
  /** Stops over what the horizon within `radius` leaves of the sky. */
  z.object({
    ...ShadingComponentBaseShape,
    type: z.literal('sky-view'),
    skyMode: z.enum(SKY_MODES),
    exaggeration: z.number(),
    ...RadiusShape,
  }),
]);

export type ShadingComponent = z.infer<typeof ShadingComponentSchema>;

export const ShadingSchema = z.object({
  backgroundColor: ColorSchema,
  components: z.array(ShadingComponentSchema),
});

export type Shading = z.infer<typeof ShadingSchema>;

/** A background is optional; a transparent one stands for none. */
export const hasBackground = (shading: Shading) =>
  shading.backgroundColor[3] > 0;

/**
 * Whether it covers what is beneath: a background, or a colour relief opaque at
 * every stop (aspect leaves flat ground transparent).
 */
export const isOpaqueShading = (shading: Shading) =>
  hasBackground(shading) ||
  shading.components.some(
    (c) =>
      c.type === 'color-relief' && c.colorStops.every((s) => s.color[3] >= 1),
  );

/**
 * `bg!type_params!…`, as the URL and the terrain-tiles server read it. Contrast
 * and brightness ride on the type as `type~contrast~brightness`, only when not
 * the defaults, so links from before them still read.
 */
export function serializeShading(shading: Shading) {
  const parts = [Color(shading.backgroundColor).hexa().slice(1)];

  for (const component of shading.components) {
    const levels =
      component.contrast !== 1 || component.brightness !== 0
        ? `~${component.contrast.toFixed(2)}~${component.brightness.toFixed(2)}`
        : '';

    const sub: string[] = [component.type + levels];

    // One colour, or `value_colour` pairs for a gradient.
    const colors = () => {
      if (component.colorStops.length === 1) {
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
      } else {
        stopPairs();
      }
    };

    function stopPairs() {
      for (const cs of component.colorStops) {
        sub.push(cs.value.toFixed(3));
        sub.push(Color(cs.color).hexa().slice(1));
      }
    }

    switch (component.type) {
      case 'hillshade-classic':
        sub.push((component.azimuth * (180 / Math.PI)).toFixed(1));
        sub.push((component.elevation * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        colors();
        break;
      case 'hillshade-igor':
        sub.push((component.azimuth * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        colors();
        break;
      case 'slope-classic':
        sub.push((component.elevation * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        colors();
        break;
      case 'slope-igor':
        sub.push(component.exaggeration.toFixed(1));
        colors();
        break;
      case 'contours':
        sub.push(component.interval.toFixed(1));
        sub.push(component.lineWidth.toFixed(2));
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
        break;
      case 'aspect':
      case 'color-relief':
        for (const cs of component.colorStops) {
          sub.push(cs.value.toFixed(1));
          sub.push(Color(cs.color).hexa().slice(1));
        }
        break;
      case 'curvature':
        sub.push(component.exaggeration.toFixed(1));

        // Only when not the default, so links from before it still read.
        if (
          component.radius !== DEFAULT_CURVATURE_RADIUS ||
          component.radiusUnit !== 'px'
        ) {
          sub.push(serializeRadius(component));
        }

        stopPairs();
        break;
      case 'sky-view':
        sub.push(component.skyMode);
        sub.push(component.exaggeration.toFixed(1));
        sub.push(serializeRadius(component));
        stopPairs();
        break;
    }

    parts.push(sub.join('_'));
  }

  return parts.join('!');
}

/** Pixels as a whole number, metres with an `m`. */
const serializeRadius = (c: { radius: number; radiusUnit: RadiusUnit }) =>
  c.radiusUnit === 'm' ? `${c.radius.toFixed(1)}m` : c.radius.toFixed(0);

/** As terrain-tiles accepts it: whole pixels 1…64, or metres up to 10 km. */
function parseRadius(s: string | undefined): {
  radius: number;
  radiusUnit: RadiusUnit;
} {
  const metres = s?.endsWith('m');

  const n = Number(metres ? s?.slice(0, -1) : s);

  if (s === undefined || !Number.isFinite(n)) {
    return { radius: DEFAULT_CURVATURE_RADIUS, radiusUnit: 'px' };
  }

  return metres
    ? {
        radius: Math.min(Math.max(Math.round(n * 10) / 10, 0.1), MAX_RADIUS_M),
        radiusUnit: 'm',
      }
    : {
        radius: Math.min(Math.max(Math.round(n), 1), MAX_RADIUS_PX),
        radiusUnit: 'px',
      };
}

function parseColor(color = '00000000'): Color {
  try {
    const bands = Color(`#${color}`).array();

    if (bands.length === 3) {
      bands.push(1);
    }

    return bands as Color;
  } catch {
    console.error(`error parsing color: ${color}`);

    return [0, 0, 0, 1];
  }
}

/** How many parameters precede a component's colours. */
const PARAM_COUNTS: Record<ShadingComponentType, number> = {
  'hillshade-igor': 2,
  'hillshade-classic': 3,
  'slope-igor': 1,
  'slope-classic': 2,
  'color-relief': 0,
  aspect: 0,
  curvature: 1,
  contours: 2,
  'sky-view': 3,
};

const isShadingComponentType = (
  type: string | undefined,
): type is ShadingComponentType =>
  (SHADING_COMPONENT_TYPES as readonly (string | undefined)[]).includes(type);

/** The inverse of `serializeShading`; an unknown component is skipped. */
export function parseShading(serialized: string): Shading {
  const [bg, ...comps] = serialized.split('!');

  const components = comps
    .map((component): ShadingComponent | undefined => {
      const [typeAndLevels, ...params] = component.split('_');

      const [type, contrast, brightness] = typeAndLevels.split('~');

      if (!isShadingComponentType(type)) {
        return undefined;
      }

      // A curvature radius makes the count after the exaggeration odd.
      const colors = params.splice(
        type === 'curvature' && params.length % 2 === 0
          ? 2
          : PARAM_COUNTS[type],
      );

      // Links from before exaggeration have one parameter fewer; their last
      // one is still the colour. Curvature and sky view came later.
      if (colors.length === 0 && type !== 'curvature' && type !== 'sky-view') {
        const last = params.pop();

        if (last !== undefined) {
          colors.push(last);
        }
      }

      // One colour (transparent when none), or `value_colour` pairs.
      const colorStops: ColorStop[] =
        colors.length <= 1
          ? [{ value: 0, color: parseColor(colors[0]) }]
          : Array.from(
              {
                length: Math.min(
                  Math.floor(colors.length / 2),
                  MAX_COLOR_STOPS,
                ),
              },
              (_, i) => ({
                value: Number(colors[2 * i]),
                color: parseColor(colors[2 * i + 1]),
              }),
            );

      const base = {
        id: Math.random(),
        contrast: contrast === undefined ? 1 : Number(contrast),
        brightness: brightness === undefined ? 0 : Number(brightness),
        colorStops,
      };

      const angle = () => Number(params.shift()) * (Math.PI / 180);

      switch (type) {
        case 'hillshade-classic':
          return {
            ...base,
            type,
            azimuth: angle(),
            elevation: angle(),
            exaggeration: Number(params.shift()),
          };
        case 'hillshade-igor':
          return {
            ...base,
            type,
            azimuth: angle(),
            exaggeration: Number(params.shift()),
          };
        case 'slope-classic':
          return {
            ...base,
            type,
            elevation: angle(),
            exaggeration: Number(params.shift()),
          };
        case 'slope-igor':
          return { ...base, type, exaggeration: Number(params.shift()) };
        case 'curvature':
          return {
            ...base,
            type,
            exaggeration: Number(params.shift()),
            ...parseRadius(params.shift()),
          };
        case 'sky-view': {
          const mode = params.shift();

          return {
            ...base,
            type,
            skyMode: SKY_MODES.find((m) => m === mode) ?? 'svf',
            exaggeration: Number(params.shift()),
            ...parseRadius(params.shift()),
          };
        }
        case 'contours':
          return {
            ...base,
            type,
            interval: Number(params.shift()),
            lineWidth: Number(params.shift()),
          };
        default:
          return { ...base, type };
      }
    })
    .filter((component) => component !== undefined);

  return { backgroundColor: parseColor(bg), components };
}
