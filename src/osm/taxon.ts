// A species name begins with its genus (`Juglans regia`), and `species` is
// often tagged without `genus`. Naming and the objects search both rely on it.

/** Genera tagged under another name: a former one, a common misspelling. */
const genusSynonyms: Record<string, string> = {
  Sophora: 'Styphnolobium',
  Styphlonobium: 'Styphnolobium',
};

/**
 * `genus`/`species` in botanical case, the genus taken from `species` or
 * `taxon` when missing, both moved last so that the feature itself is named
 * first.
 */
export function normalizeTaxonTags(
  tags: Record<string, string>,
): Record<string, string> {
  const speciesTag = [tags['species'], tags['taxon']].find(
    (v) => typeof v === 'string' && v,
  );

  const genusTag =
    typeof tags['genus'] === 'string' && tags['genus']
      ? tags['genus']
      : speciesTag;

  if (!genusTag) {
    return tags;
  }

  const { genus, species, taxon, ...rest } = tags;

  return {
    ...rest,
    genus: toTaxonCase(genusTag, 1),
    ...(speciesTag && { species: toTaxonCase(speciesTag, 2) }),
  };
}

/** `quercus Robur 'Fastigiata'` → `Quercus robur`, keeping `;`-separated values. */
function toTaxonCase(value: string, words: number) {
  // Deduplicated: identical parts eliminate each other as more generic, which
  // `Quercus robur;Quercus petraea` would otherwise yield as the genus.
  return [
    ...new Set(
      value.split(';').map((v) => {
        const [first = '', ...rest] = v.trim().toLowerCase().split(/\s+/);

        const genus = first.charAt(0).toUpperCase() + first.slice(1);

        return [
          words === 1 ? (genusSynonyms[genus] ?? genus) : genus,
          ...rest.slice(0, words - 1),
        ].join(' ');
      }),
    ),
  ].join(';');
}

/** A tree genus category as saved before `genus` became its own category. */
export function upgradeObjectFilter(filter: string): string {
  return filter.startsWith('natural=tree,genus=')
    ? filter.slice('natural=tree,'.length)
    : filter;
}

/**
 * An objects-search filter as sent to the OSM API: a genus also matches its
 * synonyms and the species of it, and a species ignores `genus` and a trailing
 * cultivar. `taxon` stands in for `species`, as in naming. `k^=v` needs words
 * after `v`, so the bare value is its own clause.
 */
export function taxonSearchFilters(filter: string): string[] {
  const predicates = filter.split(',');

  const predicateValue = (key: string) =>
    predicates
      .find((predicate) => predicate.startsWith(`${key}=`))
      ?.slice(key.length + 1);

  const species = predicateValue('species');

  const genus = predicateValue('genus');

  const rest = predicates.filter(
    (predicate) =>
      !predicate.startsWith('genus=') && !predicate.startsWith('species='),
  );

  const withRest = (predicate: string) => [...rest, predicate].join(',');

  const taxonClauses = (name: string) =>
    ['species', 'taxon'].flatMap((key) => [
      withRest(`${key}=${name}`),
      withRest(`${key}^=${name}`),
    ]);

  if (species !== undefined) {
    return taxonClauses(species);
  }

  if (genus === undefined) {
    return [filter];
  }

  return [
    genus,
    ...Object.keys(genusSynonyms).filter(
      (name) => genusSynonyms[name] === genus,
    ),
  ].flatMap((name) => [withRest(`genus=${name}`), ...taxonClauses(name)]);
}
