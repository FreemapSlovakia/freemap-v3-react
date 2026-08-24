import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import { type ReactElement, useCallback, useLayoutEffect, useRef } from 'react';
import { Dropdown, type DropdownMenuProps } from 'react-bootstrap';

export type FmDropdownMenuProps = DropdownMenuProps & {
  /**
   * Which level the menu is showing. Entering a level scrolls it to the top;
   * stepping back to the level below restores where it was left.
   */
  level?: string | number | null;
};

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
  level = null,
  ...props
}: FmDropdownMenuProps): ReactElement {
  const sc = useScrollClasses('vertical');

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Where each level below the current one was left, innermost last.
  const scrollStack = useRef<{ level: string | number | null; top: number }[]>(
    [],
  );

  const prevLevel = useRef(level);

  const refSetter = useCallback(
    (el: HTMLDivElement | null) => {
      scrollerRef.current = el;

      if (!el) {
        scrollStack.current = [];
      }

      sc(el);
    },
    [sc],
  );

  useLayoutEffect(() => {
    const el = scrollerRef.current;

    if (level === prevLevel.current || !el) {
      prevLevel.current = level;

      return;
    }

    const back = scrollStack.current.at(-1);

    if (back && back.level === level) {
      scrollStack.current.pop();

      el.scrollTop = back.top;
    } else {
      scrollStack.current.push({ level: prevLevel.current, top: el.scrollTop });

      el.scrollTop = 0;
    }

    prevLevel.current = level;
  }, [level]);

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
      <div className="fm-menu-scroller" ref={refSetter}>
        <div />

        {children}
      </div>
    </Dropdown.Menu>
  );
}
