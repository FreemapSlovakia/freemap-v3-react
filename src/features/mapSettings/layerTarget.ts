import type { SetupTarget } from '@features/map/model/actions.js';
import { withMemberKind } from '@features/map/model/layerKind.js';
import { copySetup, type LayerSetup } from '@features/map/model/layerSetup.js';
import {
  mapByIdSelector,
  nativeKindsSelector,
  presetByIdSelector,
} from '@features/mapLibrary/model/selectors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LayerDef } from '@shared/mapDefinitions.js';

/** The setup a target is drawn with: a map's own, or a preset's copy with the map's shading and layers. */
export function useTargetSetup(target: SetupTarget): LayerSetup | undefined {
  const own = useAppSelector((state) => state.map.layerSetups[target.type]);

  // Selected apart and merged here, so the selection keeps its identity.
  const copy = useAppSelector((state) =>
    target.preset === undefined
      ? undefined
      : presetByIdSelector(state)[target.preset]?.layers.find(
          (layer) => layer.type === target.type,
        )?.setup,
  );

  if (target.preset === undefined) {
    return own;
  }

  return copy && copySetup(own, copy);
}

/** The map a target names, of the kind it is drawn as there. */
export function useTargetDef(target: SetupTarget): LayerDef | undefined {
  const def = useAppSelector(
    (state): LayerDef | undefined => mapByIdSelector(state)[target.type]?.def,
  );

  const setup = useTargetSetup(target);

  const nativeKind = useAppSelector((state) =>
    nativeKindsSelector(state).get(target.type),
  );

  // A library map's def is of the kind its own setup switches it to; a
  // preset's copy goes by the copy's setup.
  return def && target.preset !== undefined
    ? withMemberKind(def, setup?.kind ?? nativeKind, nativeKind)
    : def;
}
