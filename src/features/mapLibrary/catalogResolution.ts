import { isCatalogId } from '@shared/mapLibrary/catalogId.js';

/** Catalog ids the catalog turned out not to have. */
export const lackedCatalogIds = new Set<string>();

/**
 * Whether a layer may still turn out a base map: a catalog id neither known
 * (`kinds`) nor found missing. Until it resolves, no default base is added.
 */
export const isUnresolvedCatalogId = (
  type: string,
  kinds: ReadonlyMap<string, unknown>,
): boolean =>
  isCatalogId(type) && !kinds.has(type) && !lackedCatalogIds.has(type);
