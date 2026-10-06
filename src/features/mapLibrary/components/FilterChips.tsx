import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { countryCodeToFlag, Emoji } from '@shared/components/Emoji.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { LAYER_KIND_ICONS } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useRegionNames } from '@shared/hooks/useRegionNames.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Dropdown, Form, ToggleButton } from 'react-bootstrap';
import {
  FaDatabase,
  FaEllipsisH,
  FaHistory,
  FaMap,
  FaMountain,
  FaPlane,
  FaScroll,
} from 'react-icons/fa';
import {
  CATEGORY_GROUPS,
  categoryGroup,
  TECHNOLOGY_GROUPS,
  technologyGroup,
} from '../filters.js';

type Props<T extends string> = {
  /** Tells the group's ids apart from another group's. */
  name: string;
  label: ReactNode;
  options: readonly { value: T; label: ReactNode; icon?: ReactNode }[];
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
      {options.map(({ value, label: optionLabel, icon }) => (
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
          {icon} {optionLabel}
        </ToggleButton>
      ))}
    </FilterRow>
  );
}

/** A row of a single on/off chip, such as Covers this view. */
export function FilterToggle({
  name,
  label,
  icon,
  checked,
  onChange,
}: {
  name: string;
  label: ReactNode;
  icon?: ReactNode;
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
        {icon} {label}
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
      icon: CATEGORY_ICONS[value],
    })),
    technologyOptions: TECHNOLOGY_GROUPS.map((value) => ({
      value,
      label:
        value === 'data'
          ? msm?.filters.dataLayers
          : m?.mapLayers.technologies[value],
      // As a custom map of that technology is marked.
      icon: value === 'data' ? <FaDatabase /> : CUSTOM_MAP_ICONS[value],
    })),
    layerOptions: (['base', 'overlay'] as const).map((value) => ({
      value,
      label: value === 'base' ? msm?.baseMaps : msm?.overlays,
      icon: LAYER_KIND_ICONS[value],
    })),
  };
}

const CATEGORY_ICONS: Record<(typeof CATEGORY_GROUPS)[number], ReactElement> = {
  map: <FaMap />,
  historicmap: <FaScroll />,
  photo: <FaPlane />,
  historicphoto: <FaHistory />,
  elevation: <FaMountain />,
  other: <FaEllipsisH />,
};

/** One item of a map's second line: a chip's icon and words, or words alone. */
export type DetailPart = { icon?: ReactNode; label: string };

/**
 * A map's category and technology as the chips show them, but not Other or
 * Data layers, which say nothing the name doesn't.
 */
export function useMapDetail() {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  return (
    category: string | undefined,
    technology: string | undefined,
  ): DetailPart[] => {
    const group = categoryGroup(category);

    const techGroup = technologyGroup(technology);

    const technologies: Partial<Record<string, string>> | undefined =
      m?.mapLayers.technologies;

    const techLabel =
      technology === undefined ? undefined : technologies?.[technology];

    return [
      group === 'other' || !msm
        ? undefined
        : { icon: CATEGORY_ICONS[group], label: msm.filters[group] },
      techGroup === undefined || techGroup === 'data' || !techLabel
        ? undefined
        : { icon: CUSTOM_MAP_ICONS[techGroup], label: techLabel },
    ].filter((part) => part !== undefined);
  };
}

/** A map's second line; on a narrow screen its icons, the words on long press. */
export function MapDetail({
  parts,
}: {
  parts: readonly DetailPart[];
}): ReactElement | null {
  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="small text-muted d-flex flex-wrap align-items-center column-gap-1">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span>·</span>}

          {part.icon ? (
            <LongPressTooltip label={part.label} breakpoint="sm">
              {({ props, label, labelClassName }) => (
                <span
                  className="d-inline-flex align-items-center gap-1"
                  {...props}
                >
                  {part.icon}
                  <span className={labelClassName}>{label}</span>
                </span>
              )}
            </LongPressTooltip>
          ) : (
            <span className="text-truncate">{part.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * A row picking one of the countries these maps name, each with its flag
 * (an image, so a dropdown rather than a native select); empty `value` is all.
 */
export function FilterCountry({
  label,
  value,
  anyLabel,
  countryLists,
  onChange,
  name,
  worldwide,
  worldwideLabel,
  onWorldwideChange,
}: {
  label: ReactNode;
  value: string;
  anyLabel: string | undefined;
  countryLists: readonly (readonly string[] | undefined)[];
  onChange: (value: string) => void;
  /** Tells the checkbox's id apart from the other tab's. */
  name: string;
  /** Whether maps naming no country stay in while a country is picked. */
  worldwide: boolean;
  worldwideLabel: ReactNode;
  onWorldwideChange: (worldwide: boolean) => void;
}): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const regionNames = useRegionNames();

  const nameOf = (code: string) => {
    try {
      return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
      return code;
    }
  };

  const countries = [...new Set(countryLists.flatMap((list) => list ?? []))]
    .map((code) => ({ code, name: nameOf(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, language));

  const flagged = (code: string) => (
    <>
      <Emoji className="me-1">{countryCodeToFlag(code)}</Emoji>
      {nameOf(code)}
    </>
  );

  return (
    <FilterRow label={label}>
      <Dropdown onSelect={(code) => onChange(code ?? '')}>
        <Dropdown.Toggle as={SelectToggle} className="form-select-sm w-auto">
          {value ? flagged(value) : anyLabel}
        </Dropdown.Toggle>

        <FmDropdownMenu>
          <Dropdown.Item as="button" type="button" eventKey="" active={!value}>
            {anyLabel}
          </Dropdown.Item>

          {countries.map(({ code }) => (
            <Dropdown.Item
              as="button"
              type="button"
              key={code}
              eventKey={code}
              active={value === code}
            >
              {flagged(code)}
            </Dropdown.Item>
          ))}
        </FmDropdownMenu>
      </Dropdown>

      <Form.Check
        id={`library-filter-${name}-worldwide`}
        className="mb-0"
        label={worldwideLabel}
        disabled={!value}
        checked={worldwide}
        onChange={(e) => onWorldwideChange(e.currentTarget.checked)}
      />
    </FilterRow>
  );
}

/** Whether a map passes the country filter. */
export const passesCountry = (
  countries: readonly string[] | undefined,
  filters: { country: string; worldwide: boolean },
): boolean =>
  !filters.country ||
  (countries?.length ? countries.includes(filters.country) : filters.worldwide);
