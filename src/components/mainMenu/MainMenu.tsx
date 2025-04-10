import { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaBook,
  FaBullseye,
  FaCamera,
  FaChevronRight,
  FaCode,
  FaCog,
  FaDownload,
  FaEraser,
  FaExternalLinkAlt,
  FaFlask,
  FaHeart,
  FaLanguage,
  FaMobileAlt,
  FaPencilRuler,
  FaPrint,
  FaRegMap,
  FaSignInAlt,
} from 'react-icons/fa';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { toolDefinitions } from '../../toolDefinitions.js';

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = toolDefinitions.find(
    (t) =>
      t.tool ===
      (tool === 'draw-polygons' || tool === 'draw-points'
        ? 'draw-lines'
        : tool),
  ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <FaLanguage /> Language / Jazyk / Nyelv / Lingua
        <FaChevronRight />
      </Dropdown.Item>

      {user ? (
        <Dropdown.Item eventKey="modal-account" href="#show=account">
          <FaCog /> {m?.mainMenu.account} <kbd>e</kbd> <kbd>a</kbd>
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

      <Dropdown.Item as="button" eventKey="submenu-drawing">
        <FaPencilRuler /> {m?.tools.measurement}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="submenu-photos">
        <FaCamera /> {m?.tools.photos}
        <FaChevronRight />
      </Dropdown.Item>

      {toolDefinitions
        .filter(({ draw }) => !draw)
        .map(
          ({ tool: newTool, icon, msgKey, kbd }) =>
            newTool && (
              <Dropdown.Item
                href={`?tool=${tool}`}
                key={newTool}
                eventKey={'tool-' + newTool}
                active={toolDef?.tool === newTool}
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

      <Dropdown.Item as="button" eventKey="submenu-tracking">
        <FaBullseye /> {m?.tools.tracking}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="submenu-offline">
        <BiWifiOff />{' '}
        <FaFlask
          title={m?.general.experimentalFunction}
          className="text-warning"
        />{' '}
        {m?.offline.offlineMode}
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

      <Dropdown.Item eventKey="document-exports" href="#tip=exports">
        <FaMobileAlt /> {m?.mainMenu.mapExports}
      </Dropdown.Item>

      <Dropdown.Item eventKey="modal-embed" href="#show=embed">
        <FaCode /> {m?.mainMenu.embedMap} <kbd>e</kbd> <kbd>e</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="submenu-help">
        <FaBook /> {m?.mainMenu.help} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item href="#show=supportUs" eventKey="modal-supportUs">
        <FaHeart color="red" /> {m?.mainMenu.supportUs} <FaHeart color="red" />
      </Dropdown.Item>
    </>
  );
}
