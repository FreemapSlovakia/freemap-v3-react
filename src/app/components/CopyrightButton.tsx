import { integratedLayerDefs } from '@/shared/mapDefinitions.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaList, FaLock, FaQuestion, FaRegCopyright } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { documentShow } from '../../features/documents/model/actions.js';
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
      <Dropdown>
        <LongPressTooltip
          label={(m?.mainMenu.mapLegend ?? '…') + ', Privacy policy'}
        >
          {({ props }) => (
            <Dropdown.Toggle
              bsPrefix="fm-dropdown-toggle-nocaret"
              id="dropdown-basic"
              variant="secondary"
              {...props}
            >
              <FaQuestion />
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>

        <Dropdown.Menu style={{ width: 'max-content' }}>
          <Dropdown.Item
            key="attribution"
            as="button"
            onClick={() => showAttribution()}
          >
            <FaRegCopyright /> {m?.main.copyright}
          </Dropdown.Item>

          {showLegendButton && (
            <Dropdown.Item
              key="legend"
              href="#show=legend"
              onClick={(e) => {
                e.preventDefault();

                dispatch(setActiveModal('legend'));
              }}
            >
              <FaList /> {m?.mainMenu.mapLegend} <kbd>g</kbd> <kbd>d</kbd>
            </Dropdown.Item>
          )}

          <Dropdown.Item
            key="privacyPolicy"
            href="#document=privacyPolicy"
            onClick={(e) => {
              e.preventDefault();

              dispatch(documentShow('privacyPolicy'));
            }}
          >
            <FaLock /> {m?.general.privacyPolicy}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Toolbar>
  );
}
