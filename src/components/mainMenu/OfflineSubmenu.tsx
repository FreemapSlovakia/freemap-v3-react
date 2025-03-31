import { useMessages } from 'fm3/l10nInjector';
import { CacheMode } from 'fm3/types/common';
import Dropdown from 'react-bootstrap/Dropdown';
import { BiWifiOff } from 'react-icons/bi';
import { FaEraser } from 'react-icons/fa';
import { Checkbox } from '../Checkbox';
import { SubmenuHeader } from './SubmenuHeader';
import { JSX } from 'react';

type Props = {
  className?: string;
  cacheMode: CacheMode;
  cachingActive: boolean;
  cacheExists: boolean;
};

export function OfflineSubmenu({
  cacheMode,
  cachingActive,
  cacheExists,
}: Props): JSX.Element {
  const m = useMessages();

  return (
    <>
      <SubmenuHeader icon={<BiWifiOff />} title={m?.offline.offlineMode} />

      <Dropdown.Item
        as="button"
        eventKey="caching-active-toggle"
        active={cachingActive}
        disabled={cacheMode === 'cacheOnly'}
      >
        <Checkbox value={cachingActive} /> {m?.offline.cachingActive}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="cache-clear" disabled={!cacheExists}>
        <FaEraser /> {m?.offline.clearCache}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>{m?.offline.dataSource}</Dropdown.Header>

      <Dropdown.Item
        as="button"
        eventKey="cacheMode-networkOnly"
        active={cacheMode === 'networkOnly'}
      >
        <Checkbox value={cacheMode === 'networkOnly'} />{' '}
        {m?.offline.networkOnly}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheMode-networkFirst"
        active={cacheMode === 'networkFirst'}
      >
        <Checkbox value={cacheMode === 'networkFirst'} />{' '}
        {m?.offline.networkFirst}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheMode-cacheFirst"
        active={cacheMode === 'cacheFirst'}
      >
        <Checkbox value={cacheMode === 'cacheFirst'} /> {m?.offline.cacheFirst}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheMode-cacheOnly"
        active={cacheMode === 'cacheOnly'}
        disabled={!cacheExists}
      >
        <Checkbox value={cacheMode === 'cacheOnly'} /> {m?.offline.cacheOnly}
      </Dropdown.Item>
    </>
  );
}
