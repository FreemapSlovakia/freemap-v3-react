import { CacheMode } from 'fm3/types/common';
import { get } from 'idb-keyval';
import { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { BiWifiOff } from 'react-icons/bi';
import { FaEraser } from 'react-icons/fa';
import { Checkbox } from '../Checkbox';
import { SubmenuHeader } from './SubmenuHeader';

export function OfflineSubmenu(): JSX.Element {
  // const closeMenu = useMenuClose();

  const [cachingActive, setCachingActive] = useState<boolean>(false);

  const handleCacheActiveSelect = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'setCachingActive',
        payload: !cachingActive,
      });
    });

    setCachingActive((a) => !a);
  };

  const handleCacheClear = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'clearCache' });
    });
  };

  const [cacheMode, setCacheMode] = useState<CacheMode>('networkOnly');

  const handleModeSelect = (mode: string | null) => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'setCacheMode',
        payload: mode,
      });
    });

    setCacheMode(mode as CacheMode);
  };

  useEffect(() => {
    get('cacheMode').then(setCacheMode);
  }, []);

  useEffect(() => {
    get('cachingActive').then(setCachingActive);
  }, []);

  return (
    <>
      <SubmenuHeader icon={<BiWifiOff />} title="Offline mode" />

      <Dropdown.Item
        as="button"
        onSelect={handleCacheActiveSelect}
        active={cachingActive}
        disabled={cacheMode === 'cacheOnly'}
      >
        <Checkbox value={cachingActive} /> Caching active
      </Dropdown.Item>

      <Dropdown.Item as="button" onSelect={handleCacheClear}>
        <FaEraser /> Clear cache
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item
        as="button"
        eventKey="networkOnly"
        onSelect={handleModeSelect}
        active={cacheMode === 'networkOnly'}
      >
        <Checkbox value={cacheMode === 'networkOnly'} /> Network only
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="networkFirst"
        onSelect={handleModeSelect}
        active={cacheMode === 'networkFirst'}
      >
        <Checkbox value={cacheMode === 'networkFirst'} /> Network first
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheFirst"
        onSelect={handleModeSelect}
        active={cacheMode === 'cacheFirst'}
      >
        <Checkbox value={cacheMode === 'cacheFirst'} /> Cache first
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheOnly"
        onSelect={handleModeSelect}
        active={cacheMode === 'cacheOnly'}
      >
        <Checkbox value={cacheMode === 'cacheOnly'} /> Cache only
      </Dropdown.Item>
    </>
  );
}
