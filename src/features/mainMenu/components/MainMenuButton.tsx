import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { HelpSubmenu } from './HelpSubmenu.js';
import { LanguageSubmenu } from './LanguageSubmenu.js';
import { MainMenu } from './MainMenu.js';
import { OpenExternallySubmenu } from './OpenExternallySubmenu.js';
import { SocialButtons } from './SocialButtons.js';

export function MainMenuButton(): ReactElement {
  const m = useMessages();

  const sc = useScrollClasses('vertical');

  const { handleSelect, menuShown, handleMenuToggle, closeMenu, submenu } =
    useMenuHandler();

  return (
    <Dropdown
      onSelect={handleSelect}
      autoClose="outside"
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <LongPressTooltip label={m?.mainMenu.title}>
        {({ props }) => (
          <Dropdown.Toggle bsPrefix="fm-dropdown-toggle-nocaret" {...props}>
            <FaBars />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <Dropdown.Menu
        popperConfig={fixedPopperConfig}
        className="fm-dropdown-with-scroller"
      >
        <div className="fm-menu-scroller" ref={sc}>
          <div />

          {submenu === null ? (
            <MainMenu />
          ) : submenu === 'help' ? (
            <HelpSubmenu />
          ) : submenu === 'openExternally' ? (
            <OpenExternallySubmenu />
          ) : submenu === 'language' ? (
            <LanguageSubmenu />
          ) : null}

          {submenu === null && (
            <>
              <Dropdown.Divider />

              <SocialButtons closeMenu={closeMenu} />
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
