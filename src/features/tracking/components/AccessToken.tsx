import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import { Button, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaClipboard, FaEdit, FaRegEye, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { AccessToken as AccessTokenType } from '../model/types.js';

type Props = {
  accessToken: AccessTokenType;
  deviceName: string;
};

export function AccessToken({ accessToken, deviceName }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyAccessToken(accessToken.id));
  }, [accessToken.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'tracking.deleteAccessToken',
        messageKey: 'tracking.accessToken.delete',
        style: 'warning',
        cancelType: [
          trackingActions.modifyAccessToken.type,
          trackingActions.showAccessTokens.type,
          setActiveModal.type,
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteAccessToken(accessToken.id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }, [accessToken.id, dispatch]);

  const handleCopyClick = useCallback(() => {
    copyToClipboard(
      dispatch,
      `${location.origin}/?track=${encodeURIComponent(
        accessToken.token,
      )}&follow=${encodeURIComponent(accessToken.token)}`,
    );
  }, [accessToken.token, dispatch]);

  const handleView = useCallback(() => {
    dispatch(setActiveModal('tracking-watched'));

    dispatch(
      trackingActions.modifyTrackedDevice({
        token: accessToken.token,
        label: deviceName,
      }),
    );
  }, [accessToken.token, deviceName, dispatch]);

  const meta: { label: string; value: ReactNode }[] = [];

  meta.push({
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(accessToken.createdAt),
  });

  if (accessToken.timeFrom) {
    meta.push({
      label: m?.tracking.accessToken.timeFrom ?? '',
      value: dateFormat.format(accessToken.timeFrom),
    });
  }

  if (accessToken.timeTo) {
    meta.push({
      label: m?.tracking.accessToken.timeTo ?? '',
      value: dateFormat.format(accessToken.timeTo),
    });
  }

  if (accessToken.note) {
    meta.push({
      label: m?.tracking.accessToken.note ?? '',
      value: accessToken.note,
    });
  }

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 me-2">
        <div className="d-flex align-items-center gap-2">
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="right"
            overlay={
              <Tooltip id={accessToken.token}>
                <span style={{ overflowWrap: 'break-word' }}>
                  {location.origin}/?track=
                  {encodeURIComponent(accessToken.token)}
                  &amp;follow={encodeURIComponent(accessToken.token)}
                </span>
              </Tooltip>
            }
          >
            <code>{accessToken.token}</code>
          </OverlayTrigger>

          <LongPressTooltip label={m?.general.copyUrl}>
            {({ props }) => (
              <Button
                onClick={handleCopyClick}
                size="sm"
                variant="outline-secondary"
                type="button"
                {...props}
              >
                <FaClipboard />
              </Button>
            )}
          </LongPressTooltip>
        </div>

        <small className="text-muted">
          {meta.map((item, i) => (
            <Fragment key={item.label}>
              {i > 0 && ' · '}
              {item.label}: <strong>{item.value}</strong>
            </Fragment>
          ))}
        </small>
      </div>

      <LongPressTooltip label={m?.tracking.devices.watch}>
        {({ props }) => (
          <Button
            size="sm"
            variant="outline-secondary"
            type="button"
            onClick={handleView}
            {...props}
          >
            <FaRegEye />
          </Button>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.general.modify}>
        {({ props }) => (
          <Button
            size="sm"
            variant="outline-secondary"
            type="button"
            onClick={handleModify}
            {...props}
          >
            <FaEdit />
          </Button>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.general.delete}>
        {({ props }) => (
          <Button
            variant="outline-danger"
            size="sm"
            type="button"
            onClick={handleDelete}
            {...props}
          >
            <FaTimes />
          </Button>
        )}
      </LongPressTooltip>
    </ListGroup.Item>
  );
}
