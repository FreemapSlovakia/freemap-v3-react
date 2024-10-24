import { documentShow, setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaLock, FaQuestion, FaRegCopyright, FaRegMap } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useAttributionInfo } from './useAttributionInfo';

export function CopyrightButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const showLegendButton = useAppSelector((state) =>
    (['sk', 'cs'].includes(state.l10n.language)
      ? ['A', 'K', 'T', 'C', 'X', 'O']
      : ['X', 'O']
    ).includes(state.map.mapType),
  );

  const showAttribution = useAttributionInfo();

  return (
    <Card className="fm-toolbar me-2 mb-2">
      <Dropdown>
        <Dropdown.Toggle
          bsPrefix="fm-dropdown-toggle-nocaret"
          id="dropdown-basic"
          title={m?.mainMenu.mapLegend + ', Privacy policy'}
          variant="secondary"
        >
          <FaQuestion />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            key="attribution"
            as="button"
            onClick={() => {
              showAttribution();
            }}
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
            href="#tip=privacyPolicy"
            onClick={(e) => {
              e.preventDefault();

              dispatch(documentShow('privacyPolicy'));
            }}
          >
            <FaLock /> Privacy policy
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Card>
  );
}
