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

/**
 * A background with no alpha: nothing is under a base map to show through it.
 * No background at all (an overlay's) becomes white.
 */
export function withOpaqueBackground(shading: Shading): Shading {
  const [r, g, b, a] = shading.backgroundColor;

  return a === 1
    ? shading
    : {
        ...shading,
        backgroundColor: a === 0 ? [255, 255, 255, 1] : [r, g, b, 1],
      };
}

/** A shading layer's shading as drawn: its draft, its own, else the shared one. */
export function effectiveShading(
  def: { type: string; layer: 'base' | 'overlay'; shading?: Shading },
  drafts: Record<string, Shading>,
  shared: Shading,
): Shading {
  const shading = drafts[def.type] ?? def.shading ?? shared;

  return def.layer === 'base' ? withOpaqueBackground(shading) : shading;
}

/** An overlay's background is optional; a transparent one stands for none. */
export const hasBackground = (shading: Shading) =>
  shading.backgroundColor[3] > 0;

export function serializeShading(shading: Shading) {
  const parts = [Color(shading.backgroundColor).hexa().slice(1)];

  for (const component of shading.components) {
    const sub: string[] = [component.type];

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
