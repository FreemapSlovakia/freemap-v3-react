import { saveSettings } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAuthMessages } from '../../translations/useAuthMessages.js';

/** Which notification emails the account gets; each saves at once. */
export function NotificationsSection(): ReactElement | null {
  const dispatch = useDispatch();

  const am = useAuthMessages();

  const user = useAppSelector((state) => state.auth.user);

  const online = useOnline();

  if (!user) {
    return null;
  }

  const toggle = (
    key: 'sendGalleryEmails' | 'sendEventEmails',
    value: boolean,
  ) => dispatch(saveSettings({ user: { [key]: value }, keepOpen: true }));

  return (
    <>
      <Form.Check
        id="account-notify-gallery"
        label={am?.account.notifyGallery}
        checked={user.sendGalleryEmails}
        disabled={!online}
        onChange={(e) => toggle('sendGalleryEmails', e.currentTarget.checked)}
      />

      <Form.Check
        id="account-notify-events"
        label={am?.account.notifyEvents}
        checked={user.sendEventEmails}
        disabled={!online}
        onChange={(e) => toggle('sendEventEmails', e.currentTarget.checked)}
      />

      <Form.Text>{am?.account.notificationsHint}</Form.Text>
    </>
  );
}
