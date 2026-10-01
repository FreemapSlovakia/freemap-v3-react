import { toastsAdd } from '@features/toasts/model/actions.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';
import type { OsmMapping } from '@osm/types.js';
import type { GenericNameLabel } from '@osm/useGenericNameResolver.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { type ObjectCategory, objectCategories } from '../objectCategories.js';
import { ObjectFilterChip } from './ObjectFilterChip.js';

type Props = {
  parts: GenericNameLabel[];
};

/** The category whose tags are exactly the ones that made the kind. */
function findCategory(
  categories: ObjectCategory[],
  tags: Record<string, string>,
): ObjectCategory | undefined {
  const keys = Object.keys(tags);

  const matching = categories.filter(
    (category) =>
      category.tags.length === keys.length &&
      category.tags.every(
        ({ key, value }) =>
          key in tags && (value === undefined || tags[key] === value),
      ),
  );

  // A valueless category is the key with any value, so `building` matches
  // `building=church` as well as the church category does — and it comes first.
  // The kind names the narrower one.
  return (
    matching.find((category) =>
      category.tags.every(({ value }) => value !== undefined),
    ) ?? matching[0]
  );
}

/** Each kind of the object, toggling its objects filter as the legend does. */
export function GenericNameToggles({ parts }: Props): ReactElement {
  const language = useEffectiveChosenLanguage();

  const [osmMapping, setOsmMapping] = useState<OsmMapping>();

  const dispatch = useDispatch();

  // Only a kind resolved from OSM tags can become a filter, so a popup without
  // one never pays for the mapping or the category list built from it.
  const togglable = parts.some(({ tags }) => tags);

  useEffect(() => {
    if (!togglable) {
      return;
    }

    let ignore = false;

    getOsmMapping(language).then(
      (mapping) => {
        if (!ignore) {
          setOsmMapping(mapping);
        }
      },
      (err) => {
        if (!ignore) {
          dispatch(
            toastsAdd({
              style: 'danger',
              id: 'tag-lang-load-err',
              messageKey: 'general.loadError',
              messageParams: { err },
            }),
          );
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [language, dispatch, togglable]);

  const categories = useMemo(
    () => (osmMapping ? objectCategories(osmMapping) : []),
    [osmMapping],
  );

  return (
    <span className="d-inline-flex flex-wrap gap-2 align-items-baseline fs-6 fw-normal">
      {parts.map(({ text, tags }) => {
        const category = tags && findCategory(categories, tags);

        if (!category) {
          return <span key={text}>{text}</span>;
        }

        return (
          <ObjectFilterChip
            key={text}
            filterKey={category.key}
            // The popup is tinted, so the legend's grey would vanish on it.
            inactiveClassName="bg-body"
          >
            {text}
          </ObjectFilterChip>
        );
      })}
    </span>
  );
}
