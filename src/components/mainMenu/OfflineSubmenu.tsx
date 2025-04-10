import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaEraser } from 'react-icons/fa';
import { useMessages } from '../../l10nInjector.js';
import { CacheMode } from '../../types/common.js';
import { Checkbox } from '../Checkbox.js';
import { SubmenuHeader } from './SubmenuHeader.js';

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
