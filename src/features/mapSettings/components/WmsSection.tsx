import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapLayerSetupChange,
  type SetupTarget,
} from '@features/map/model/actions.js';
import type { WmsLayerDef } from '@features/mapLibrary/model/selectors.js';
import { type Layer, wms } from '@shared/wms.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTargetSetup } from '../layerTarget.js';
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

type Props = { def: WmsLayerDef; target: SetupTarget };

/** Ticks the layers a WMS map on the map draws, in its setup. */
export function WmsSection({ def, target }: Props): ReactElement {
  const m = useMessages();

  const own = useTargetSetup(target)?.wmsLayers;

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

  const setLayers = (wmsLayers: string[]) =>
    dispatch(mapLayerSetupChange({ ...target, setup: { wmsLayers } }));

  return shown?.error ? (
    <div className="text-danger text-break">{shown.error}</div>
  ) : shown?.layers ? (
    <WmsLayerTree
      layers={shown.layers}
      selected={own ?? def.layers}
      onChange={setLayers}
    />
  ) : (
    <div className="text-center">
      <Spinner size="sm" /> {m?.general.loading}
    </div>
  );
}
