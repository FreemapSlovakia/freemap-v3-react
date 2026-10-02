/**
 * Whether an id names a catalog map rather than a built-in one: five uppercase
 * letters or digits, at least one a letter. No built-in id has five characters,
 * and custom maps' ids are lowercase.
 */
export const isCatalogId = (id: string): boolean =>
  /^[0-9A-Z]{5}$/.test(id) && /[A-Z]/.test(id);
