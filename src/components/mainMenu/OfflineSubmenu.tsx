import { useMessages } from 'fm3/l10nInjector';
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

  const m = useMessages();

  const [cachingActive, setCachingActive] = useState<boolean>(false);

  const handleCacheActiveSelect = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'setCachingActive',
        payload: !cachingActive,
      });

      setCacheExists(true); // TODO use events from sw
    });

    setCachingActive((a) => !a);
  };

  const handleCacheClear = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'clearCache' });

      setCacheExists(false); // TODO use events from sw
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

  const [cacheExists, setCacheExists] = useState(false);

  useEffect(() => {
    get('cacheMode').then(setCacheMode);

    caches.keys().then((key) => setCacheExists(key.includes('offline')));
  }, []);

  useEffect(() => {
    get('cachingActive').then(setCachingActive);
  }, []);

  return (
    <>
      <SubmenuHeader icon={<BiWifiOff />} title={m?.offline.offlineMode} />

      <Dropdown.Item
        as="button"
        onSelect={handleCacheActiveSelect}
        active={cachingActive}
        disabled={cacheMode === 'cacheOnly'}
      >
        <Checkbox value={cachingActive} /> {m?.offline.cachingActive}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={handleCacheClear}
        disabled={!cacheExists}
      >
        <FaEraser /> {m?.offline.clearCache}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>{m?.offline.dataSource}</Dropdown.Header>

      <Dropdown.Item
        as="button"
        eventKey="networkOnly"
        onSelect={handleModeSelect}
        active={cacheMode === 'networkOnly'}
      >
        <Checkbox value={cacheMode === 'networkOnly'} />{' '}
        {m?.offline.networkOnly}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="networkFirst"
        onSelect={handleModeSelect}
        active={cacheMode === 'networkFirst'}
      >
        <Checkbox value={cacheMode === 'networkFirst'} />{' '}
        {m?.offline.networkFirst}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheFirst"
        onSelect={handleModeSelect}
        active={cacheMode === 'cacheFirst'}
      >
        <Checkbox value={cacheMode === 'cacheFirst'} /> {m?.offline.cacheFirst}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheOnly"
        onSelect={handleModeSelect}
        active={cacheMode === 'cacheOnly'}
        disabled={!cacheExists}
      >
        <Checkbox value={cacheMode === 'cacheOnly'} /> {m?.offline.cacheOnly}
      </Dropdown.Item>
    </>
  );
}
