import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppDropdownItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { Fragment, ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBars, FaExternalLinkAlt } from 'react-icons/fa';
import { HelpSubmenu } from './HelpSubmenu.js';
import { LanguageSubmenu } from './LanguageSubmenu.js';
import { MainMenu } from './MainMenu.js';
import { OfflineSubmenu } from './OfflineSubmenu.js';
import { SocialButtons } from './SocialButtons.js';
import { SubmenuHeader } from './SubmenuHeader.js';
import { TrackingSubmenu } from './TrackingSubmenu.js';

export function MainMenuButton(): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

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
          ) : submenu === 'offline' ? (
            <OfflineSubmenu />
          ) : submenu === 'help' ? (
            <HelpSubmenu />
          ) : submenu === 'openExternally' ? (
            <Fragment key="openExternally">
              <SubmenuHeader
                icon={<FaExternalLinkAlt />}
                title={m?.external.openInExternal}
              />

              <OpenInExternalAppDropdownItems
                lat={lat}
                lon={lon}
                zoom={zoom}
                showKbdShortcut
              />
            </Fragment>
          ) : submenu === 'language' ? (
            <LanguageSubmenu />
          ) : submenu === 'tracking' ? (
            <TrackingSubmenu />
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
