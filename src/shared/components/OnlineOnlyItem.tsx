import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ComponentProps, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';

/**
 * Menu item whose action goes to the network: offline it is disabled the
 * ordinary Bootstrap way and badged with the reason. Anything that works from
 * local or cached data stays a plain `Dropdown.Item`.
 */
export function OnlineOnlyItem({
  children,
  disabled,
  href,
  target,
  offline,
  ...props
}: ComponentProps<typeof Dropdown.Item> & {
  /** Overrides the live check — for an item a signed-out browser can still use. */
  offline?: boolean;
}): ReactElement {
  const online = useOnline();

  const off = disabled || (offline ?? !online);

  return (
    <Dropdown.Item
      {...props}
      // A disabled item keeps its link: Bootstrap only takes the mouse away
      // from it (`pointer-events: none`), so the keyboard would still follow
      // the `href` past the disabled state.
      href={off ? undefined : href}
      target={off ? undefined : target}
      tabIndex={off ? -1 : undefined}
      disabled={off}
    >
      {children}
      <OfflineBadge className="ms-1" offline={offline} />
    </Dropdown.Item>
  );
}
