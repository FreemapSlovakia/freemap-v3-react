import type { GenericNameLabel } from '@osm/useGenericNameResolver.js';
import type { ReactNode } from 'react';
import { useMatchedCategories } from '../useMatchedCategories.js';
import { ObjectFilterChip } from './ObjectFilterChip.js';

type Props = {
  parts: GenericNameLabel[];
  /** The object's own tags, so a broader active filter gets a chip too. */
  tags?: Record<string, string>;
};

/** Each kind of the object, toggling its objects filter as the legend does. */
export function GenericNameToggles({ parts, tags }: Props): ReactNode {
  const matched = useMatchedCategories(parts, tags);

  return matched.map(({ text, category, key }) =>
    category ? (
      <ObjectFilterChip
        key={key}
        filterKey={category.key}
        className="fs-6 fw-normal"
        // The popup is tinted, so the legend's grey would vanish on it.
        inactiveClassName="bg-body"
      >
        {text}
      </ObjectFilterChip>
    ) : (
      <span key={key} className="fs-6 fw-normal">
        {text}
      </span>
    ),
  );
}
