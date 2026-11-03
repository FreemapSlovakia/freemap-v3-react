import { isCatalogId } from './catalogId.js';

/**
 * The countries that tell where a map draws, or `undefined` when its box does
 * instead: a catalog map's country is only where it lies (a city orthophoto
 * names its whole country).
 */
export const coverageCountries = (def: {
  type: string;
  countries?: string[];
  bbox?: unknown;
}): string[] | undefined =>
  isCatalogId(def.type) && def.bbox ? undefined : def.countries;

type Bbox = [number, number, number, number];

/** The boxes a map covers: one per part where it has several, else its one. */
export const coverageBoxes = (def: { bbox?: Bbox; bboxes?: Bbox[] }): Bbox[] =>
  def.bboxes ?? (def.bbox ? [def.bbox] : []);

/** Whether a point lies outside every box. */
export const outsideBoxes = (
  boxes: readonly Bbox[],
  lon: number,
  lat: number,
): boolean =>
  boxes.every(
    (box) => lon < box[0] || lon > box[2] || lat < box[1] || lat > box[3],
  );
