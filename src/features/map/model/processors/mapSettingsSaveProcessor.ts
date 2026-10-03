import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootAction } from '@app/store/rootAction.js';
import {
  patchAccountSettings,
  queueSettingsSave,
} from '@app/store/settingsSaveQueue.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  mapApplyCombination,
  mapCombinationDelete,
  mapCombinationSave,
  mapCustomLayerDelete,
  mapCustomLayerSave,
  mapLayerSettingsChange,
  mapLayersSettingsReset,
  mapOverlayOrderSet,
  mapSetLayerKind,
  mapSetShadingDraft,
  mapToggleLayer,
} from '../actions.js';
import { accountSettingsOf, isShadingDraftSaved } from '../reducer.js';
import { activeCombinationsSelector } from '../selectors.js';

/** Long enough for an opacity slider's drag to end as one save. */
const DEBOUNCE_MS = 500;

let timer: ReturnType<typeof setTimeout> | undefined;

/** A save is queued and not yet started; it will send whatever comes first. */
let waiting = false;

/** What waits for the save that carries its change: toasts, ending a draft. */
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
  | typeof mapSetLayerKind
  | typeof mapLayersSettingsReset
  | typeof mapOverlayOrderSet
  | typeof mapCustomLayerSave
  | typeof mapCustomLayerDelete
  | typeof mapCombinationSave
  | typeof mapCombinationDelete
> = {
  actionCreator: [
    mapLayerSettingsChange,
    mapSetLayerKind,
    mapLayersSettingsReset,
    mapOverlayOrderSet,
    mapCustomLayerSave,
    mapCustomLayerDelete,
    mapCombinationSave,
    mapCombinationDelete,
  ],
  handle({ action, prevState, getState, dispatch, toastError }) {
    if (mapCombinationSave.match(action)) {
      const { id } = action.payload.combination;

      // An active one is re-applied, so the map shows what was just saved.
      const previous = activeCombinationsSelector(prevState).find(
        (c) => c.id === id,
      );

      if (previous) {
        dispatch(mapApplyCombination({ id, replaces: previous }));
      }

      afterSave.push(() => {
        const state = getState();

        // Deleted meanwhile: nothing to say.
        if (!state.map.mapCombinations.some((c) => c.id === id)) {
          return;
        }

        dispatch(
          savedToast(
            id,
            'combinationSaved',
            activeCombinationsSelector(state).some((c) => c.id === id)
              ? undefined
              : mapApplyCombination({ id }),
          ),
        );
      });
    } else if (mapCustomLayerSave.match(action)) {
      const { def, offerActivate } = action.payload;

      afterSave.push(() => {
        const { map } = getState();

        // Deleted meanwhile: nothing to say.
        if (!map.customLayers.some((d) => d.type === def.type)) {
          return;
        }

        // Kept until saved, so a failed save can be tried again.
        if (isShadingDraftSaved(def, map.shadingDrafts[def.type])) {
          dispatch(mapSetShadingDraft({ type: def.type }));
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

    // Only a drag needs the pause; anything else must not be lost to a reload.
    if (
      mapLayerSettingsChange.match(action) &&
      action.payload.settings.opacity !== undefined
    ) {
      timer = setTimeout(save, DEBOUNCE_MS);
    } else {
      save();
    }
  },
};
