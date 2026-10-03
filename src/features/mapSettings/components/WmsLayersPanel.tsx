import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import {
  activeWmsMapsSelector,
  type WmsLayerDef,
} from '@features/mapLibrary/model/selectors.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MapLayerItem } from '@shared/components/MapLayerItem.js';
import { SelectToggle } from '@shared/components/SelectToggle.js';
import { sameMinWidthPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFillToBottom } from '@shared/hooks/useFillToBottom.js';
import { useMapPanelCollapsed } from '@shared/hooks/useMapPanelCollapsed.js';
import { layerName } from '@shared/layerName.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { type Layer, wms } from '@shared/wms.js';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Button, Card, Dropdown, Spinner } from 'react-bootstrap';
import { FaAngleDown, FaAngleUp, FaLayerGroup, FaUndo } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { LayerKindSwitch } from './LayerKindSwitch.js';
import { LayerOpacitySlider } from './LayerOpacitySlider.js';
import classes from './WmsLayersPanel.module.css';
import { WmsLayerTree } from './WmsLayerTree.js';

// Per service, for as long as the page lives; a failed one is asked again.
const capabilities = new Map<string, Promise<Layer[]>>();

function layersOf(url: string): Promise<Layer[]> {
  let p = capabilities.get(url);

  if (!p) {
    p = wms(url).then(({ layersTree }) => layersTree);

    p.catch(() => capabilities.delete(url));

    capabilities.set(url, p);
  }

  return p;
}

/** Picks the layers of a WMS map on the map; shown while there is one. */
export default function WmsLayersPanel() {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const maps = useAppSelector(activeWmsMapsSelector);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const [pickedType, setPickedType] = useState<string>();

  const def = maps.find((def) => def.type === pickedType) ?? maps[0];

  const [collapsed, setCollapsed] = useMapPanelCollapsed('wmsLayers');

  const [panel, setPanel] = useState<HTMLDivElement | null>(null);

  useFillToBottom(panel, classes.tree);

  const [tree, setTree] = useState<{
    url: string;
    layers?: Layer[];
    error?: string;
  }>();

  const url = def?.url;

  useEffect(() => {
    if (!url || collapsed) {
      return;
    }

    let current = true;

    layersOf(url).then(
      (layers) => current && setTree({ url, layers }),
      (err) => current && setTree({ url, error: String(err) }),
    );

    return () => {
      current = false;
    };
  }, [url, collapsed]);

  const dispatch = useDispatch();

  if (!def) {
    return null;
  }

  const shown = tree?.url === def.url ? tree : undefined;

  const own = layersSettings[def.type]?.wmsLayers;

  const selected = own ?? def.layers;

  const setLayers = (wmsLayers: string[] | undefined) =>
    dispatch(
      mapLayerSettingsChange({ type: def.type, settings: { wmsLayers } }),
    );

  const saveAsCustomMap = () =>
    dispatch(
      setActiveModal({
        type: 'installed-maps',
        customMap: {
          addCopyOf: copyOf(
            def,
            customLayers.find((c) => c.type === def.type),
            layerName(def, m),
            selected,
          ),
        },
      }),
    );

  return (
    <Card
      body
      className={clsx(
        classes.panel,
        'fm-frosted',
        collapsed && classes.collapsed,
        'mt-2 ms-2',
      )}
    >
      {/* Header and buttons stay put; only the tree scrolls. */}
      <div ref={setPanel} className="d-flex flex-column">
        <div className="d-flex align-items-center gap-2 p-1 ps-2">
          <FaLayerGroup className="flex-shrink-0" />

          <span className="flex-grow-1 text-truncate">
            {msm?.wmsLayers.title}
          </span>

          <LongPressTooltip
            label={collapsed ? m?.general.expand : m?.general.collapse}
          >
            {({ props }) => (
              <Button
                variant="dark"
                className="flex-shrink-0"
                onClick={() => setCollapsed((collapsed) => !collapsed)}
                {...props}
              >
                {collapsed ? <FaAngleDown /> : <FaAngleUp />}
              </Button>
            )}
          </LongPressTooltip>
        </div>

        {!collapsed && (
          <div className={clsx(classes.body, 'px-2 pb-2')}>
            {maps.length > 1 && (
              <Dropdown
                className="mb-2"
                onSelect={(key) => key !== null && setPickedType(key)}
              >
                <Dropdown.Toggle as={SelectToggle} className="w-100">
                  <span className="d-block text-truncate">
                    {layerName(def, m)}
                  </span>
                </Dropdown.Toggle>

                <FmDropdownMenu
                  popperConfig={sameMinWidthPopperConfig}
                  style={{ width: 'max-content' }}
                >
                  {maps.map((map) => (
                    <Dropdown.Item
                      className="text-nowrap"
                      as="button"
                      type="button"
                      key={map.type}
                      eventKey={map.type}
                      active={map === def}
                    >
                      <MapLayerItem def={map} />
                    </Dropdown.Item>
                  ))}
                </FmDropdownMenu>
              </Dropdown>
            )}

            {/* A custom map's kind is its form's. */}
            {!customLayers.some((c) => c.type === def.type) && (
              <LayerKindSwitch type={def.type} className="mb-2 d-flex" />
            )}

            <LayerOpacitySlider type={def.type} className="mb-2" />

            {shown?.error ? (
              <div className="text-danger text-break">{shown.error}</div>
            ) : shown?.layers ? (
              <WmsLayerTree
                key={def.type}
                className={classes.tree}
                layers={shown.layers}
                selected={selected}
                onChange={setLayers}
              />
            ) : (
              <div className="text-center">
                <Spinner size="sm" /> {m?.general.loading}
              </div>
            )}

            <div className="d-flex gap-1 mt-2">
              <LongPressTooltip label={msm?.wmsLayers.reset}>
                {({ props }) => (
                  <Button
                    variant="secondary"
                    disabled={own === undefined}
                    onClick={() => setLayers(undefined)}
                    {...props}
                  >
                    <FaUndo />
                  </Button>
                )}
              </LongPressTooltip>

              {!window.fmEmbedded && (
                <Button
                  variant="secondary"
                  className="ms-auto text-truncate"
                  disabled={selected.length === 0}
                  onClick={saveAsCustomMap}
                >
                  <MdDashboardCustomize /> {msm?.wmsLayers.saveAsCustomMap}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * A new custom map drawing these layers of `def`'s service: a copy of a custom
 * map, or one linked to a library map.
 */
function copyOf(
  def: WmsLayerDef,
  custom: CustomLayerDef | undefined,
  name: string | undefined,
  layers: string[],
): CustomLayerDef {
  if (custom) {
    return { ...custom, layers } as CustomLayerDef;
  }

  // The source's settings are kept too, for while it is not loaded.
  const common = {
    type: '',
    name,
    category: def.category,
    technology: 'wms' as const,
    source: def.type,
    url: def.url,
    layers,
    tiled: def.tiled,
    minZoom: def.minZoom,
    maxNativeZoom: def.maxNativeZoom,
    bbox: def.bbox,
    zIndex: def.zIndex,
  };

  return def.layer === 'base'
    ? { ...common, layer: 'base' }
    : { ...common, layer: 'overlay' };
}
