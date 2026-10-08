import {
  coverageBoxes,
  coverageCountries,
} from '@shared/mapLibrary/coverage.js';
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
 * Whether a map draws where the view is: one of its countries is in view, and
 * one of a catalog map's boxes (see `coverageCountries`) meets it too. With no
 * country known for the view (out at sea) the boxes alone decide.
 */
export function coversView(
  def: { type: string; countries?: string[]; bbox?: Bbox; bboxes?: Bbox[] },
  view: { bounds?: Bbox; countries?: string[] | null },
): boolean {
  const inView = (countries: string[]) =>
    countries.some((c) => view.countries?.includes(c));

  const countries = coverageCountries(def);

  if (countries) {
    return !view.countries || inView(countries);
  }

  const boxes = coverageBoxes(def);

  const { bounds } = view;

  return (
    (!def.countries || !view.countries?.length || inView(def.countries)) &&
    (!boxes.length ||
      !bounds ||
      boxes.some(
        (box) =>
          box[0] <= bounds[2] &&
          box[2] >= bounds[0] &&
          box[1] <= bounds[3] &&
          box[3] >= bounds[1],
      ))
  );
}
