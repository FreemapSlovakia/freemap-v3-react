export const SHADING_COMPONENT_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  // 'aspect',
  // 'color-relief',
] as const;

export type Color = [number, number, number, number];

export type ShadingComponentType = (typeof SHADING_COMPONENT_TYPES)[number];

export type ShadingComponent = {
  id: number;
  type: ShadingComponentType;
  elevation: number;
  azimuth: number;
  color: Color;
  contrast: number;
  brightness: number;
  weight: number;
};

export type Shading = {
  backgroundColor: Color;
  components: ShadingComponent[];
};
