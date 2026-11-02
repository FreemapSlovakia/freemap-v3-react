import { setActiveModal } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBook } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

/** A toolbar's ⋮ item opening the manual at the chapter about it. */
export function ManualMenuItem({
  chapter,
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
}): ReactElement {
  const dispatch = useDispatch();

  return (
    <Dropdown.Item
      href={`#show=manual/${chapter}`}
      onClick={(e) => {
        e.preventDefault();

        trackMatomo(['trackEvent', 'Manual', 'toolbar', chapter]);

        dispatch(setActiveModal({ type: 'manual', chapter }));
      }}
    >
      <FaBook />
      <MenuLabel>
        <Text k="mainMenu.manual" />
      </MenuLabel>
    </Dropdown.Item>
  );
}
