import { useMessages } from '@features/l10n/l10nInjector.js';
import { BRIGHTNESS_STEPS } from '@features/map/brightness.js';
import { mapSetLocalPrefs } from '@features/map/model/actions.js';
import { Chord } from '@shared/components/Chord.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import {
  modalMenuItemProps,
  useMenuHandler,
} from '@shared/hooks/useMenuHandler.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { ButtonGroup, Dropdown, Form } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaChartArea,
  FaCog,
  FaDatabase,
  FaLayerGroup,
  FaSlidersH,
} from 'react-icons/fa';
import { MdBrightness6 } from 'react-icons/md';
import { useDispatch } from 'react-redux';

/**
 * The native `change`, which React's `onChange` isn't: it fires once a drag or
 * a key press has moved the slider, wherever the pointer is let go. Module
 * level, so the ref stays one function and doesn't re-attach on each render.
 */
function trackOnCommit(el: HTMLInputElement | null) {
  if (!el) {
    return;
  }

  const track = () =>
    trackMatomo(['trackEvent', 'MapSettings', 'brightness', Number(el.value)]);

  el.addEventListener('change', track);

  return () => el.removeEventListener('change', track);
}

/**
 * Everything about the maps other than which one is shown: the layer and
 * custom-map editors, the offline copies, and the rendering preferences. Its
 * own button beside the map switcher, so switching a map stays one tap.
 */
export function MapManageButton(): ReactElement {
  const m = useMessages();

  const canSaveSettings = useCanSaveSettings();

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedMapsTotalSize = cachedMaps.reduce(
    (sum, cm) => sum + cm.sizeBytes,
    0,
  );

  const brightness = useAppSelector((state) => state.map.brightness);

  const dispatch = useDispatch();

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
        {/* Installed maps, Available maps and New custom map are its tabs and footer. */}
        <OnlineOnlyItem
          offline={!canSaveSettings}
          {...modalMenuItemProps('installed-maps')}
        >
          <FaLayerGroup /> {m?.mapLayers.mapManager}
          <MenuGutter>
            <Chord modal="installed-maps" />
          </MenuGutter>
        </OnlineOnlyItem>

        <Dropdown.Divider />

        <Dropdown.Item {...modalMenuItemProps('offline-maps')}>
          <BiWifiOff /> {m?.mapLayers.offlineMaps}
          {cachedMapsTotalSize > 0 && ` · ${formatSize(cachedMapsTotalSize)}`}
          <MenuGutter>
            <Chord modal="offline-maps" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('browse-cache')}>
          <FaDatabase /> {m?.mapLayers.browseCache}
          <MenuGutter>
            <Chord modal="browse-cache" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item {...modalMenuItemProps('map-preferences')}>
          <FaSlidersH /> {m?.mapLayers.preferences}
          <MenuGutter>
            <Chord modal="map-preferences" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('elevation-settings')}>
          <FaChartArea /> {m?.elevationChart.settings}
          <MenuGutter>
            <Chord modal="elevation-settings" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Divider />

        {/* Centred, as the map comes; darker to the left, lighter to the right. */}
        <Dropdown.ItemText className="d-flex align-items-center gap-2">
          <MdBrightness6 className="flex-shrink-0" />

          <span className="text-nowrap">{m?.mapLayers.brightness}</span>

          <Form.Range
            min={-BRIGHTNESS_STEPS}
            max={BRIGHTNESS_STEPS}
            step={1}
            value={brightness}
            style={{ minWidth: '6rem' }}
            onChange={(e) => {
              const step = Number(e.currentTarget.value);

              dispatch(mapSetLocalPrefs({ brightness: step }));
            }}
            ref={trackOnCommit}
          />
        </Dropdown.ItemText>
      </FmDropdownMenu>
    </Dropdown>
  );
}
