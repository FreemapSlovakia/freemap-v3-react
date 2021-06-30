import {
  authChooseLoginMethod,
  authStartLogout,
} from 'fm3/actions/authActions';
import {
  clearMap,
  Modal,
  setActiveModal,
  setTool,
  Tool,
} from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { useMessages } from 'fm3/l10nInjector';
import { TipKey } from 'fm3/tips';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { ReactElement, SyntheticEvent, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
  FaHeart,
  FaLanguage,
  FaMobileAlt,
  FaPencilRuler,
  FaRegFilePdf,
  FaRegMap,
  FaSignInAlt,
  FaSignOutAlt,
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

  const expertMode = useSelector((state) => state.main.expertMode);

  const closeMenu = useMenuClose();

  const dispatch = useDispatch();

  const handleTipSelect = useCallback(
    (tip: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<TipKey>(tip)) {
        dispatch(tipsShow(tip));
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
          as="button"
          onSelect={() => {
            closeMenu();
            dispatch(authStartLogout());
          }}
        >
          <FaSignOutAlt /> {m?.mainMenu.logOut(user.name)}
        </Dropdown.Item>
      ) : (
        <Dropdown.Item
          onSelect={() => {
            closeMenu();
            dispatch(authChooseLoginMethod());
          }}
        >
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </Dropdown.Item>
      )}

      <Dropdown.Item
        eventKey="settings"
        href="?show=settings"
        onSelect={showModal}
      >
        <FaCog /> {m?.mainMenu.settings} <kbd>e</kbd> <kbd>s</kbd>
      </Dropdown.Item>

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
        .filter(({ expertOnly, draw }) => !draw && (expertMode || !expertOnly))
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
