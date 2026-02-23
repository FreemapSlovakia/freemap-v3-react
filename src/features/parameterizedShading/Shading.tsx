import Color from 'color';

export const SHADING_COMPONENT_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  'color-relief',
  'aspect',
] as const;

export type ColorStop = { value: number; color: Color };

export type Color = [number, number, number, number];

export type ShadingComponentType = (typeof SHADING_COMPONENT_TYPES)[number];

export type ShadingComponent = {
  id: number;
  contrast: number;
  brightness: number;
  colorStops: ColorStop[];
} & (
  | {
      type: 'hillshade-igor';
      azimuth: number;
      exaggeration: number;
    }
  | {
      type: 'hillshade-classic';
      elevation: number;
      azimuth: number;
      exaggeration: number;
    }
  | {
      type: 'slope-classic';
      elevation: number;
      exaggeration: number;
    }
  | {
      type: 'slope-igor';
      exaggeration: number;
    }
  | {
      type: 'color-relief' | 'aspect';
    }
);

export type Shading = {
  backgroundColor: Color;
  components: ShadingComponent[];
};

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
