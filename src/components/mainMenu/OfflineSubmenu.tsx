import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaEraser, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
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
        disabled={cacheMode === 'cacheOnly'}
      >
        <Checkbox value={cachingActive} /> {m?.offline.cachingActive}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="cache-clear" disabled={!cacheExists}>
        <FaEraser /> {m?.offline.clearCache}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>{m?.offline.dataSource}</Dropdown.Header>

      <Dropdown.Item as="button" eventKey="cacheMode-networkOnly">
        {cacheMode === 'networkOnly' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.offline.networkOnly}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="cacheMode-networkFirst">
        {cacheMode === 'networkFirst' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.offline.networkFirst}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="cacheMode-cacheFirst">
        {cacheMode === 'cacheFirst' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.offline.cacheFirst}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cacheMode-cacheOnly"
        disabled={!cacheExists}
      >
        {cacheMode === 'cacheOnly' ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
        {m?.offline.cacheOnly}
      </Dropdown.Item>
    </>
  );
}
