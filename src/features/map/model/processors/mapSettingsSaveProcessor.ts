import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootAction } from '@app/store/rootAction.js';
import {
  patchAccountSettings,
  queueSettingsSave,
} from '@app/store/settingsSaveQueue.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerSettingsChange,
  mapLayerSetupChange,
  mapLayerSetupReset,
  mapLayersSettingsReset,
  mapOverlayMove,
  mapPresetChange,
  mapPresetDelete,
  mapPresetLayerAdd,
  mapPresetLayerRemove,
  mapPresetSave,
  mapRefocus,
  mapReplaceLayer,
  mapSetShadingOnServer,
  mapToggleLayer,
} from '../actions.js';
import { accountSettingsOf } from '../reducer.js';

/** Long enough for a slider's drag to end as one save. */
const DEBOUNCE_MS = 500;

let timer: ReturnType<typeof setTimeout> | undefined;

/** A save is queued and not yet started; it will send whatever comes first. */
let waiting = false;

/** What waits for the save that carries its change: its toast. */
let afterSave: (() => void)[] = [];

// Its own id per map, so one toast doesn't replace another's Activate.
const savedToast = (
  type: string,
  messageKey: string,
  activateAction?: RootAction,
) =>
  toastsAdd({
    id: `settings.saved.${type}`,
    messageKey,
    messageLoader: loadMapSettingsMessages,
    style: 'info',
    timeout: activateAction ? 10_000 : 5000,
    actions: activateAction
      ? [
          {
            name: getMessages()?.mapLayers.activate ?? '',
            action: activateAction,
          },
        ]
      : undefined,
  });

/**
 * Saves the account's map settings after any of these actions has changed the
 * store, queued with every other settings save; each sends the state at its
 * turn, so none needs cancelling and no list is sent from a stale copy.
 */
export const mapSettingsSaveProcessor: Processor<
  | typeof mapLayerSettingsChange
  | typeof mapLayerSetupChange
  | typeof mapLayerSetupReset
  | typeof mapLayersSettingsReset
  | typeof mapCustomLayerSave
  | typeof mapCustomLayerDelete
  | typeof mapPresetSave
  | typeof mapPresetDelete
  | typeof mapPresetChange
  | typeof mapPresetLayerAdd
  | typeof mapPresetLayerRemove
  | typeof mapOverlayMove
  | typeof mapRefocus
  | typeof mapReplaceLayer
  | typeof mapsLoaded
  | typeof mapSetShadingOnServer
> = {
  actionCreator: [
    mapLayerSettingsChange,
    mapLayerSetupChange,
    mapLayerSetupReset,
    mapLayersSettingsReset,
    mapCustomLayerSave,
    mapCustomLayerDelete,
    mapPresetSave,
    mapPresetDelete,
    mapPresetChange,
    mapPresetLayerAdd,
    mapPresetLayerRemove,
    mapOverlayMove,
    mapRefocus,
    mapReplaceLayer,
    mapsLoaded,
    mapSetShadingOnServer,
  ],
  handle({ action, prevState, getState, dispatch, toastError }) {
    // Most of these change the account's settings only sometimes: an edit of
    // a link's preset, a link's or a document's setups, applied drafts.
    const before = accountSettingsOf(prevState.map);

    const after = accountSettingsOf(getState().map);

    if (
      (Object.keys(after) as (keyof typeof after)[]).every(
        (key) => before[key] === after[key],
      )
    ) {
      return;
    }

    if (mapPresetSave.match(action)) {
      const { id } = action.payload.preset;

      afterSave.push(() => {
        // Deleted meanwhile: nothing to say.
        if (getState().map.presets.some((p) => p.id === id)) {
          dispatch(savedToast(id, 'presetSaved'));
        }
      });
    } else if (mapCustomLayerSave.match(action)) {
      const { def, offerActivate } = action.payload;

      afterSave.push(() => {
        const { map } = getState();

        // Deleted meanwhile: nothing to say.
        if (!map.customLayers.some((d) => d.type === def.type)) {
          return;
        }

        dispatch(
          offerActivate
            ? savedToast(
                def.type,
                'customMapSaved',
                map.layers.includes(def.type)
                  ? undefined
                  : mapToggleLayer({ type: def.type, enable: true }),
              )
            : savedToast(def.type, 'saveSuccess'),
        );
      });
    }

    // A save still waiting in the queue sends this change too.
    if (waiting) {
      return;
    }

    clearTimeout(timer);

    const save = () => {
      waiting = true;

      void queueSettingsSave(async () => {
        waiting = false;

        const pending = afterSave;

        afterSave = [];

        try {
          if (getState().auth.user) {
            await patchAccountSettings(getState, {
              settings: accountSettingsOf(getState().map),
            });
          }

          for (const then of pending) {
            then();
          }
        } catch (err) {
          await toastError(
            err,
            loadMapSettingsMessages,
            'savingError',
            'settings.savingError',
          );
        }
      });
    };

    // A setup is changed by drags (opacity, shading); anything else must not
    // be lost to a reload.
    if (mapLayerSetupChange.match(action) || mapPresetChange.match(action)) {
      timer = setTimeout(save, DEBOUNCE_MS);
    } else {
      save();
    }
  },
};
