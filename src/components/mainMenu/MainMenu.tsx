import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaBook,
  FaBullseye,
  FaChevronRight,
  FaCode,
  FaDownload,
  FaEraser,
  FaExternalLinkAlt,
  FaHeart,
  FaLanguage,
  FaMobileAlt,
  FaPrint,
  FaRegMap,
  FaSignInAlt,
  FaToolbox,
  FaUser,
} from 'react-icons/fa';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { ExperimentalFunction } from '../ExperimentalFunction.js';

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <FaLanguage /> Language / Jazyk / Nyelv / Lingua
        <FaChevronRight />
      </Dropdown.Item>

      {user ? (
        <Dropdown.Item eventKey="modal-account" href="#show=account">
          <FaUser /> {m?.mainMenu.account} <kbd>e</kbd> <kbd>a</kbd>
        </Dropdown.Item>
      ) : (
        <Dropdown.Item eventKey="modal-login">
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </Dropdown.Item>
      )}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="clear-map-features">
        <FaEraser /> {m?.main.clearMap} <kbd>g</kbd> <kbd>c</kbd>
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="modal-maps">
        <FaRegMap /> {m?.tools.maps} <kbd>g</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="submenu-tools">
        <FaToolbox /> {m?.tools.tools}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="submenu-tracking">
        <FaBullseye /> {m?.tools.tracking}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="submenu-offline">
        <BiWifiOff /> <ExperimentalFunction /> {m?.offline.offlineMode}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-openExternally">
        <FaExternalLinkAlt /> {m?.external.openInExternal} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item href="#show=export-map" eventKey="modal-export-map">
        <FaPrint /> {m?.mainMenu.mapExport} <kbd>e</kbd> <kbd>p</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        eventKey="modal-export-map-features"
        href="#show=export-map-features"
      >
        <FaDownload /> {m?.mainMenu.mapFeaturesExport} <kbd>e</kbd> <kbd>g</kbd>
      </Dropdown.Item>

      <Dropdown.Item eventKey="document-exports" href="#document=exports">
        <FaMobileAlt /> {m?.mainMenu.mapExports}
      </Dropdown.Item>

      <Dropdown.Item eventKey="modal-download-map" href="#show=download-map">
        <FaDownload /> <ExperimentalFunction /> {m?.downloadMap.downloadMap}{' '}
        <kbd>e</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item eventKey="modal-embed" href="#show=embed">
        <FaCode /> {m?.mainMenu.embedMap} <kbd>e</kbd> <kbd>e</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-help">
        <FaBook /> {m?.mainMenu.help} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item href="#show=support-us" eventKey="modal-support-us">
        <FaHeart color="red" /> {m?.mainMenu.supportUs} <FaHeart color="red" />
      </Dropdown.Item>
    </>
  );
}
