import { get } from 'idb-keyval';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBars, FaExternalLinkAlt } from 'react-icons/fa';
import { clearCache, setCacheMode, setCachingActive } from '../../../cache.js';
import { fixedPopperConfig } from '../../../fixedPopperConfig.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMenuHandler } from '../../../hooks/useMenuHandler.js';
import { useScrollClasses } from '../../../hooks/useScrollClasses.js';
import { useMessages } from '../../../l10nInjector.js';
import { CacheMode } from '../../../types/common.js';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';
import { OpenInExternalAppDropdownItems } from '../../../components/OpenInExternalAppMenuItems.js';
import { HelpSubmenu } from './HelpSubmenu.js';
import { LanguageSubmenu } from './LanguageSubmenu.js';
import { MainMenu } from './MainMenu.js';
import { OfflineSubmenu } from './OfflineSubmenu.js';
import { SocialButtons } from './SocialButtons.js';
import { SubmenuHeader } from './SubmenuHeader.js';
import { TrackingSubmenu } from './TrackingSubmenu.js';

export function MainMenuButton(): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const m = useMessages();

  const sc = useScrollClasses('vertical');

  const [cacheMode, setCacheModeLocal] = useState<CacheMode>('networkOnly');

  const [cachingActive, setCachingActiveLocal] = useState<boolean>(false);

  const [cacheExists, setCacheExists] = useState(false);

  const {
    handleSelect,
    menuShown,
    handleMenuToggle,
    closeMenu,
    submenu,
    extraHandler,
  } = useMenuHandler();

  extraHandler.current = useCallback(
    (eventKey: string) => {
      if (eventKey.startsWith('cacheMode-')) {
        const cacheMode = eventKey.slice(10) as CacheMode;

        setCacheMode(cacheMode);

        setCacheModeLocal(cacheMode);
      } else if (eventKey === 'caching-active-toggle') {
        setCachingActive(!cachingActive).then(() => {
          setCacheExists(true);
        });

        setCachingActiveLocal((a) => !a);
      } else if (eventKey === 'cache-clear') {
        clearCache().then(() => {
          setCacheExists(false);
        });
      } else {
        return false;
      }

      return true;
    },
    [cachingActive],
  );

  useEffect(() => {
    get('cacheMode').then((cacheMode) =>
      setCacheModeLocal(cacheMode ?? 'networkOnly'),
    );

    caches.keys().then((key) => setCacheExists(key.includes('offline')));
  }, []);

  useEffect(() => {
    get('cachingActive').then(setCachingActiveLocal);
  }, []);

  return (
    <Dropdown
      onSelect={handleSelect}
      autoClose="outside"
      show={menuShown}
      onToggle={handleMenuToggle}
    >
      <LongPressTooltip label={m?.mainMenu.title}>
        {({ props }) => (
          <Dropdown.Toggle bsPrefix="fm-dropdown-toggle-nocaret" {...props}>
            <FaBars />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <Dropdown.Menu
        popperConfig={fixedPopperConfig}
        className="fm-dropdown-with-scroller"
      >
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
                showKbdShortcut
              />
            </Fragment>
          ) : submenu === 'language' ? (
            <LanguageSubmenu />
          ) : submenu === 'tracking' ? (
            <TrackingSubmenu />
          ) : null}

          {submenu === null && (
            <>
              <Dropdown.Divider />

              <SocialButtons closeMenu={closeMenu} />
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
