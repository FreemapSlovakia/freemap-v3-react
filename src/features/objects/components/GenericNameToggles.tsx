import type { GenericNameLabel } from '@osm/useGenericNameResolver.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactNode, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import {
  type MatchedCategory,
  sameFilter,
  useMatchedCategories,
} from '../useMatchedCategories.js';
import { ObjectFilterChip } from './ObjectFilterChip.js';

type Props = {
  parts: GenericNameLabel[];
  /** The object's own tags, for the other categories it is in. */
  tags?: Record<string, string>;
};

/**
 * Each kind of the object, toggling its objects filter as the legend does; the
 * other categories it is in sit collapsed behind a chevron.
 */
export function GenericNameToggles({ parts, tags }: Props): ReactNode {
  const om = useObjectsMessages();

  const matched = useMatchedCategories(parts, tags);

  const active = useAppSelector((state) => state.objects.active);

  const kinds = matched.filter((item) => !item.extra);

  const extra = matched.filter((item) => item.extra);

  // Open of itself while one of them is an active filter, so it can be switched
  // off. A click inside pins it open, or switching that off would close it.
  const [open, setOpen] = useState<boolean>();

  const expanded =
    open ??
    extra.some(({ category }) =>
      active.some((key) => category && sameFilter(key, category.key)),
    );

  const chip = (
    { text, category, key }: MatchedCategory,
    onToggle?: () => void,
  ) =>
    category ? (
      <ObjectFilterChip
        key={key}
        filterKey={category.key}
        className="fs-6 fw-normal"
        // The popup is tinted, so the legend's grey would vanish on it.
        inactiveClassName="bg-body"
        onToggle={onToggle}
      >
        {text}
      </ObjectFilterChip>
    ) : (
      <span key={key} className="fs-6 fw-normal">
        {text}
      </span>
    );

  return (
    <>
      {kinds.map((item) => chip(item))}

      {extra.length > 0 && (
        <LongPressTooltip label={om?.moreGeneralTypes}>
          {({ props }) => (
            <button
              type="button"
              className="border-0 px-2 py-0 rounded bg-body text-body-secondary fs-6 fw-normal"
              onClick={() => setOpen(!expanded)}
              {...props}
            >
              {expanded ? (
                <FaChevronLeft />
              ) : (
                <>
                  {extra.length} <FaChevronRight />
                </>
              )}
            </button>
          )}
        </LongPressTooltip>
      )}

      {expanded && extra.map((item) => chip(item, () => setOpen(true)))}
    </>
  );
}
