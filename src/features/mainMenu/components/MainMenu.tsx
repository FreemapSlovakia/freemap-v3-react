import {
  hasClearableMapFeaturesSelector,
  openToolsSelector,
} from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { Chord } from '@shared/components/Chord.js';
import { Emoji } from '@shared/components/Emoji.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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
import { languageItems } from './languageItems.js';

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

  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <IoLanguage /> {m?.mainMenu.language}{' '}
        {languageItems.map(({ code, name, flag }) => (
          <span key={code} title={name}>
            <Emoji>{flag}</Emoji>{' '}
          </span>
        ))}
        <FaChevronRight />
      </Dropdown.Item>

      {user ? (
        <OnlineOnlyItem {...modalMenuItemProps('account')}>
          <FaUser /> {m?.mainMenu.account} <Chord modal="account" />
        </OnlineOnlyItem>
      ) : (
        <OnlineOnlyItem {...modalMenuItemProps('login')}>
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </OnlineOnlyItem>
      )}

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        eventKey="clear-map-features"
        disabled={!hasClearableMapFeatures}
      >
        <FaEraser /> {m?.main.clearMap} <Chord command="clear-map-features" />
      </Dropdown.Item>

      {/* Only a layer toggle, so it works offline; the layer menu is where the
          layer that draws nothing is marked. */}
      <Dropdown.Item
        href="#layers=I"
        key="gallery"
        eventKey="gallery"
        active={galleryActive}
      >
        <FaCamera /> {m?.tools.photos} <kbd>⇧f</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('my-maps')}>
        <FaRegMap /> {m?.tools.myMaps} <Chord modal="my-maps" />
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="drawing"
        active={openTools.some(isDrawTool)}
      >
        <FaPencilRuler /> {m?.tools.measurement}
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
                {icon} {m?.tools[msgKey]}{' '}
                {experimental && (
                  <>
                    <ExperimentalFunction />{' '}
                  </>
                )}
                <Chord tool={newTool} />
              </Dropdown.Item>
            )
          );
        })}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-openExternally">
        <FaExternalLinkAlt /> {oeam?.openInExternal} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('map-features-export')}>
        <FaFileExport /> {m?.mainMenu.mapFeaturesExport}{' '}
        <Chord modal="map-features-export" />
      </Dropdown.Item>

      <OnlineOnlyItem {...modalMenuItemProps('map-to-document-export')}>
        <FaPrint /> {m?.mainMenu.mapToDocumentExport}{' '}
        <Chord modal="map-to-document-export" />
      </OnlineOnlyItem>

      <OnlineOnlyItem {...modalMenuItemProps('offline-map-export')}>
        <FaDatabase /> {m?.mainMenu.offlineMapExport}{' '}
        <Chord modal="offline-map-export" />
      </OnlineOnlyItem>

      <Dropdown.Item {...documentMenuItemProps('exports')}>
        <FaMobileAlt /> {m?.mainMenu.gpsDevicesMapExports}
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('embed')}>
        <FaCode /> {m?.mainMenu.embedMap} <Chord modal="embed" />
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-help">
        <FaBook /> {m?.mainMenu.help} <FaChevronRight />
      </Dropdown.Item>

      <OnlineOnlyItem {...modalMenuItemProps('support-us')}>
        <FaHeart color="red" /> {m?.mainMenu.supportUs} <FaHeart color="red" />
      </OnlineOnlyItem>
    </>
  );
}
