import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppDropdownItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { ActionIcon, Menu, ScrollArea } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { MenuSelectContext } from '@shared/components/menuSelectContext.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { useSubmenuScrollMemory } from '@shared/hooks/useSubmenuScrollMemory.js';
import {
  Fragment,
  type ReactElement,
  type SyntheticEvent,
  useMemo,
  useRef,
} from 'react';
import { FaBars, FaExternalLinkAlt } from 'react-icons/fa';
import { HelpSubmenu } from './HelpSubmenu.js';
import { LanguageSubmenu } from './LanguageSubmenu.js';
import { MainMenu } from './MainMenu.js';
import { SocialButtons } from './SocialButtons.js';
import { SubmenuHeader } from './SubmenuHeader.js';
import { TrackingSubmenu } from './TrackingSubmenu.js';

const SYNTH_EVENT = {
  preventDefault() {},
} as SyntheticEvent<unknown, Event>;

export function MainMenuButton(): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const m = useMessages();

  const { handleSelect, menuShown, handleMenuToggle, closeMenu, submenu } =
    useMenuHandler();

  const viewportRef = useRef<HTMLDivElement>(null);

  useSubmenuScrollMemory(viewportRef, submenu);

  const select = useMemo(
    () => (eventKey: string) => handleSelect(eventKey, SYNTH_EVENT),
    [handleSelect],
  );

  return (
    <MenuSelectContext.Provider value={select}>
      <Menu
        opened={menuShown}
        onChange={handleMenuToggle}
        closeOnItemClick={false}
      >
        <Menu.Target>
          <MantineLongPressTooltip label={m?.mainMenu.title}>
            {({ props }) => (
              <ActionIcon variant="filled" size="input-sm" {...props}>
                <FaBars />
              </ActionIcon>
            )}
          </MantineLongPressTooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize
            mah="calc(100dvh - 160px)"
            type="auto"
            viewportRef={viewportRef}
          >
            {submenu === null ? (
              <MainMenu />
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
                  onSelect={select}
                />
              </Fragment>
            ) : submenu === 'language' ? (
              <LanguageSubmenu />
            ) : submenu === 'tracking' ? (
              <TrackingSubmenu />
            ) : null}

            {submenu === null && (
              <>
                <Menu.Divider />

                <SocialButtons closeMenu={closeMenu} />
              </>
            )}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>
    </MenuSelectContext.Provider>
  );
}
