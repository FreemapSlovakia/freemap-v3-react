import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
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
          style: 'danger',
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

        <LongPressTooltip breakpoint="sm" label={m?.general.save}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="primary"
              onClick={handleSave}
              disabled={!selectingHomeLocation || saving}
              {...props}
            >
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="dark"
              onClick={() => dispatch(setSelectingHomeLocation(false))}
              {...props}
            >
              <FaTimes />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}
