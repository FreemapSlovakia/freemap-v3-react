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
