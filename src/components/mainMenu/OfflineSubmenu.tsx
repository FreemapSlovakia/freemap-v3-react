import Dropdown from 'react-bootstrap/Dropdown';
import { BiWifiOff } from 'react-icons/bi';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function OfflineSubmenu(): JSX.Element {
  const closeMenu = useMenuClose();

  const handleCachePopulate = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'cacheStatic' });
    });

    closeMenu();
  };

  const handleCacheClear = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'clearCache' });
    });

    closeMenu();
  };

  return (
    <>
      <SubmenuHeader icon={<BiWifiOff />} title="Offline" />

      <Dropdown.Item
        as="button"
        eventKey="language"
        onSelect={handleCachePopulate}
      >
        Populate cache
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="language"
        onSelect={handleCacheClear}
      >
        Clear cache
      </Dropdown.Item>
    </>
  );
}
