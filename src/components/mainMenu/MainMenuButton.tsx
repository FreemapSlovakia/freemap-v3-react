import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaBars, FaExternalLinkAlt } from 'react-icons/fa';
import { OpenInExternalAppDropdownItems } from '../OpenInExternalAppMenuItems';
import { DrawingSubmenu } from './DrawingSubmenu';
import { GallerySubmenu } from './GallerySubmenu';
import { HelpSubmenu } from './HelpSubmenu';
import { LanguageSubmenu } from './LanguageSubmenu';
import { MainMenu } from './MainMenu';
import { OfflineSubmenu } from './OfflineSubmenu';
import { SocialButtons } from './SocialButtons';
import { SubmenuHeader } from './SubmenuHeader';
import { TrackingSubmenu } from './TrackingSubmenu';
import { CacheMode } from 'fm3/types/common';
import { get } from 'idb-keyval';
import { useMenuHandler } from 'fm3/hooks/useMenuHandler';
import { fixedPopperConfig } from 'fm3/fixedPopperConfig';

export function MainMenuButton(): ReactElement {
  const mapType = useAppSelector((state) => state.map.mapType);

  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const m = useMessages();

  const sc = useScrollClasses('vertical');

  const [cacheMode, setCacheMode] = useState<CacheMode>('networkOnly');

  const [cachingActive, setCachingActive] = useState<boolean>(false);

  const [cacheExists, setCacheExists] = useState(false);

  const extraMenuHandler = useCallback(
    (eventKey: string) => {
      if (eventKey.startsWith('cacheMode-')) {
        const cacheMode = eventKey.slice(10) as CacheMode;

        window.navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({
            type: 'setCacheMode',
            payload: cacheMode,
          });
        });

        setCacheMode(cacheMode);
      } else if (eventKey === 'caching-active-toggle') {
        window.navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({
            type: 'setCachingActive',
            payload: !cachingActive,
          });

          setCacheExists(true); // TODO use events from sw
        });

        setCachingActive((a) => !a);
      } else if (eventKey === 'cache-clear') {
        window.navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({ type: 'clearCache' });

          setCacheExists(false); // TODO use events from sw
        });
      } else {
        return false;
      }

      return true;
    },
    [cachingActive],
  );

  const { handleSelect, menuShown, handleMenuToggle, closeMenu, submenu } =
    useMenuHandler({ extraHandler: extraMenuHandler });

  useEffect(() => {
    get('cacheMode').then((cacheMode) =>
      setCacheMode(cacheMode ?? 'networkOnly'),
    );

    caches.keys().then((key) => setCacheExists(key.includes('offline')));
  }, []);

  useEffect(() => {
    get('cachingActive').then(setCachingActive);
  }, []);

  return (
    <Dropdown
      onSelect={handleSelect}
      autoClose="outside"
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <Dropdown.Toggle
        title={m?.mainMenu.title}
        bsPrefix="fm-dropdown-toggle-nocaret"
      >
        <FaBars />
      </Dropdown.Toggle>

      <Dropdown.Menu popperConfig={fixedPopperConfig}>
        <div className="fm-menu-scroller" ref={sc}>
          <div />

          {submenu === null ? (
            <MainMenu />
          ) : submenu === 'offline' ? (
            <OfflineSubmenu
              cacheMode={cacheMode}
              cacheExists={cacheExists}
              cachingActive={cachingActive}
            />
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

              <SocialButtons className="mx-2" closeMenu={closeMenu} />
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
