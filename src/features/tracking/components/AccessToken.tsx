import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ActionIcon } from '@mantine/core';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useCallback } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
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
        color: 'yellow',
        cancelType: [
          trackingActions.modifyAccessToken.type,
          trackingActions.showAccessTokens.type,
          setActiveModal.type,
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteAccessToken(accessToken.id),
            color: 'red',
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

  return (
    <tr>
      <td>
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="right"
          overlay={
            <Tooltip id={accessToken.token}>
              <span style={{ overflowWrap: 'break-word' }}>
                {location.origin}/?track={encodeURIComponent(accessToken.token)}
                &amp;follow={encodeURIComponent(accessToken.token)}
              </span>
            </Tooltip>
          }
        >
          <span>
            <span>{accessToken.token}</span>

            <MantineLongPressTooltip label={m?.general.copyUrl}>
              {({ props }) => (
                <ActionIcon
                  variant="filled"
                  size="input-sm"
                  type="button"
                  onClick={handleCopyClick}
                  className="ms-1"
                  {...props}
                >
                  <FaClipboard />
                </ActionIcon>
              )}
            </MantineLongPressTooltip>
          </span>
        </OverlayTrigger>
      </td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      {/* <td>{accessToken.listingLabel}</td> */}
      <td>{accessToken.note}</td>
      <td>
        <MantineLongPressTooltip label={m?.tracking.devices.watch}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              size="input-sm"
              type="button"
              onClick={handleView}
              {...props}
            >
              <FaRegEye />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              size="input-sm"
              type="button"
              onClick={handleModify}
              className="ms-1"
              {...props}
            >
              <FaEdit />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.general.delete}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="red"
              size="input-sm"
              type="button"
              onClick={handleDelete}
              className="ms-1"
              {...props}
            >
              <FaTimes />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>
      </td>
    </tr>
  );
}
