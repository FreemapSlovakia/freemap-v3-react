import { Text } from '@features/l10n/Text.js';
import {
  mapLayerSetupChange,
  type SetupTarget,
} from '@features/map/model/actions.js';
import type { WmsLayerDef } from '@features/mapLibrary/model/selectors.js';
import { useWmsLayers } from '@shared/hooks/useWmsLayers.js';
import type { ReactElement } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTargetSetup } from '../layerTarget.js';
import { WmsLayerTree } from './WmsLayerTree.js';

type Props = { def: WmsLayerDef; target: SetupTarget };

/** Ticks the layers a WMS map on the map draws, in its setup. */
export function WmsSection({ def, target }: Props): ReactElement {
  const own = useTargetSetup(target)?.wmsLayers;

  const shown = useWmsLayers(def);

  const dispatch = useDispatch();

  const setLayers = (wmsLayers: string[]) =>
    dispatch(mapLayerSetupChange({ ...target, setup: { wmsLayers } }));

  return shown.error ? (
    <div className="text-danger text-break">{shown.error}</div>
  ) : shown.layers ? (
    <WmsLayerTree
      layers={shown.layers}
      selected={own ?? def.layers}
      onChange={setLayers}
    />
  ) : (
    <div className="text-center">
      <Spinner size="sm" /> <Text k="general.loading" />
    </div>
  );
}
