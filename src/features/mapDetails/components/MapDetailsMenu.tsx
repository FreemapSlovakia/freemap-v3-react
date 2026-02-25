import { useMessages } from '@features/l10n/l10nInjector.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { type ReactElement, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
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

  const [sourcesOpen, setSourcesOpen] = useState(false);

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

  return (
    <ToolMenu>
      <Dropdown
        className="ms-1"
        onSelect={(selection, e) => {
          e.preventDefault();
          dispatch(
            mapDetailsExcludeSources(
              excludeSources.has(selection as 'wms:')
                ? [...excludeSources].filter((source) => source !== selection)
                : [...excludeSources, selection as 'wms:'],
            ),
          );
        }}
        show={Boolean(sourcesOpen)}
        autoClose="outside"
        onToggle={(open) => setSourcesOpen(open)}
      >
        <Dropdown.Toggle variant="secondary">
          {m?.mapDetails.sources}
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          {(
            [
              'nominatim-reverse',
              'overpass-nearby',
              'overpass-surrounding',
            ] as MapDetailsSource[]
          ).map((source) => (
            <Dropdown.Item
              as="button"
              key={source}
              eventKey={source}
              active={!excludeSources.has(source as MapDetailsSource)}
            >
              <Checkbox
                value={!excludeSources.has(source as MapDetailsSource)}
              />{' '}
              {m?.search.sources[source]}
            </Dropdown.Item>
          ))}

          {activeWmsLayerDefs.map((def) => (
            <Dropdown.Item
              as="button"
              key={def.type}
              eventKey={`wms:${def.type}`}
              active={!excludeSources.has(`wms:${def.type}`)}
            >
              <Checkbox value={!excludeSources.has(`wms:${def.type}`)} />{' '}
              {def.custom ? def.name : m?.mapLayers.letters[def.type]} (WMS)
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {canDelete ? <DeleteButton /> : null}
    </ToolMenu>
  );
}
