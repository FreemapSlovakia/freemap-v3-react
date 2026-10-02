import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCombinationDelete,
  mapCombinationSave,
  mapCustomLayerDelete,
  mapRefocus,
} from '@features/map/model/actions.js';
import {
  isWorthSaving,
  type MapCombination,
  withoutCombinations,
} from '@features/map/model/mapCombination.js';
import {
  activeCombinationsSelector,
  captureCombination,
} from '@features/map/model/selectors.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { layerLabel } from '@shared/layerName.js';
import type { CustomLayerDef } from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useDispatch, useStore } from 'react-redux';

/** Deleting the user's own maps and refreshing a combination, from a list of them. */
export function useCustomMapActions() {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const store = useStore<RootState>();

  const confirmDelete = (name: string) =>
    confirm({
      title: mm?.deleteTitle,
      message: mm?.deleteConfirm(name),
      confirmLabel: m?.general.delete,
      confirmStyle: 'danger',
    });

  const deleteCustomMap = async (def: CustomLayerDef) => {
    if (!(await confirmDelete(layerLabel(def, m)))) {
      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'customMap']);

    dispatch(mapCustomLayerDelete({ type: def.type }));
  };

  const deleteCombination = async (combination: MapCombination) => {
    if (!(await confirmDelete(combination.name))) {
      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'combination']);

    const state = store.getState();

    const active = activeCombinationsSelector(state);

    const shown = active.find((c) => c.id === combination.id);

    // Its layers go with it, as unticking it would take them off.
    if (shown) {
      dispatch(
        mapRefocus({
          layers: withoutCombinations(state.map.layers, [shown], active),
        }),
      );
    }

    dispatch(mapCombinationDelete({ id: combination.id }));
  };

  const updateCombinationFromMap = (combination: MapCombination) => {
    const state = store.getState();

    const updated = {
      ...combination,
      ...captureCombination(state, combination.base !== undefined),
    };

    // Too little on the map to save as is: the form says why.
    if (!isWorthSaving(updated)) {
      dispatch(
        setActiveModal({
          type: 'installed-maps',
          customMap: { edit: combination.id, draft: updated },
        }),
      );

      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'update', 'combination']);

    dispatch(mapCombinationSave({ combination: updated }));
  };

  return { deleteCustomMap, deleteCombination, updateCombinationFromMap };
}
