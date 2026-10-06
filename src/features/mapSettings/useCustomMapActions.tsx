import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapCustomLayerDelete,
  mapPresetDelete,
} from '@features/map/model/actions.js';
import type { MapPreset } from '@features/map/model/mapPreset.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerLabel } from '@shared/layerName.js';
import {
  isNamedMapDef,
  type StoredCustomLayerDef,
} from '@shared/mapDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useDispatch } from 'react-redux';
import { useMapSettingsMessages } from './translations/useMapSettingsMessages.js';

/** Deleting the user's own maps and presets, from a list of them. */
export function useCustomMapActions() {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const msm = useMapSettingsMessages();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const confirmDelete = (name: string, alsoNamed: string[] = []) =>
    confirm({
      title: mm?.deleteTitle,
      message: (
        <>
          {mm?.deleteConfirm(name)}
          {alsoNamed.length > 0 && (
            <p className="mt-2 mb-0">
              {msm?.deleteAlsoNamed(alsoNamed.join(', '))}
            </p>
          )}
        </>
      ),
      confirmLabel: m?.general.delete,
      confirmStyle: 'danger',
    });

  const deleteCustomMap = async (def: StoredCustomLayerDef) => {
    // The reducer deletes them with it.
    const alsoNamed = customLayers
      .filter((named) => isNamedMapDef(named) && named.source === def.type)
      .map((named) => layerLabel(named, m));

    if (!(await confirmDelete(layerLabel(def, m), alsoNamed))) {
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
