import { useMessages } from '@features/l10n/l10nInjector.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaDatabase } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type MapDetailsSource,
  mapDetailsExcludeSources,
} from '../model/actions.js';
import { useMapDetailsMessages } from '../translations/useMapDetailsMessages.js';

export function MapDetailsMenu(): ReactElement | null {
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

  const mdm = useMapDetailsMessages();

  const dispatch = useDispatch();

  const sources: {
    key: MapDetailsSource;
    name: ReactNode;
    selected: boolean;
  }[] = [
    ...(
      [
        'nominatim-reverse',
        'overpass-nearby',
        'overpass-surrounding',
      ] as MapDetailsSource[]
    ).map((source) => ({
      key: source,
      name: m?.search.sources[source],
      selected: !excludeSources.has(source),
    })),
    ...activeWmsLayerDefs.map((def) => ({
      key: `wms:${def.type}` as MapDetailsSource,
      name: `${def.custom ? def.name : m?.mapLayers.letters[def.type]} (WMS)`,
      selected: !excludeSources.has(`wms:${def.type}`),
    })),
  ];

  const selectedNames = sources.filter((s) => s.selected).map((s) => s.name);

  return (
    <ToolMenu tool="map-details">
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
        {/* No breakpoint so the tooltip always shows and enumerates the
            selected sources; the "Sources:" prefix collapses on its own. */}
        <LongPressTooltip
          label={
            <>
              {mdm?.sources}:{' '}
              {selectedNames.length
                ? selectedNames.flatMap((n, i) => (i ? [', ', n] : [n]))
                : '—'}
            </>
          }
        >
          {({ props }) => (
            <Dropdown.Toggle variant="secondary" {...props}>
              <FaDatabase />
              <span className="d-none d-sm-inline"> {mdm?.sources}:</span>{' '}
              {selectedNames.length}
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          {sources.map((source) => (
            <Dropdown.Item
              as="button"
              key={source.key}
              eventKey={source.key}
              active={source.selected}
            >
              <Checkbox value={source.selected} /> {source.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </ToolMenu>
  );
}
