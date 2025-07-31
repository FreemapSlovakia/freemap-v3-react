import { useEffect, useState, type ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaBook,
  FaBullseye,
  FaCamera,
  FaChevronRight,
  FaCode,
  FaDownload,
  FaEraser,
  FaExternalLinkAlt,
  FaHeart,
  FaMobileAlt,
  FaPencilRuler,
  FaPrint,
  FaRegMap,
  FaSignInAlt,
  FaUser,
} from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { toolDefinitions } from '../../toolDefinitions.js';
import { ExperimentalFunction } from '../ExperimentalFunction.js';

const LANGUAGES = ['Language', 'Lingua', 'Jazyk', 'Język', 'Sprache', 'Nyelv'];

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const galleryActive = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = toolDefinitions.find((t) => t.tool === tool);

  const m = useMessages();

  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * LANGUAGES.length),
  );
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);

      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % LANGUAGES.length);
        setFading(false);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const prevIndex = (currentIndex + LANGUAGES.length - 1) % LANGUAGES.length;

  return (
    <>
      <Dropdown.Item as="button" eventKey="submenu-language">
        <span className="position-relative">
          <span
            key={prevIndex}
            className={`position-absolute top-0 start-0 transition-opacity ${fading ? 'opacity-0' : 'opacity-100'} text-nowrap fm-transition`}
          >
            <IoLanguage /> {LANGUAGES[prevIndex]} <FaChevronRight />
          </span>
          <span
            key={currentIndex}
            className={`position-absolute top-0 start-0 transition-opacity ${fading ? 'opacity-100' : 'opacity-0'} text-nowrap fm-transition`}
          >
            <IoLanguage /> {LANGUAGES[currentIndex]} <FaChevronRight />
          </span>
          &nbsp;
        </span>
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

      <Dropdown.Item
        href="?layers=I"
        key="gallery"
        eventKey="gallery"
        active={galleryActive}
      >
        <FaCamera /> {m?.tools.photos} <kbd>⇧f</kbd>
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="modal-maps">
        <FaRegMap /> {m?.tools.maps} <kbd>g</kbd> <kbd>m</kbd>
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="drawing">
        <FaPencilRuler /> {m?.tools.measurement}
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
