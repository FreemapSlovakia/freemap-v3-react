import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { Dropdown, type DropdownMenuProps } from 'react-bootstrap';

/**
 * A `Dropdown.Menu` that scrolls its items instead of growing past the edge of
 * the screen: `fixedPopperConfig` measures the room the menu has into
 * `--fm-menu-available-height`, the scroller caps itself with it, and
 * `useScrollClasses` fades in the edge gradients that say there is more.
 *
 * The scroller is an element inside the menu rather than the menu itself
 * because the gradients are positioned against the menu — a menu that scrolled
 * its own box would drag them along with the items, and would put the scrollbar
 * outside the item padding and across the rounded corner.
 */
export function FmDropdownMenu({
  children,
  className,
  popperConfig = fixedPopperConfig,
  ...props
}: DropdownMenuProps): ReactElement {
  const sc = useScrollClasses('vertical');

  return (
    <Dropdown.Menu
      {...props}
      popperConfig={popperConfig}
      className={clsx(
        'fm-dropdown-with-scroller',
        popperConfig?.strategy === 'fixed' && 'fm-dropdown-fixed',
        className,
      )}
    >
      <div className="fm-menu-scroller" ref={sc}>
        <div />

        {children}
      </div>
    </Dropdown.Menu>
  );
}
