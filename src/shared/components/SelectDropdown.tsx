import type { Breakpoint } from '@shared/breakpoints.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { LongPressTooltip } from './LongPressTooltip.js';
import classes from './SelectDropdown.module.css';

export type SelectDropdownOption = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Space-separated keys rendered as `<kbd>` after the label in the menu. */
  kbd?: string;
  disabled?: boolean;
  /** Override the highlighted state; defaults to `value === <selected value>`. */
  active?: boolean;
  title?: string;
  /**
   * Header shown above the option; a new header is emitted whenever an option's
   * `group` differs from the previous one's (`undefined` groups are headerless).
   */
  group?: ReactNode;
  /** Extra content after the label inside the menu item (e.g. a premium badge). */
  extra?: ReactNode;
  /**
   * Menu content of its own after the option — a setting the option owns, not
   * something to pick, so it must stop its own clicks from reaching `onSelect`.
   */
  after?: ReactNode;
  /**
   * Render a divider after this option; `'strong'` draws a heavier one, for a
   * row set apart from the list rather than one group of it from the next.
   */
  divider?: boolean | 'strong';
};

type Props = {
  value: string | null | undefined;
  onSelect: (value: string | null) => void;
  options: SelectDropdownOption[];
  /** Toggle icon; defaults to the selected option's icon. */
  toggleIcon?: ReactNode;
  /** Toggle label; defaults to the selected option's label. */
  toggleLabel?: ReactNode;
  /**
   * Name of the control (e.g. "Display"). When set, the toggle always shows the
   * selected value and the name moves into the tooltip — see `LongPressTooltip`.
   */
  name?: ReactNode;
  /**
   * Below this breakpoint the toggle label collapses into a long-press/hover
   * tooltip. Omit for an icon-only toggle whose label lives only in the tooltip.
   * Ignored when `asSelect` is set (the label is always visible).
   */
  breakpoint?: Breakpoint;
  /** Toggle keyboard hint shown in the tooltip. */
  kbd?: string;
  /** Render the toggle as a native-like `<select>` with an always-visible label. */
  asSelect?: boolean;
  /** Dims the whole control, for when none of the options can be acted on. */
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * A `<Dropdown>` that behaves like a `<select>`: pick one option, the current
 * one is highlighted. The toggle shows an icon plus a label that, away from
 * `asSelect`, collapses into a `LongPressTooltip` below `breakpoint`.
 */
export function SelectDropdown({
  value,
  onSelect,
  options,
  toggleIcon,
  toggleLabel,
  name,
  breakpoint,
  kbd,
  asSelect,
  disabled,
  className,
  id,
}: Props): ReactElement {
  const selected = options.find((o) => o.value === value);

  const icon = toggleIcon ?? selected?.icon;

  const label = toggleLabel !== undefined ? toggleLabel : selected?.label;

  const items: ReactNode[] = [];

  let prevGroup: ReactNode;

  options.forEach((opt, i) => {
    if (i === 0 || opt.group !== prevGroup) {
      if (opt.group != null && opt.group !== '') {
        items.push(
          <Dropdown.Header key={`h${i}`}>{opt.group}</Dropdown.Header>,
        );
      }

      prevGroup = opt.group;
    }

    items.push(
      <Dropdown.Item
        key={opt.value}
        as="button"
        type="button"
        eventKey={opt.value}
        active={opt.active ?? opt.value === value}
        disabled={opt.disabled}
        title={opt.title}
      >
        {opt.icon}
        {opt.label}

        {(opt.kbd || opt.extra) && (
          <MenuGutter>
            {opt.extra}
            {(opt.kbd?.split(' ') ?? []).map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </MenuGutter>
        )}
      </Dropdown.Item>,
    );

    if (opt.after) {
      items.push(<Fragment key={`a${i}`}>{opt.after}</Fragment>);
    }

    if (opt.divider) {
      items.push(
        <Dropdown.Divider
          key={`d${i}`}
          className={opt.divider === 'strong' ? classes.strongDivider : ''}
        />,
      );
    }
  });

  return (
    <Dropdown className={className} onSelect={(key) => onSelect(key)}>
      {asSelect ? (
        <Dropdown.Toggle as={SelectToggle} id={id} disabled={disabled}>
          {icon}
          {icon && label != null ? ' ' : null}
          {label}
        </Dropdown.Toggle>
      ) : (
        <LongPressTooltip
          breakpoint={breakpoint}
          label={label ?? '…'}
          name={name}
          kbd={kbd}
        >
          {({ label: tipLabel, labelClassName, props }) => (
            <Dropdown.Toggle
              variant="secondary"
              id={id}
              disabled={disabled}
              {...props}
            >
              {icon}
              <span className={labelClassName}>
                {icon ? ' ' : null}
                {tipLabel}
              </span>
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>
      )}

      <FmDropdownMenu>{items}</FmDropdownMenu>
    </Dropdown>
  );
}
