import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import type { ReactElement, ReactNode } from 'react';
import { ToggleButton } from 'react-bootstrap';
import {
  CATEGORY_GROUPS,
  categoryGroup,
  TECHNOLOGY_GROUPS,
} from '../filters.js';

type Props<T extends string> = {
  /** Tells the group's ids apart from another group's. */
  name: string;
  label: ReactNode;
  options: readonly { value: T; label: ReactNode }[];
  selected: ReadonlySet<T>;
  onChange: (selected: ReadonlySet<T>) => void;
};

/**
 * Sets a tab's filters apart from the list below them. A grid of label and
 * chips, so every row's chips start at the widest label's edge.
 */
export function FilterPanel({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div
      className="d-grid border rounded bg-body-tertiary px-2 mb-3 overflow-hidden"
      style={{ gridTemplateColumns: 'max-content 1fr' }}
    >
      {children}
    </div>
  );
}

/** A panel row: its label, then its content; no label leaves the cell empty. */
export function FilterRow({
  label,
  children,
}: {
  label?: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    // Subgrid keeps the columns shared; -1px tucks the first row's divider
    // under the panel's edge, where `overflow-hidden` clips it.
    <div
      className="d-grid align-items-start column-gap-2 border-top py-2"
      style={{
        gridColumn: '1 / -1',
        gridTemplateColumns: 'subgrid',
        marginTop: -1,
      }}
    >
      {/* Padded to sit level with the first line of chips. */}
      <span
        className="small text-muted"
        style={{ paddingTop: 'calc(0.25rem + var(--bs-border-width))' }}
      >
        {label}
      </span>

      <div className="d-flex flex-wrap align-items-center gap-2">
        {children}
      </div>
    </div>
  );
}

/** One filter's chips, any number of them on; see `passes`. */
export function FilterChips<T extends string>({
  name,
  label,
  options,
  selected,
  onChange,
}: Props<T>): ReactElement {
  return (
    <FilterRow label={label}>
      {options.map(({ value, label: optionLabel }) => (
        <ToggleButton
          key={value}
          id={`library-filter-${name}-${value}`}
          type="checkbox"
          size="sm"
          variant="outline-primary"
          value={value}
          checked={selected.has(value)}
          onChange={() => {
            const next = new Set(selected);

            if (!next.delete(value)) {
              next.add(value);
            }

            onChange(next);
          }}
        >
          {optionLabel}
        </ToggleButton>
      ))}
    </FilterRow>
  );
}

/** A row of a single on/off chip, such as Covers this view. */
export function FilterToggle({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): ReactElement {
  return (
    <FilterRow>
      <ToggleButton
        id={`library-filter-${name}`}
        type="checkbox"
        size="sm"
        variant="outline-primary"
        value={name}
        checked={checked}
        onChange={() => onChange(!checked)}
      >
        {label}
      </ToggleButton>
    </FilterRow>
  );
}

/** The chips both tabs filter by. */
export function useSharedFilterOptions() {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  return {
    categoryOptions: CATEGORY_GROUPS.map((value) => ({
      value,
      label: msm?.filters[value],
    })),
    technologyOptions: TECHNOLOGY_GROUPS.map((value) => ({
      value,
      label:
        value === 'data'
          ? msm?.filters.dataLayers
          : m?.mapLayers.technologies[value],
    })),
  };
}

/**
 * A map's second line in the lists, in the chips' words: its category and
 * technology, but not Other or Data layers, which say nothing the name doesn't,
 * and any extras after them.
 */
export function useMapDetail() {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  return (
    category: string | undefined,
    technology: string | undefined,
    ...extras: (string | undefined)[]
  ): string => {
    const group = categoryGroup(category);

    const technologies: Partial<Record<string, string>> | undefined =
      m?.mapLayers.technologies;

    return [
      group === 'other' ? undefined : msm?.filters[group],
      technology === undefined ? undefined : technologies?.[technology],
      ...extras,
    ]
      .filter(Boolean)
      .join(' · ');
  };
}
