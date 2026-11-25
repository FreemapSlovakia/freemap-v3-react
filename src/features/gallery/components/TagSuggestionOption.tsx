import type { ReactElement } from 'react';
import type { OptionRendererProps } from 'react-tag-autocomplete';
import type { TagTreeSuggestion } from '../hooks/useTagSuggestions.js';

/**
 * A tag suggestion indented by its depth, with the synonym it was found by and
 * its own photos; a broader tag without them gets no "(0)", which would hide
 * what its narrower tags find.
 */
export function TagSuggestionOption({
  children,
  classNames,
  option,
  ...props
}: OptionRendererProps): ReactElement {
  const { depth, synonym, count } = option as typeof option & TagTreeSuggestion;

  return (
    <div
      className={`${classNames.option}${option.active ? ` ${classNames.optionIsActive}` : ''}`}
      {...props}
    >
      {'   '.repeat(depth ?? 0)}
      {children}
      {synonym && ` (= ${synonym})`}
      {count ? ` (${count})` : null}
    </div>
  );
}
