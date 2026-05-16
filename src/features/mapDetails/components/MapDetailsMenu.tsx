import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button, Menu } from '@mantine/core';
import { Checkbox } from '@shared/components/Checkbox.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import type { ReactElement } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  MapDetailsSource,
  mapDetailsExcludeSources,
} from '../model/actions.js';

export function MapDetailsMenu(): ReactElement | null {
  // TODO what is this?
  const canDelete = useAppSelector((state) =>
    Boolean(state.trackViewer.trackGeojson),
  );

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const layers = useAppSelector((state) => state.map.layers);

  const excludeSources = new Set(
    useAppSelector((state) => state.mapDetails.excludeSources),
  );

  const activeWmsLayerDefs = [
    ...integratedLayerDefs.map((def) => ({ ...def, custom: false as const })),
    ...customLayerDefs.map((def) => ({ ...def, custom: true as const })),
  ].filter((def) => def.technology === 'wms' && layers.includes(def.type));

  const m = useMessages();

  const dispatch = useDispatch();

  const toggleSource = (source: MapDetailsSource) => {
    dispatch(
      mapDetailsExcludeSources(
        excludeSources.has(source)
          ? [...excludeSources].filter((s) => s !== source)
          : [...excludeSources, source],
      ),
    );
  };

  return (
    <ToolMenu>
      <Menu closeOnItemClick={false}>
        <Menu.Target>
          <Button
            className="ms-1"
            color="gray"
            size="sm"
            rightSection={<FaCaretDown />}
          >
            {m?.mapDetails.sources}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {(
            [
              'nominatim-reverse',
              'overpass-nearby',
              'overpass-surrounding',
            ] as MapDetailsSource[]
          ).map((source) => (
            <Menu.Item
              key={source}
              leftSection={<Checkbox value={!excludeSources.has(source)} />}
              onClick={() => toggleSource(source)}
            >
              {m?.search.sources[source]}
            </Menu.Item>
          ))}

          {activeWmsLayerDefs.map((def) => {
            const source = `wms:${def.type}` as MapDetailsSource;

            return (
              <Menu.Item
                key={def.type}
                leftSection={<Checkbox value={!excludeSources.has(source)} />}
                onClick={() => toggleSource(source)}
              >
                {def.custom ? def.name : m?.mapLayers.letters[def.type]} (WMS)
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>

      {canDelete ? <DeleteButton /> : null}
    </ToolMenu>
  );
}
