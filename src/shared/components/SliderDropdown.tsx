import type { Breakpoint } from '@shared/breakpoints.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import type { ReactElement, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { LongPressTooltip } from './LongPressTooltip.js';

type Props = {
  icon: ReactNode;
  /** Says where the settings stand, on the toggle. */
  toggleLabel: ReactNode;
  /** Names the control; moves into the tooltip, as in `SelectDropdown`. */
  name?: ReactNode;
  /** Below this the toggle label collapses into the tooltip. */
  breakpoint?: Breakpoint;
  /** One or more `LabeledSlider`s. */
  children: ReactNode;
};

/**
 * Settings with more steps than a menu can carry, offered as sliders in a
 * dropdown — `autoClose="outside"` is what lets a drag inside the menu run
 * without closing it.
 */
export function SliderDropdown({
  icon,
  toggleLabel,
  name,
  breakpoint,
  children,
}: Props): ReactElement {
  return (
    <Dropdown autoClose="outside">
      <LongPressTooltip
        breakpoint={breakpoint}
        label={toggleLabel ?? '…'}
        name={name}
      >
        {({ label: tipLabel, labelClassName, props }) => (
          <Dropdown.Toggle
            variant="secondary"
            bsPrefix="fm-dropdown-toggle-nocaret"
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

      <FmDropdownMenu>
        {/* A column, because everything inside a toolbar inherits
            `white-space: nowrap` — without it the label and the slider sit
            side by side on one line. */}
        {/* Capped: uncapped, a slider carrying a hint sizes the menu to the
            whole sentence and it grows to the width of the window. */}
        <div
          className="px-3 py-1 d-flex flex-column gap-3"
          style={{ minWidth: '15rem', maxWidth: '20rem' }}
        >
          {children}
        </div>
      </FmDropdownMenu>
    </Dropdown>
  );
}
