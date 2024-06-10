import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaChevronLeft } from 'react-icons/fa';

type SubmenuHeaderProps = {
  icon: ReactElement;
  title?: string;
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
