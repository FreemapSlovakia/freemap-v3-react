import {
  hasClearableMapFeaturesSelector,
  openToolsSelector,
} from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { Chord } from '@shared/components/Chord.js';
import { Emoji } from '@shared/components/Emoji.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFullscreen } from '@shared/hooks/useFullscreen.js';
import {
  documentMenuItemProps,
  modalMenuItemProps,
} from '@shared/hooks/useMenuHandler.js';
import {
  isDrawTool,
  isToolAvailable,
  toolDefinitions,
  unavailableToolsSelector,
} from '@shared/toolDefinitions.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaCamera,
  FaChevronRight,
  FaCode,
  FaDatabase,
  FaEraser,
  FaExternalLinkAlt,
  FaFileExport,
  FaHeart,
  FaMobileAlt,
  FaPencilRuler,
  FaPrint,
  FaRegMap,
  FaSignInAlt,
  FaUser,
} from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';
import { flagItems } from './languageItems.js';
import classes from './MainMenu.module.css';

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const galleryActive = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const openTools = useAppSelector(openToolsSelector);

  const unavailable = useAppSelector(unavailableToolsSelector);

  const hasClearableMapFeatures = useAppSelector(
    hasClearableMapFeaturesSelector,
  );

  const fullscreen = useFullscreen();

  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <IoLanguage />
        <MenuLabel>{m?.mainMenu.language}</MenuLabel>
        <span className={classes.flags}>
          {flagItems.map(({ code, name, flag }) => (
            <span key={code} title={name}>
              <Emoji>{flag}</Emoji>
            </span>
          ))}
        </span>
        <MenuGutter>
          <FaChevronRight />
        </MenuGutter>
      </Dropdown.Item>

      {user ? (
        <OnlineOnlyItem {...modalMenuItemProps('account')}>
          <FaUser />
          <MenuLabel>{m?.mainMenu.account}</MenuLabel>
          <MenuGutter>
            <Chord modal="account" />
          </MenuGutter>
        </OnlineOnlyItem>
      ) : (
        <OnlineOnlyItem {...modalMenuItemProps('login')}>
          <FaSignInAlt />
          <MenuLabel>{m?.mainMenu.logIn}</MenuLabel>
        </OnlineOnlyItem>
      )}

      {fullscreen.available && (
        <Dropdown.Item as="button" eventKey="fullscreen">
          {fullscreen.active ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
          <MenuLabel>
            {fullscreen.active
              ? m?.general.exitFullscreen
              : m?.general.fullscreen}
          </MenuLabel>
        </Dropdown.Item>
      )}

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        eventKey="clear-map-features"
        disabled={!hasClearableMapFeatures}
      >
        <FaEraser />
        <MenuLabel>{m?.main.clearMap}</MenuLabel>
        <MenuGutter>
          <Chord command="clear-map-features" />
        </MenuGutter>
      </Dropdown.Item>

      {/* Only a layer toggle, so it works offline; the layer menu is where the
          layer that draws nothing is marked. */}
      <Dropdown.Item
        href="#layers=I"
        key="gallery"
        eventKey="gallery"
        active={galleryActive}
      >
        <FaCamera />
        <MenuLabel>{m?.tools.photos}</MenuLabel>
        <MenuGutter>
          <kbd>⇧f</kbd>
        </MenuGutter>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('my-maps')}>
        <FaRegMap />
        <MenuLabel>{m?.tools.myMaps}</MenuLabel>
        <MenuGutter>
          <Chord modal="my-maps" />
        </MenuGutter>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="drawing"
        active={openTools.some(isDrawTool)}
      >
        <FaPencilRuler />
        <MenuLabel>{m?.tools.measurement}</MenuLabel>
      </Dropdown.Item>

      {toolDefinitions
        .filter(({ draw, tool }) => !draw && isToolAvailable(unavailable, tool))
        .map(({ tool: newTool, icon, msgKey, experimental }) => {
          return (
            newTool && (
              <Dropdown.Item
                href={`#tools=${newTool}`}
                key={newTool}
                eventKey={`tool-${newTool}`}
                active={openTools.includes(newTool)}
              >
                {icon}
                <MenuLabel>{m?.tools[msgKey]}</MenuLabel>
                <MenuGutter>
                  {experimental && <ExperimentalFunction />}
                  <Chord tool={newTool} />
                </MenuGutter>
              </Dropdown.Item>
            )
          );
        })}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-openExternally">
        <FaExternalLinkAlt />
        <MenuLabel>{oeam?.openInExternal}</MenuLabel>
        <MenuGutter>
          <FaChevronRight />
        </MenuGutter>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('map-features-export')}>
        <FaFileExport />
        <MenuLabel>{m?.mainMenu.mapFeaturesExport}</MenuLabel>
        <MenuGutter>
          <Chord modal="map-features-export" />
        </MenuGutter>
      </Dropdown.Item>

      <OnlineOnlyItem {...modalMenuItemProps('map-to-document-export')}>
        <FaPrint />
        <MenuLabel>{m?.mainMenu.mapToDocumentExport}</MenuLabel>
        <MenuGutter>
          <Chord modal="map-to-document-export" />
        </MenuGutter>
      </OnlineOnlyItem>

      <OnlineOnlyItem {...modalMenuItemProps('offline-map-export')}>
        <FaDatabase />
        <MenuLabel>{m?.mainMenu.offlineMapExport}</MenuLabel>
        <MenuGutter>
          <Chord modal="offline-map-export" />
        </MenuGutter>
      </OnlineOnlyItem>

      <Dropdown.Item {...documentMenuItemProps('exports')}>
        <FaMobileAlt />
        <MenuLabel>{m?.mainMenu.gpsDevicesMapExports}</MenuLabel>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('embed')}>
        <FaCode />
        <MenuLabel>{m?.mainMenu.embedMap}</MenuLabel>
        <MenuGutter>
          <Chord modal="embed" />
        </MenuGutter>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-help">
        <FaBook />
        <MenuLabel>{m?.mainMenu.help}</MenuLabel>
        <MenuGutter>
          <FaChevronRight />
        </MenuGutter>
      </Dropdown.Item>

      <OnlineOnlyItem {...modalMenuItemProps('support-us')}>
        <FaHeart color="red" />
        <MenuLabel>{m?.mainMenu.supportUs}</MenuLabel>
        <FaHeart color="red" />
      </OnlineOnlyItem>
    </>
  );
}
