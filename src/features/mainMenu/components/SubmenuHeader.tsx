import { useMessages } from '@features/l10n/l10nInjector.js';
import { Kbd, Menu } from '@mantine/core';
import { useMenuSelect } from '@shared/components/menuSelectContext.js';
import type { JSX, ReactNode } from 'react';
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

  const select = useMenuSelect();

  return (
    <>
      <Menu.Label>
        {icon} {title}
      </Menu.Label>

      <Menu.Item
        leftSection={<FaChevronLeft />}
        rightSection={<Kbd>Esc</Kbd>}
        onClick={() => select('submenu-')}
      >
        {m?.mainMenu.back}
      </Menu.Item>

      <Menu.Divider />
    </>
  );
}
