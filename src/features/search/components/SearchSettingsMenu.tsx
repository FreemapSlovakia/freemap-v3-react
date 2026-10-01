import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useModalLink } from '@shared/components/ShowModalLink.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCog, FaPaintBrush } from 'react-icons/fa';

/** The box's standing preferences, reachable without a result selected. */
export function SearchSettingsMenu(): ReactElement {
  const m = useMessages();

  const modalLink = useModalLink();

  return (
    <Dropdown>
      <LongPressTooltip label={m?.search.settings}>
        {({ props }) => (
          <Dropdown.Toggle
            bsPrefix="fm-dropdown-toggle-nocaret"
            variant="secondary"
            {...props}
          >
            <FaCog />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        <Dropdown.Item {...modalLink({ type: 'search-result-style' })}>
          <FaPaintBrush /> {m?.mapLayers.lookupStyle}
        </Dropdown.Item>
      </FmDropdownMenu>
    </Dropdown>
  );
}
