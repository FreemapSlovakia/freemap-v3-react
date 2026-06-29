import type { Breakpoint } from '@shared/breakpoints.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { LongPressTooltip } from './LongPressTooltip.js';

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
  /** Render a divider after this option (e.g. to set off a leading action). */
  divider?: boolean;
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
  /** Wrap the menu in a vertical scroller for long option lists. */
  scrollable?: boolean;
  /** Render the toggle as a native-like `<select>` with an always-visible label. */
  asSelect?: boolean;
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
  scrollable,
  asSelect,
  className,
  id,
}: Props): ReactElement {
  const sc = useScrollClasses('vertical');

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
        eventKey={opt.value}
        active={opt.active ?? opt.value === value}
        disabled={opt.disabled}
        title={opt.title}
      >
        {opt.icon}
        {opt.icon ? ' ' : null}
        {opt.label}
        {(opt.kbd?.split(' ') ?? []).map((k) => (
          <Fragment key={k}>
            {' '}
            <kbd>{k}</kbd>
          </Fragment>
        ))}
        {opt.extra}
      </Dropdown.Item>,
    );

    if (opt.divider) {
      items.push(<Dropdown.Divider key={`d${i}`} />);
    }
  });

  return (
    <Dropdown className={className} onSelect={(key) => onSelect(key)}>
      {asSelect ? (
        <Dropdown.Toggle as={SelectToggle} id={id}>
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
            <Dropdown.Toggle variant="secondary" id={id} {...props}>
              {icon}
              <span className={labelClassName}>
                {icon ? ' ' : null}
                {tipLabel}
              </span>
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>
      )}

      <Dropdown.Menu
        popperConfig={fixedPopperConfig}
        className={scrollable ? 'fm-dropdown-with-scroller' : undefined}
      >
        {scrollable ? (
          <div className="dropdown-long" ref={sc}>
            <div />
            {items}
          </div>
        ) : (
          items
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
