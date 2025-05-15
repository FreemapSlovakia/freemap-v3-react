export const SHADING_TYPES = [
  'hillshade-igor',
  'hillshade-classic',
  'slope-igor',
  'slope-classic',
  // 'aspect',
  // 'color-relief',
] as const;

export type ShadingType = (typeof SHADING_TYPES)[number];

export type Shading = {
  id: number;
  type: ShadingType;
  elevation: number;
  azimuth: number;
  color: [number, number, number, number];
  contrast: number;
  brightness: number;
  weight: number;
};

// export type SlopeShading = Shading & {
//   type: `slope-${string}`;
// };

// export type HillshadeShading = Shading & {
//   type: `hillshade-${string}`;
//   azimuth: number;
// };
