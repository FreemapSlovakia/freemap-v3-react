import type { Breakpoint } from '@shared/breakpoints.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { type ReactElement, type ReactNode, useState } from 'react';
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
  /** `LabeledSlider`s, and whatever else answers the same question. */
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
  const [show, setShow] = useState(false);

  return (
    <Dropdown
      autoClose="outside"
      show={show}
      onToggle={(next, meta) => {
        // An overlay opened from inside the menu — a colour picker's popover, a
        // hint's tooltip — renders into <body>, so a click in it reads as a
        // click outside and would close the menu that opened it.
        if (
          !next &&
          meta.source === 'rootClose' &&
          meta.originalEvent?.target instanceof Element &&
          meta.originalEvent.target.closest('.popover, .tooltip')
        ) {
          return;
        }

        setShow(next);
      }}
    >
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
        {/* Fixed rather than shrink-to-fit: a value label grows as the slider
            moves, and the menu would resize under the finger dragging it. */}
        <div
          className="px-3 py-1 d-flex flex-column gap-3 text-wrap"
          style={{ width: 'min(20rem, calc(100vw - 1rem))' }}
        >
          {children}
        </div>
      </FmDropdownMenu>
    </Dropdown>
  );
}
