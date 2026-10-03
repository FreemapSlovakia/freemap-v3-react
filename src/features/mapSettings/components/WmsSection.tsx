import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapLayerSettingsChange } from '@features/map/model/actions.js';
import type { WmsLayerDef } from '@features/mapLibrary/model/selectors.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerName } from '@shared/layerName.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { type Layer, wms } from '@shared/wms.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaUndo } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
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

type Props = { def: WmsLayerDef };

/** Picks the layers of a WMS map on the map. */
export function WmsSection({ def }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const own = useAppSelector(
    (state) => state.map.layersSettings[def.type]?.wmsLayers,
  );

  const custom = useAppSelector((state) =>
    state.map.customLayers.find((c) => c.type === def.type),
  );

  const [tree, setTree] = useState<{
    url: string;
    layers?: Layer[];
    error?: string;
  }>();

  const { url } = def;

  useEffect(() => {
    let current = true;

    layersOf(url).then(
      (layers) => current && setTree({ url, layers }),
      (err) => current && setTree({ url, error: String(err) }),
    );

    return () => {
      current = false;
    };
  }, [url]);

  const dispatch = useDispatch();

  const shown = tree?.url === url ? tree : undefined;

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
          addCopyOf: copyOf(def, custom, layerName(def, m), selected),
        },
      }),
    );

  return (
    <>
      {shown?.error ? (
        <div className="text-danger text-break">{shown.error}</div>
      ) : shown?.layers ? (
        <WmsLayerTree
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
    </>
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
