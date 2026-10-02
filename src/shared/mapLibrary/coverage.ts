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
