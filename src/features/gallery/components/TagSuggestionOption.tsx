import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
import {
  NewOptionValue,
  type OptionRendererProps,
} from 'react-tag-autocomplete';
import type { TagTreeSuggestion } from '../hooks/useTagSuggestions.js';

/**
 * A tag suggestion indented by its depth, with the synonym it was found by, its
 * own photos and, where its narrower tags add more, all the filter finds by it.
 * The new-tag row shows the `query` typed as a chip, as it will be added.
 */
export function TagSuggestionOption({
  children,
  classNames,
  option,
  query,
  ...props
}: OptionRendererProps & { query?: string }): ReactElement {
  const { depth, synonym, count, total } = option as typeof option &
    TagTreeSuggestion;

  if (option.value === NewOptionValue && query) {
    // The label is the "Add %value%" message.
    const [before, after = ''] = option.label.split('%value%');

    // A gap rather than the message's spaces: on either side of the chip,
    // as the language orders it.
    return (
      <div
        className={`${classNames.option}${option.active ? ` ${classNames.optionIsActive}` : ''} d-flex align-items-center gap-2`}
        {...props}
      >
        {before.trim() && <span>{before.trim()}</span>}
        <span className="react-tags__listbox-option-new-tag">
          {query.trim()}
        </span>
        {after.trim() && <span>{after.trim()}</span>}
      </div>
    );
  }

  return (
    <div
      className={`${classNames.option}${option.active ? ` ${classNames.optionIsActive}` : ''} d-flex align-items-center gap-1`}
      {...props}
    >
      <span className="flex-grow-1">
        {'   '.repeat(depth ?? 0)}
        {children}
        {synonym && ` (= ${synonym})`}
      </span>

      {count ? (
        <Badge pill bg="secondary">
          {count}
        </Badge>
      ) : null}

      {(total ?? 0) > (count ?? 0) ? (
        <Badge pill bg="secondary" className="bg-opacity-50">
          Σ {total}
        </Badge>
      ) : null}
    </div>
  );
}
