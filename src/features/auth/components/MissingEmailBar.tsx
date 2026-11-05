import {
  patchAccountSettings,
  queueSettingsSave,
} from '@app/store/settingsSaveQueue.js';
import type { RootState } from '@app/store/store.js';
import { Text } from '@features/l10n/Text.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useStore } from 'react-redux';
import { authSetUser } from '../model/actions.js';
import { useAuthMessages } from '../translations/useAuthMessages.js';
import { AccountEmailLink } from './AccountEmailLink.js';

type Props = {
  /** Closes the strip, as its close button does. */
  onClose: () => void;
};

/** The page-top strip's text for an account with no address. */
export function MissingEmailBar({ onClose }: Props): ReactElement {
  const am = useAuthMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const dontRemind = async () => {
    onClose();

    trackMatomo(['trackEvent', 'Auth', 'emailReminderOff']);

    // Queued with the other settings saves; not saveSettings, which would
    // toast about map settings.
    try {
      await queueSettingsSave(() =>
        patchAccountSettings(store.getState, { emailReminderOff: true }),
      );
    } catch (err) {
      dispatch(
        toastsAdd({
          messageKey: 'savingError',
          messageParams: { err },
          messageLoader: loadMapSettingsMessages,
          style: 'danger',
        }),
      );

      return;
    }

    const user = store.getState().auth.user;

    if (user) {
      dispatch(authSetUser({ ...user, emailReminderOff: true }));
    }
  };

  return (
    <>
      <Text m={am} k="account.emailMissingBar" />{' '}
      <AccountEmailLink>
        <Text m={am} k="account.emailMissingBarLink" />
      </AccountEmailLink>{' '}
      ｜{' '}
      <Button
        variant="link"
        className="p-0 align-baseline"
        onClick={() => {
          dontRemind();
        }}
      >
        <Text m={am} k="account.dontRemind" />
      </Button>
    </>
  );
}
