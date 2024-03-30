import { documentShow, setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
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

  const [show, setShow] = useState<undefined | 'menu'>();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const showAttribution = useAttributionInfo();

  return (
    <Card className="fm-toolbar mr-2 mb-2">
      <Button
        ref={buttonRef}
        onClick={() => setShow('menu')}
        title={m?.mainMenu.mapLegend + ', Privacy policy'}
        variant="secondary"
      >
        <FaQuestion />
      </Button>

      <Overlay
        rootClose
        placement="top"
        show={show === 'menu'}
        onHide={() => setShow(undefined)}
        target={buttonRef.current}
      >
        <Popover id="popover-copyright" className="fm-menu">
          <Popover.Content>
            <Dropdown.Item
              key="attribution"
              as="button"
              onSelect={(_, e) => {
                e.preventDefault();

                setShow(undefined);

                showAttribution();
              }}
            >
              <FaRegCopyright /> {m?.main.copyright}
            </Dropdown.Item>

            {showLegendButton && (
              <Dropdown.Item
                key="legend"
                href="#show=legend"
                onSelect={(_, e) => {
                  e.preventDefault();

                  setShow(undefined);

                  dispatch(setActiveModal('legend'));
                }}
              >
                <FaRegMap /> {m?.mainMenu.mapLegend}
              </Dropdown.Item>
            )}

            <Dropdown.Item
              key="privacyPolicy"
              href="#tip=privacyPolicy"
              onSelect={(_, e) => {
                e.preventDefault();

                setShow(undefined);

                dispatch(documentShow('privacyPolicy'));
              }}
            >
              <FaLock /> Privacy policy
            </Dropdown.Item>
          </Popover.Content>
        </Popover>
      </Overlay>
    </Card>
  );
}
