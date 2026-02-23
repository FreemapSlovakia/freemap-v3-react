import { useMessages } from '@features/l10n/l10nInjector.js';
import { JSX, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';

type SubmenuHeaderProps = {
  icon: ReactNode;
  title?: ReactNode;
};

export function SubmenuHeader({
  icon,
  title,
}: SubmenuHeaderProps): JSX.Element {
  const m = useMessages();

  return (
    <>
      <Dropdown.Header>
        {icon} {title}
      </Dropdown.Header>

      <Dropdown.Item as="button" eventKey="submenu-">
        <FaChevronLeft /> {m?.mainMenu.back} <kbd>Esc</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />
    </>
  );
}
