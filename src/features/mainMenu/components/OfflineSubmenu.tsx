import { setActiveModal } from '@app/store/actions.js';
import { cachedMapsSetView } from '@features/cachedMaps/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import { FaDatabase, FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { SubmenuHeader } from './SubmenuHeader.js';

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function OfflineSubmenu(): JSX.Element {
  const m = useMessages();

  const dispatch = useDispatch();

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const activeDownloads = useAppSelector(
    (state) => state.cachedMaps.activeDownloads,
  );

  const completedMaps = cachedMaps.filter(
    (cm) => cm.downloadedCount === cm.tileCount,
  );

  const totalSize = cachedMaps.reduce((sum, cm) => sum + cm.sizeBytes, 0);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const downloadingEntry = Object.entries(activeDownloads).find(
    ([, dl]) => dl.status === 'downloading',
  );

  return (
    <>
      <SubmenuHeader icon={<BiWifiOff />} title={m?.offline.offlineMode} />

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(cachedMapsSetView('list'));
          dispatch(setActiveModal('offline-maps'));
        }}
      >
        <FaDatabase />{' '}
        {completedMaps.length > 0
          ? `${nf.format(completedMaps.length)} ${completedMaps.length === 1 ? 'map' : 'maps'} (${formatSize(totalSize)})`
          : 'No offline maps'}
      </Dropdown.Item>

      {downloadingEntry && (
        <Dropdown.Item as="button" disabled>
          <em>
            Caching...{' '}
            {Math.round(
              (downloadingEntry[1].downloaded / downloadingEntry[1].total) *
                100,
            )}
            %
          </em>
        </Dropdown.Item>
      )}

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(cachedMapsSetView('add'));
          dispatch(setActiveModal('offline-maps'));
        }}
      >
        <FaPlus /> Cache map for offline use
      </Dropdown.Item>
    </>
  );
}
