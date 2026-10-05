import Color from 'color';
import z from 'zod';

export const SHADING_COMPONENT_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  'color-relief',
  'aspect',
] as const;

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

    switch (component.type) {
      case 'hillshade-classic':
        sub.push((component.azimuth * (180 / Math.PI)).toFixed(1));
        sub.push((component.elevation * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
        break;
      case 'hillshade-igor':
        sub.push((component.azimuth * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
        break;
      case 'slope-classic':
        sub.push((component.elevation * (180 / Math.PI)).toFixed(1));
        sub.push(component.exaggeration.toFixed(1));
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
        break;
      case 'slope-igor':
        sub.push(component.exaggeration.toFixed(1));
        sub.push(Color(component.colorStops[0].color).hexa().slice(1));
        break;
      case 'aspect':
      case 'color-relief':
        for (const cs of component.colorStops) {
          sub.push(cs.value.toFixed(1));
          sub.push(Color(cs.color).hexa().slice(1));
        }
        break;
    }

    parts.push(sub.join('_'));
  }

  return parts.join('!');
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

/** The inverse of `serializeShading`; an unknown component is skipped. */
export function parseShading(serialized: string): Shading {
  const [bg, ...comps] = serialized.split('!');

  const components = comps
    .map((component): ShadingComponent | undefined => {
      const [typeAndLevels, ...params] = component.split('_');

      const [type, contrast, brightness] = typeAndLevels.split('~');

      let colorStops: ColorStop[];

      switch (type) {
        case 'hillshade-classic':
        case 'hillshade-igor':
        case 'slope-classic':
        case 'slope-igor':
          colorStops = [{ value: 0, color: parseColor(params.pop()) }];

          break;
        case 'aspect':
        case 'color-relief':
          colorStops = [];

          for (let i = 0; i < params.length; i += 2) {
            colorStops.push({
              value: Number(params[i]),
              color: parseColor(params[i + 1]),
            });
          }

          break;
        default:
          return undefined;
      }

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
        default:
          return { ...base, type };
      }
    })
    .filter((component) => component !== undefined);

  return { backgroundColor: parseColor(bg), components };
}
