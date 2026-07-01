import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isDrawTool, toolDefinitions } from '@shared/toolDefinitions.js';
import { type ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaCalendarAlt,
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
import { toolsSelector } from '@/app/store/selectors.js';
import {
  documentMenuItemProps,
  modalMenuItemProps,
} from '@/shared/hooks/useMenuHandler.js';
import { LanguageLabel } from './LanguageLabel.js';

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const galleryActive = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const tools = useAppSelector(toolsSelector);

  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <LanguageLabel>
          {(language) => (
            <>
              <IoLanguage /> {language} <FaChevronRight />
            </>
          )}
        </LanguageLabel>
      </Dropdown.Item>

      {user ? (
        <Dropdown.Item {...modalMenuItemProps('account')}>
          <FaUser /> {m?.mainMenu.account} <kbd>e</kbd> <kbd>a</kbd>
        </Dropdown.Item>
      ) : (
        <Dropdown.Item {...modalMenuItemProps('login')}>
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </Dropdown.Item>
      )}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="clear-map-features">
        <FaEraser /> {m?.main.clearMap} <kbd>g</kbd> <kbd>c</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="?layers=I"
        key="gallery"
        eventKey="gallery"
        active={galleryActive}
      >
        <FaCamera /> {m?.tools.photos} <kbd>⇧f</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('my-maps')}>
        <FaRegMap /> {m?.tools.myMaps} <kbd>g</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('events')}>
        <FaCalendarAlt /> {m?.tools.events}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="drawing"
        active={tools.some(isDrawTool)}
      >
        <FaPencilRuler /> {m?.tools.measurement}
      </Dropdown.Item>

      {toolDefinitions
        .filter(({ draw }) => !draw)
        .map(
          ({ tool: newTool, icon, msgKey, kbd }) =>
            newTool && (
              <Dropdown.Item
                href={`?tools=${newTool}`}
                key={newTool}
                eventKey={'tool-' + newTool}
                active={tools.includes(newTool)}
              >
                {icon} {m?.tools[msgKey]}{' '}
                {kbd && (
                  <>
                    <kbd>g</kbd>{' '}
                    <kbd>{kbd.replace(/Key/, '').toLowerCase()}</kbd>
                  </>
                )}
              </Dropdown.Item>
            ),
        )}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-openExternally">
        <FaExternalLinkAlt /> {oeam?.openInExternal} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('map-features-export')}>
        <FaFileExport /> {m?.mainMenu.mapFeaturesExport} <kbd>e</kbd>{' '}
        <kbd>g</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('map-to-document-export')}>
        <FaPrint /> {m?.mainMenu.mapToDocumentExport} <kbd>e</kbd> <kbd>p</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('offline-map-export')}>
        <FaDatabase /> {m?.mainMenu.offlineMapExport} <kbd>e</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...documentMenuItemProps('exports')}>
        <FaMobileAlt /> {m?.mainMenu.gpsDevicesMapExports}
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('embed')}>
        <FaCode /> {m?.mainMenu.embedMap} <kbd>e</kbd> <kbd>e</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-help">
        <FaBook /> {m?.mainMenu.help} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('support-us')}>
        <FaHeart color="red" /> {m?.mainMenu.supportUs} <FaHeart color="red" />
      </Dropdown.Item>
    </>
  );
}
