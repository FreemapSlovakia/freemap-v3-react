import { Text } from '@features/l10n/Text.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBook } from 'react-icons/fa';
import { useOpenManual } from '../hooks/useOpenManual.js';

/** A toolbar's ⋮ item opening the manual at the chapter about it. */
export function ManualMenuItem({
  chapter,
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
}): ReactElement {
  const openManual = useOpenManual('toolbar');

  return (
    <Dropdown.Item
      href={`#show=manual/${chapter}`}
      onClick={(e) => {
        e.preventDefault();

        openManual(chapter);
      }}
    >
      <FaBook />
      <MenuLabel>
        <Text k="mainMenu.manual" />
      </MenuLabel>
    </Dropdown.Item>
  );
}
