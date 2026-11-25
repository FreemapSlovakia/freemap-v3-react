import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
import type { OptionRendererProps } from 'react-tag-autocomplete';
import type { TagTreeSuggestion } from '../hooks/useTagSuggestions.js';

/**
 * A tag suggestion indented by its depth, with the synonym it was found by, its
 * own photos and, where its narrower tags add more, all the filter finds by it.
 */
export function TagSuggestionOption({
  children,
  classNames,
  option,
  ...props
}: OptionRendererProps): ReactElement {
  const { depth, synonym, count, total } = option as typeof option &
    TagTreeSuggestion;

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
