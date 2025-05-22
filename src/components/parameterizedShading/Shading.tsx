export const SHADING_COMPONENT_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  'color-relief',
  'aspect',
] as const;

export type ColorStop = [ratio: number, color: Color];

export type Color = [number, number, number, number];

export type ShadingComponentType = (typeof SHADING_COMPONENT_TYPES)[number];

export type ShadingComponent = {
  id: number;
  type: ShadingComponentType;
  elevation: number;
  azimuth: number;
  contrast: number;
  brightness: number;
  colors: ColorStop[];
};

export type Shading = {
  backgroundColor: Color;
  components: ShadingComponent[];
};
