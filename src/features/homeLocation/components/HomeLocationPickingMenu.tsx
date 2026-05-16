import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export default HomeLocationPickingMenu;

export function HomeLocationPickingMenu(): ReactElement | null {
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
      const res = await fetch(process.env['API_URL'] + '/auth/settings', {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          ...(authToken ? { authorization: 'Bearer ' + authToken } : {}),
        },
        body: JSON.stringify(selectingHomeLocation),
      });

      if (!res.ok) {
        throw new Error();
      }

      dispatch(saveHomeLocation(selectingHomeLocation));
    } catch (error) {
      dispatch(
        toastsAdd({
          id: 'homeLocation.savingError',
          messageKey: 'settings.savingError',
          messageParams: { err: error },
          color: 'red',
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [authToken, dispatch, selectingHomeLocation]);

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="m-1">Zvoľte domovskú pozíciu</div>

        <MantineLongPressTooltip breakpoint="sm" label={m?.general.save}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                size="input-sm"
                onClick={handleSave}
                disabled={!selectingHomeLocation || saving}
                {...props}
              >
                <FaCheck />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                size="sm"
                leftSection={<FaCheck />}
                onClick={handleSave}
                disabled={!selectingHomeLocation || saving}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>

        <MantineLongPressTooltip breakpoint="sm" label={m?.general.cancel}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="dark"
                size="input-sm"
                onClick={() => dispatch(setSelectingHomeLocation(false))}
                {...props}
              >
                <FaTimes />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="dark"
                size="sm"
                leftSection={<FaTimes />}
                onClick={() => dispatch(setSelectingHomeLocation(false))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      </Toolbar>
    </div>
  );
}
