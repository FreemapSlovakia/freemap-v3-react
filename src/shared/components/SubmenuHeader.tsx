import { useMessages } from '@features/l10n/l10nInjector.js';
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
  const m = useMessages();

  return (
    <>
      <Dropdown.Header>
        {icon} {title}
      </Dropdown.Header>

      <Dropdown.Item as="button" eventKey={backEventKey}>
        <FaChevronLeft /> {m?.mainMenu.back} {kbd && <kbd>Esc</kbd>}
      </Dropdown.Item>

      <Dropdown.Divider />
    </>
  );
}
