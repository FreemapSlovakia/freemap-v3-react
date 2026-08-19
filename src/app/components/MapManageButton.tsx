import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import {
  modalMenuItemProps,
  useMenuHandler,
} from '@shared/hooks/useMenuHandler.js';
import type { ReactElement } from 'react';
import { ButtonGroup, Dropdown } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaChartArea,
  FaCog,
  FaDatabase,
  FaLayerGroup,
  FaSlidersH,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';

/**
 * Everything about the maps other than which one is shown: the layer and
 * custom-map editors, the offline copies, and the rendering preferences. Its
 * own button beside the map switcher, so switching a map stays one tap.
 */
export function MapManageButton(): ReactElement {
  const m = useMessages();

  const canSaveSettings = useCanSaveSettings();

  const customLayerCount = useAppSelector(
    (state) => state.map.customLayers.length,
  );

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedMapsTotalSize = cachedMaps.reduce(
    (sum, cm) => sum + cm.sizeBytes,
    0,
  );

  const { handleSelect, menuShown, handleMenuToggle } = useMenuHandler();

  return (
    <Dropdown
      show={menuShown}
      drop="up-centered"
      onSelect={handleSelect}
      autoClose="outside"
      onToggle={handleMenuToggle}
      as={ButtonGroup}
    >
      <LongPressTooltip label={m?.mapLayers.settings}>
        {({ props }) => (
          <Dropdown.Toggle
            bsPrefix="fm-dropdown-toggle-nocaret"
            variant="secondary"
            {...props}
          >
            <FaCog />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        <OnlineOnlyItem
          offline={!canSaveSettings}
          {...modalMenuItemProps('map-layers-config')}
        >
          <FaLayerGroup /> {m?.mapLayers.layersConfiguration} <kbd>m</kbd>{' '}
          <kbd>y</kbd>
        </OnlineOnlyItem>

        <Dropdown.Divider />

        {/* A custom map lives only in the account's settings, so offline there
            is nothing here to add, change or remove — unless the settings are
            the browser's own. */}
        <OnlineOnlyItem
          offline={!canSaveSettings}
          {...modalMenuItemProps('custom-maps')}
        >
          <MdDashboardCustomize /> {m?.mapLayers.customMaps}
          {customLayerCount > 0 && ` · ${customLayerCount}`} <kbd>m</kbd>{' '}
          <kbd>c</kbd>
        </OnlineOnlyItem>

        <Dropdown.Item {...modalMenuItemProps('offline-maps')}>
          <BiWifiOff /> {m?.mapLayers.offlineMaps}
          {cachedMapsTotalSize > 0 && ` · ${formatSize(cachedMapsTotalSize)}`}{' '}
          <kbd>m</kbd> <kbd>o</kbd>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('browse-cache')}>
          <FaDatabase /> {m?.mapLayers.browseCache} <kbd>m</kbd> <kbd>b</kbd>
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item {...modalMenuItemProps('map-preferences')}>
          <FaSlidersH /> {m?.mapLayers.preferences} <kbd>m</kbd> <kbd>p</kbd>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('elevation-settings')}>
          <FaChartArea /> {m?.elevationChart.settings} <kbd>m</kbd> <kbd>e</kbd>
        </Dropdown.Item>
      </FmDropdownMenu>
    </Dropdown>
  );
}
