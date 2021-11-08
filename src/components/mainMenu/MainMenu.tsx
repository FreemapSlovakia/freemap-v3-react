import {
  clearMap,
  documentShow,
  Modal,
  setActiveModal,
  setTool,
  Tool,
} from 'fm3/actions/mainActions';
import { DocumentKey } from 'fm3/documents';
import { useMessages } from 'fm3/l10nInjector';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { ReactElement, SyntheticEvent, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
  FaRegFilePdf,
  FaRegMap,
  FaSignInAlt,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { Submenu } from './submenu';
import { useMenuClose } from './SubmenuHeader';

type Props = {
  onSubmenu(submenu: Submenu): void;
};

export function MainMenu({ onSubmenu }: Props): ReactElement {
  const user = useSelector((state) => state.auth.user);

  const closeMenu = useMenuClose();

  const dispatch = useDispatch();

  const handleTipSelect = useCallback(
    (key: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<DocumentKey>(key)) {
        dispatch(documentShow(key));
      }
    },
    [closeMenu, dispatch],
  );

  const m = useMessages();

  const tool = useSelector((state) => state.main.tool);

  const handleToolSelect = useCallback(
    (tool: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      if (is<Tool | null>(tool)) {
        closeMenu();

        dispatch(setTool(tool));
      }
    },
    [closeMenu, dispatch],
  );

  const toolDef = toolDefinitions.find(
    (t) =>
      t.tool ===
      (tool === 'draw-polygons' || tool === 'draw-points'
        ? 'draw-lines'
        : tool),
  ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

  const showModal = (modal: string | null, e: SyntheticEvent<unknown>) => {
    e.preventDefault();

    closeMenu();

    if (is<Modal>(modal)) {
      dispatch(setActiveModal(modal));
    }
  };

  const handleSubmenuSelect = useCallback(
    (submenu: string | null) => {
      if (is<Submenu>(submenu)) {
        onSubmenu(submenu);
      }
    },
    [onSubmenu],
  );

  return (
    <>
      <Dropdown.Item
        as="button"
        eventKey="language"
        onSelect={handleSubmenuSelect}
      >
        <FaLanguage /> Language / Jazyk / Nyelv <FaChevronRight />
      </Dropdown.Item>

      {user ? (
        <Dropdown.Item
          eventKey="account"
          href="?show=account"
          onSelect={showModal}
        >
          <FaCog /> {m?.mainMenu.account} <kbd>e</kbd> <kbd>a</kbd>
        </Dropdown.Item>
      ) : (
        <Dropdown.Item
          onSelect={() => {
            closeMenu();
            dispatch(setActiveModal('login'));
          }}
        >
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </Dropdown.Item>
      )}

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        onSelect={() => {
          closeMenu();
          dispatch(clearMap());
        }}
      >
        <FaEraser /> {m?.main.clearMap} <kbd>g</kbd> <kbd>c</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          closeMenu();
          dispatch(setActiveModal('maps'));
        }}
      >
        <FaRegMap /> {m?.tools.maps} <kbd>g</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={handleSubmenuSelect}
        eventKey="drawing"
      >
        <FaPencilRuler /> {m?.tools.measurement}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={handleSubmenuSelect}
        eventKey="photos"
      >
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
                eventKey={newTool}
                onSelect={handleToolSelect}
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

      <Dropdown.Item
        as="button"
        onSelect={handleSubmenuSelect}
        eventKey="tracking"
      >
        <FaBullseye /> {m?.tools.tracking}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={handleSubmenuSelect}
        eventKey="offline"
      >
        <BiWifiOff />{' '}
        <FaFlask
          title={m?.general.experimentalFunction}
          className="text-warning"
        />{' '}
        {m?.offline.offlineMode}
        <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        onSelect={handleSubmenuSelect}
        eventKey="openExternally"
      >
        <FaExternalLinkAlt /> {m?.external.openInExternal} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item
        href="?show=export-pdf"
        eventKey="export-pdf"
        onSelect={showModal}
      >
        <FaRegFilePdf /> {m?.mainMenu.pdfExport} <kbd>e</kbd> <kbd>p</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        eventKey="export-gpx"
        href="?show=export-gpx"
        onSelect={showModal}
      >
        <FaDownload /> {m?.mainMenu.gpxExport} <kbd>e</kbd> <kbd>g</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        eventKey="exports"
        href="?tip=exports"
        onSelect={handleTipSelect}
      >
        <FaMobileAlt /> {m?.mainMenu.mapExports}
      </Dropdown.Item>

      <Dropdown.Item eventKey="embed" href="?show=embed" onSelect={showModal}>
        <FaCode /> {m?.mainMenu.embedMap} <kbd>e</kbd> <kbd>e</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" onSelect={handleSubmenuSelect} eventKey="help">
        <FaBook /> {m?.mainMenu.help} <FaChevronRight />
      </Dropdown.Item>

      <Dropdown.Item
        href="?show=supportUs"
        eventKey="supportUs"
        onSelect={showModal}
      >
        <FaHeart color="red" /> {m?.mainMenu.supportUs} <FaHeart color="red" />
      </Dropdown.Item>
    </>
  );
}
