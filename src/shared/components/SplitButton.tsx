import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { FmDropdownMenu } from './FmDropdownMenu.js';
import { LongPressTooltip } from './LongPressTooltip.js';

export type SplitButtonItem = {
  icon?: ReactNode;
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
};

type Props = {
  /** What the button itself does — the way most presses will go. */
  label: ReactNode;
  icon: ReactNode;
  onClick: () => void;
  /** The other ways to the same end, behind the caret. */
  items: SplitButtonItem[];
  variant?: string;
  disabled?: boolean;
};

/**
 * One job, two ways to ask for it: the common one under the button, the rest
 * behind a caret beside it.
 */
export function SplitButton({
  label,
  icon,
  onClick,
  items,
  variant = 'secondary',
  disabled,
}: Props): ReactElement {
  return (
    // Keyed by index through the dropdown's own `onSelect`: an item's own
    // `onSelect` is not what `Dropdown` dispatches to, so it is never called.
    <Dropdown
      as={ButtonGroup}
      onSelect={(key) => items[Number(key)]?.onSelect()}
    >
      <LongPressTooltip label={label}>
        {({ props }) => (
          <Button
            variant={variant}
            onClick={onClick}
            disabled={disabled}
            {...props}
          >
            {icon}
          </Button>
        )}
      </LongPressTooltip>

      <Dropdown.Toggle split variant={variant} disabled={disabled} />

      <FmDropdownMenu>
        {items.map((item, i) => (
          <Dropdown.Item
            // The items are a fixed list written at the call site.
            key={i}
            as="button"
            type="button"
            eventKey={String(i)}
            disabled={item.disabled}
          >
            {item.icon} {item.label}
          </Dropdown.Item>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}
