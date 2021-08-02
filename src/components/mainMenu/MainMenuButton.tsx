import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useMessages } from 'fm3/l10nInjector';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { FaBars, FaExternalLinkAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { OpenInExternalAppDropdownItems } from '../OpenInExternalAppMenuItems';
import { DrawingSubmenu } from './DrawingSubmenu';
import { GallerySubmenu } from './GallerySubmenu';
import { HelpSubmenu } from './HelpSubmenu';
import { LanguageSubmenu } from './LanguageSubmenu';
import { MainMenu } from './MainMenu';
import { SocialButtons } from './SocialButtons';
import { Submenu } from './submenu';
import { MenuProvier, SubmenuHeader } from './SubmenuHeader';
import { TrackingSubmenu } from './TrackingSubmenu';

export function MainMenuButton(): ReactElement {
  const mapType = useSelector((state) => state.map.mapType);

  const lat = useSelector((state) => state.map.lat);

  const lon = useSelector((state) => state.map.lon);

  const zoom = useSelector((state) => state.map.zoom);

  const [show, setShow] = useState(false);

  const [submenu, setSubmenu] = useState<Submenu>(null);

  const button = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => {
    setShow(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    if (show) {
      setSubmenu(null);
    }
  }, [show]);

  const m = useMessages();

  const sc = useScrollClasses('vertical');

  const handleBack = useCallback(() => {
    setSubmenu(null);
  }, []);

  return (
    <MenuProvier onBack={handleBack} onClose={closeMenu}>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={m?.mainMenu.title}
        variant="primary"
        className="mr-1"
      >
        <FaBars />
      </Button>
      <Overlay
        rootClose
        placement="bottom"
        show={show}
        onHide={closeMenu}
        target={button.current}
      >
        <Popover id="popover-main" className="fm-menu">
          <Popover.Content className="fm-menu-scroller" ref={sc}>
            <div />

            {submenu === null ? (
              <MainMenu onSubmenu={setSubmenu} />
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
                  mapType={mapType}
                  onSelect={closeMenu}
                  pointTitle={document.title}
                  pointDescription={document.title}
                  showKbdShortcut
                />
              </Fragment>
            ) : submenu === 'language' ? (
              <LanguageSubmenu />
            ) : submenu === 'photos' ? (
              <GallerySubmenu />
            ) : submenu === 'tracking' ? (
              <TrackingSubmenu />
            ) : submenu === 'drawing' ? (
              <DrawingSubmenu />
            ) : null}

            {submenu === null && (
              <>
                <Dropdown.Divider />

                <SocialButtons className="mx-2" />
              </>
            )}
          </Popover.Content>
        </Popover>
      </Overlay>
    </MenuProvier>
  );
}
