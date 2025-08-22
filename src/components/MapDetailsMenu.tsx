import { useState, type ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { mapDetailsSetSources } from '../actions/mapDetailsActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { integratedLayerDefs } from '../mapDefinitions.js';
import { Checkbox } from './Checkbox.js';
import { DeleteButton } from './DeleteButton.js';
import { ToolMenu } from './ToolMenu.js';

export function MapDetailsMenu(): ReactElement | null {
  const canDelete = useAppSelector((state) => !!state.trackViewer.trackGeojson);

  const [sourcesOpen, setSourcesOpen] = useState(false);

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const layers = useAppSelector((state) => state.map.layers);

  const sources = new Set(useAppSelector((state) => state.mapDetails.sources));

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
            mapDetailsSetSources(
              sources.has(selection as 'wms:')
                ? [...sources].filter((source) => source !== selection)
                : [...sources, selection as 'wms:'],
            ),
          );
        }}
        show={!!sourcesOpen}
        autoClose="outside"
        onToggle={(open) => setSourcesOpen(open)}
      >
        <Dropdown.Toggle variant="secondary">Sources</Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <Dropdown.Item
            as="button"
            eventKey="reverse"
            active={sources.has('reverse')}
          >
            <Checkbox value={sources.has('reverse')} /> Reverse geocoding
          </Dropdown.Item>

          <Dropdown.Item
            as="button"
            eventKey="nearby"
            active={sources.has('nearby')}
          >
            <Checkbox value={sources.has('nearby')} /> Nearby objects
          </Dropdown.Item>

          <Dropdown.Item
            as="button"
            eventKey="surrounding"
            active={sources.has('surrounding')}
          >
            <Checkbox value={sources.has('surrounding')} /> Surrounding objects
          </Dropdown.Item>

          {activeWmsLayerDefs.map((def) => (
            <Dropdown.Item
              as="button"
              key={def.type}
              eventKey={`wms:${def.type}`}
              active={sources.has(`wms:${def.type}`)}
            >
              <Checkbox value={sources.has(`wms:${def.type}`)} />{' '}
              {def.custom ? def.name : m?.mapLayers.letters[def.type]} (WMS)
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {canDelete ? <DeleteButton /> : null}
    </ToolMenu>
  );
}
