import { coverageCountries } from '@shared/mapLibrary/coverage.js';
import { removeAccents } from '@shared/stringUtils.js';

type Bbox = [number, number, number, number];

/** The technologies a filter tells apart; the rest are data layers the app draws. */
export const TECHNOLOGY_GROUPS = [
  'tile',
  'maplibre',
  'wms',
  'parametricShading',
  'color',
  'data',
] as const;

export type TechnologyGroup = (typeof TECHNOLOGY_GROUPS)[number];

export const technologyGroup = (
  technology: string | undefined,
): TechnologyGroup | undefined =>
  technology === undefined
    ? undefined
    : (TECHNOLOGY_GROUPS as readonly string[]).includes(technology)
      ? (technology as TechnologyGroup)
      : 'data';

/**
 * Editor Layer Index categories as the library offers them, in the order the
 * chips show: the most wanted first, each beside its historic counterpart.
 */
export const CATEGORY_GROUPS = [
  'map',
  'historicmap',
  'photo',
  'historicphoto',
  'elevation',
  'other',
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const categoryGroup = (category: string | undefined): CategoryGroup =>
  category === 'osmbasedmap'
    ? 'map'
    : (CATEGORY_GROUPS as readonly string[]).includes(category ?? '')
      ? (category as CategoryGroup)
      : 'other';

/** A group of chips lets everything through until one of them is on. */
export const passes = <T>(
  selected: ReadonlySet<T>,
  value: T | readonly T[] | undefined,
): boolean =>
  selected.size === 0 ||
  (Array.isArray(value)
    ? value.some((v) => selected.has(v))
    : value !== undefined && selected.has(value as T));

/** Whether a name holds the query, accents and case aside. */
export const nameMatches = (name: string, query: string): boolean =>
  removeAccents(name.toLowerCase()).includes(
    removeAccents(query.trim().toLowerCase()),
  );

/**
 * Whether a map draws where the view is: by the countries in view where its
 * countries tell its coverage, else by its box. A map with neither covers
 * everywhere, and an unknown view answers yes.
 */
export function coversView(
  def: { type: string; countries?: string[]; bbox?: Bbox },
  view: { bounds?: Bbox; countries?: string[] | null },
): boolean {
  const countries = coverageCountries(def);

  if (countries) {
    return (
      !view.countries || countries.some((c) => view.countries?.includes(c))
    );
  }

  const { bbox } = def;

  const { bounds } = view;

  return (
    !bbox ||
    !bounds ||
    (bbox[0] <= bounds[2] &&
      bbox[2] >= bounds[0] &&
      bbox[1] <= bounds[3] &&
      bbox[3] >= bounds[1])
  );
}
