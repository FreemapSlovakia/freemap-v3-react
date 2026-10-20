import { Text } from '@features/l10n/Text.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import type { JSX, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';

type SubmenuHeaderProps = {
  icon: ReactNode;
  title?: ReactNode;
  /** What the Back item selects; the menu's own prefix for an empty level. */
  backEventKey?: string;
  /** Off where the menu has no Escape handler to honour the hint. */
  kbd?: boolean;
};

export function SubmenuHeader({
  icon,
  title,
  backEventKey = 'submenu-',
  kbd = true,
}: SubmenuHeaderProps): JSX.Element {
  return (
    <>
      <Dropdown.Header>
        {icon} {title}
      </Dropdown.Header>

      <Dropdown.Item as="button" eventKey={backEventKey}>
        <FaChevronLeft />
        <MenuLabel>
          <Text k="mainMenu.back" />
        </MenuLabel>
        {kbd && (
          <MenuGutter>
            <kbd>Esc</kbd>
          </MenuGutter>
        )}
      </Dropdown.Item>

      <Dropdown.Divider />
    </>
  );
}
