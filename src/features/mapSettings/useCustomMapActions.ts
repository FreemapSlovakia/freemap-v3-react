import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCustomLayerDelete,
  mapPresetDelete,
} from '@features/map/model/actions.js';
import type { MapPreset } from '@features/map/model/mapPreset.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { layerLabel } from '@shared/layerName.js';
import type { StoredCustomLayerDef } from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useDispatch } from 'react-redux';

/** Deleting the user's own maps and presets, from a list of them. */
export function useCustomMapActions() {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const confirmDelete = (name: string) =>
    confirm({
      title: mm?.deleteTitle,
      message: mm?.deleteConfirm(name),
      confirmLabel: m?.general.delete,
      confirmStyle: 'danger',
    });

  const deleteCustomMap = async (def: StoredCustomLayerDef) => {
    if (!(await confirmDelete(layerLabel(def, m)))) {
      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'customMap']);

    dispatch(mapCustomLayerDelete({ type: def.type }));
  };

  const deletePreset = async (preset: MapPreset) => {
    if (!(await confirmDelete(preset.name))) {
      return;
    }

    trackMatomo(['trackEvent', 'MapSettings', 'delete', 'preset']);

    dispatch(mapPresetDelete({ id: preset.id }));
  };

  return { deleteCustomMap, deletePreset };
}
