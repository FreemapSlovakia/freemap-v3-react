import type { SetupTarget } from '@features/map/model/actions.js';
import { withKind } from '@features/map/model/layerKind.js';
import type { LayerSetup } from '@features/map/model/layerSetup.js';
import { memberKind } from '@features/map/model/mapPreset.js';
import {
  integratedLayerDefMapSelector,
  nativeKindsSelector,
  presetByIdSelector,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LayerDef } from '@shared/mapDefinitions.js';

/** The setup a target names: a map's own, or a preset's copy. */
export function useTargetSetup(target: SetupTarget): LayerSetup | undefined {
  return useAppSelector((state) =>
    target.preset === undefined
      ? state.map.layerSetups[target.type]
      : presetByIdSelector(state)[target.preset]?.layers.find(
          (layer) => layer.type === target.type,
        )?.setup,
  );
}

/** The map a target names, of the kind it is drawn as there. */
export function useTargetDef(target: SetupTarget): LayerDef | undefined {
  const def = useAppSelector(
    (state): LayerDef | undefined =>
      integratedLayerDefMapSelector(state)[target.type] ??
      resolvedCustomLayersSelector(state).find((d) => d.type === target.type) ??
      state.map.cachedMaps.find((d) => d.type === target.type),
  );

  const setup = useTargetSetup(target);

  const nativeKind = useAppSelector((state) =>
    nativeKindsSelector(state).get(target.type),
  );

  // A library map's def is of the kind its own setup switches it to; a
  // preset's copy goes by the copy's setup.
  if (!def || target.preset === undefined || !nativeKind) {
    return def;
  }

  const kind = memberKind(
    { type: target.type, setup: setup ?? {} },
    new Map([[target.type, nativeKind]]),
  );

  return withKind(
    { ...def, layer: nativeKind },
    {
      [target.type]: kind!,
    },
  ) as LayerDef;
}
