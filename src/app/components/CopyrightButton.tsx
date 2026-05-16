import { documentShow } from '@features/documents/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Kbd, Menu } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { type ReactElement, useMemo } from 'react';
import { FaList, FaLock, FaQuestion, FaRegCopyright } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../store/actions.js';
import { useAttributionInfo } from './useAttributionInfo.js';

export function CopyrightButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const skCs = useAppSelector((state) =>
    ['sk', 'cs'].includes(state.l10n.language),
  );

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const layers = useAppSelector((state) => state.map.layers);

  const legendLayers = useMemo(
    () =>
      new Set([
        ...(skCs ? ['A', 'T', 'C', 'K'] : []),
        'X',
        'O',
        ...[...integratedLayerDefs, ...customLayers]
          .filter((def) => def.technology === 'wms')
          .map((def) => def.type),
      ]),

    [customLayers, skCs],
  );

  const showLegendButton = layers.some((type) => legendLayers.has(type));

  const showAttribution = useAttributionInfo();

  return (
    <Toolbar className="me-2 mb-2">
      <Menu>
        <Menu.Target>
          <MantineLongPressTooltip
            label={(m?.mainMenu.mapLegend ?? '…') + ', Privacy policy'}
          >
            {({ props }) => (
              <ActionIcon
                variant="filled"
                color="gray"
                size="input-sm"
                {...props}
              >
                <FaQuestion />
              </ActionIcon>
            )}
          </MantineLongPressTooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<FaRegCopyright />}
            onClick={() => showAttribution()}
          >
            {m?.main.copyright}
          </Menu.Item>

          {showLegendButton && (
            <Menu.Item
              component="a"
              href="#show=legend"
              leftSection={<FaList />}
              rightSection={
                <>
                  <Kbd>m</Kbd> <Kbd>l</Kbd>
                </>
              }
              onClick={(e) => {
                e.preventDefault();
                dispatch(setActiveModal('legend'));
              }}
            >
              {m?.mainMenu.mapLegend}
            </Menu.Item>
          )}

          <Menu.Item
            component="a"
            href="#document=privacyPolicy"
            leftSection={<FaLock />}
            onClick={(e) => {
              e.preventDefault();
              dispatch(documentShow('privacyPolicy'));
            }}
          >
            {m?.general.privacyPolicy}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Toolbar>
  );
}
