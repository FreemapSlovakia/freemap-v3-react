import { useMessages } from '@features/l10n/l10nInjector.js';
import { BRIGHTNESS_STEPS } from '@features/map/brightness.js';
import { areFeaturesHidden } from '@features/map/featuresOpacity.js';
import {
  mapSetFeaturesOpacity,
  mapSetLocalPrefs,
} from '@features/map/model/actions.js';
import { anyFeatureDrawn } from '@features/mapSettings/mapFeatureCounts.js';
import { Chord } from '@shared/components/Chord.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
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
  FaEyeSlash,
  FaLayerGroup,
  FaSlidersH,
} from 'react-icons/fa';
import { MdBrightness6, MdOpacity } from 'react-icons/md';
import { useDispatch } from 'react-redux';

/**
 * The native `change`, which React's `onChange` isn't: it fires once a drag or
 * a key press has moved the slider, wherever the pointer is let go. Each ref is
 * made at module level, so it stays one function and doesn't re-attach.
 */
const trackOnCommit = (action: string) => (el: HTMLInputElement | null) => {
  if (!el) {
    return;
  }

  const track = () =>
    trackMatomo(['trackEvent', 'MapSettings', action, Number(el.value)]);

  el.addEventListener('change', track);

  return () => el.removeEventListener('change', track);
};

const trackBrightness = trackOnCommit('brightness');

const trackFeaturesOpacity = trackOnCommit('featuresOpacity');

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

  const featuresOpacity = useAppSelector((state) => state.map.featuresOpacity);

  // Not on an empty map: the warning would be about nothing.
  const featuresHidden = useAppSelector(
    (state) =>
      areFeaturesHidden(state.map.featuresOpacity) && anyFeatureDrawn(state),
  );

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

            {featuresHidden && (
              <GlyphMarker hint={m?.mapLayers.interactiveLayerWarning}>
                <FaEyeSlash />
              </GlyphMarker>
            )}
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        {/* Installed maps, Available maps and New custom map are its tabs and footer. */}
        <OnlineOnlyItem
          offline={!canSaveSettings}
          {...modalMenuItemProps('installed-maps')}
        >
          <FaLayerGroup />
          <MenuLabel>{m?.mapLayers.mapManager}</MenuLabel>
          <MenuGutter>
            <Chord modal="installed-maps" />
          </MenuGutter>
        </OnlineOnlyItem>

        <Dropdown.Divider />

        <Dropdown.Item {...modalMenuItemProps('offline-maps')}>
          <BiWifiOff />
          <MenuLabel>{m?.mapLayers.offlineMaps}</MenuLabel>
          {cachedMapsTotalSize > 0 && (
            <span>· {formatSize(cachedMapsTotalSize)}</span>
          )}
          <MenuGutter>
            <Chord modal="offline-maps" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('browse-cache')}>
          <FaDatabase />
          <MenuLabel>{m?.mapLayers.browseCache}</MenuLabel>
          <MenuGutter>
            <Chord modal="browse-cache" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item {...modalMenuItemProps('map-preferences')}>
          <FaSlidersH />
          <MenuLabel>{m?.mapLayers.preferences}</MenuLabel>
          <MenuGutter>
            <Chord modal="map-preferences" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Item {...modalMenuItemProps('elevation-settings')}>
          <FaChartArea />
          <MenuLabel>{m?.elevationChart.settings}</MenuLabel>
          <MenuGutter>
            <Chord modal="elevation-settings" />
          </MenuGutter>
        </Dropdown.Item>

        <Dropdown.Divider />

        {/* A grid, so both sliders start at one column. */}
        <Dropdown.ItemText
          className="d-grid align-items-center column-gap-2 row-gap-2"
          style={{
            gridTemplateColumns: 'auto minmax(0, auto) minmax(6rem, 1fr)',
          }}
        >
          <MdBrightness6 />

          <span className="text-truncate">{m?.mapLayers.brightness}</span>

          {/* Centred, as the map comes; darker to the left, lighter to the right. */}
          <Form.Range
            min={-BRIGHTNESS_STEPS}
            max={BRIGHTNESS_STEPS}
            step={1}
            value={brightness}
            onChange={(e) => {
              const step = Number(e.currentTarget.value);

              dispatch(mapSetLocalPrefs({ brightness: step }));
            }}
            ref={trackBrightness}
          />

          <MdOpacity />

          <span className="text-truncate">{m?.mapLayers.featuresOpacity}</span>

          <Form.Range
            min={0}
            max={1}
            step={0.05}
            value={featuresOpacity}
            onChange={(e) =>
              dispatch(mapSetFeaturesOpacity(Number(e.currentTarget.value)))
            }
            ref={trackFeaturesOpacity}
          />
        </Dropdown.ItemText>
      </FmDropdownMenu>
    </Dropdown>
  );
}
