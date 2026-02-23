import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useCallback } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaClipboard, FaEdit, FaRegEye, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { copyToClipboard } from '../../../clipboardUtils.js';
import { trackingActions } from '../model/actions.js';
import { AccessToken as AccessTokenType } from '../model/types.js';

type Props = {
  accessToken: AccessTokenType;
};

export function AccessToken({ accessToken }: Props): ReactElement {
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

    dispatch(trackingActions.modifyTrackedDevice(accessToken.token));
  }, [accessToken.token, dispatch]);

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

            <LongPressTooltip label={m?.general.copyUrl}>
              {({ props }) => (
                <Button
                  onClick={handleCopyClick}
                  size="sm"
                  type="button"
                  className="ms-1"
                  {...props}
                >
                  <FaClipboard />
                </Button>
              )}
            </LongPressTooltip>
          </span>
        </OverlayTrigger>
      </td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      {/* <td>{accessToken.listingLabel}</td> */}
      <td>{accessToken.note}</td>
      <td>
        <LongPressTooltip label={m?.tracking.devices.watch}>
          {({ props }) => (
            <Button size="sm" type="button" onClick={handleView} {...props}>
              <FaRegEye />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <Button
              size="sm"
              type="button"
              onClick={handleModify}
              className="ms-1"
              {...props}
            >
              <FaEdit />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.general.delete}>
          {({ props }) => (
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={handleDelete}
              className="ms-1"
              {...props}
            >
              <FaTimes />
            </Button>
          )}
        </LongPressTooltip>
      </td>
    </tr>
  );
}
