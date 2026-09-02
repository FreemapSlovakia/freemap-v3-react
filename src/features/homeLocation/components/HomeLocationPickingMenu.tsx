import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function HomeLocationPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const selectingHomeLocation = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation,
  );

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  const m = useMessages();

  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!selectingHomeLocation) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${process.env['API_URL']}/auth/settings`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(selectingHomeLocation),
      });

      if (!res.ok) {
        throw new Error();
      }

      trackMatomo(['trackEvent', 'HomeLocation', 'save']);

      dispatch(saveHomeLocation(selectingHomeLocation));
    } catch (error) {
      dispatch(
        toastsAdd({
          id: 'homeLocation.savingError',
          messageKey: 'savingError',
          messageLoader: loadMapSettingsMessages,
          messageParams: { err: error },
          style: 'danger',
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [authToken, dispatch, selectingHomeLocation]);

  return (
    <PickingMenu
      prompt={m?.main.pickHomeLocationPrompt}
      onConfirm={handleSave}
      confirmLabel={m?.general.save}
      confirmDisabled={!selectingHomeLocation || saving}
      onCancel={() => dispatch(setSelectingHomeLocation(false))}
      cancelKbd="Esc"
    />
  );
}
