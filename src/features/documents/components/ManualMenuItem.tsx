import { Text } from '@features/l10n/Text.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useManualAction } from '../hooks/useManualAction.js';

/**
 * A hand-built ⋮ item opening the manual at the chapter about its toolbar; a
 * `ResponsiveActions` takes `useManualAction` instead.
 */
export function ManualMenuItem({
  chapter,
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
}): ReactElement {
  const { icon, href, onClick } = useManualAction()(chapter);

  return (
    <Dropdown.Item href={href} onClick={onClick}>
      {icon}
      <MenuLabel>
        <Text k="mainMenu.manual" />
      </MenuLabel>
    </Dropdown.Item>
  );
}
