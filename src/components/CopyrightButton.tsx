import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaLock, FaQuestion, FaRegCopyright, FaRegMap } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { documentShow, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';
import { useAttributionInfo } from './useAttributionInfo.js';

export function CopyrightButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const showLegendButton = useAppSelector((state) =>
    (['sk', 'cs'].includes(state.l10n.language)
      ? ['A', 'K', 'T', 'C', 'X', 'O']
      : ['X', 'O']
    ).includes(state.map.layers[0]),
  );

  const showAttribution = useAttributionInfo();

  return (
    <Toolbar className="me-2 mb-2">
      <Dropdown>
        <LongPressTooltip
          label={(m?.mainMenu.mapLegend ?? '…') + ', Privacy policy'}
        >
          {({ props }) => (
            <Dropdown.Toggle
              bsPrefix="fm-dropdown-toggle-nocaret"
              id="dropdown-basic"
              variant="secondary"
              {...props}
            >
              <FaQuestion />
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>

        <Dropdown.Menu style={{ width: 'max-content' }}>
          <Dropdown.Item
            key="attribution"
            as="button"
            onClick={() => showAttribution()}
          >
            <FaRegCopyright /> {m?.main.copyright}
          </Dropdown.Item>

          {showLegendButton && (
            <Dropdown.Item
              key="legend"
              href="#show=legend"
              onClick={(e) => {
                e.preventDefault();

                dispatch(setActiveModal('legend'));
              }}
            >
              <FaRegMap /> {m?.mainMenu.mapLegend}
            </Dropdown.Item>
          )}

          <Dropdown.Item
            key="privacyPolicy"
            href="#document=privacyPolicy"
            onClick={(e) => {
              e.preventDefault();

              dispatch(documentShow('privacyPolicy'));
            }}
          >
            <FaLock /> {m?.general.privacyPolicy}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Toolbar>
  );
}
