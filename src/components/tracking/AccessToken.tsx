import { type ReactElement, useCallback } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaClipboard, FaEdit, FaRegEye, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../actions/mainActions.js';
import { toastsAdd } from '../../actions/toastsActions.js';
import { trackingActions } from '../../actions/trackingActions.js';
import { copyToClipboard } from '../../clipboardUtils.js';
import { useDateTimeFormat } from '../../hooks/useDateTimeFormat.js';
import { useMessages } from '../../l10nInjector.js';
import { AccessToken as AccessTokenType } from '../../types/trackingTypes.js';

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
            {accessToken.token}{' '}
            <Button
              onClick={handleCopyClick}
              size="sm"
              title={m?.general.copyUrl}
              type="button"
            >
              <FaClipboard />
            </Button>
          </span>
        </OverlayTrigger>
      </td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      {/* <td>{accessToken.listingLabel}</td> */}
      <td>{accessToken.note}</td>
      <td>
        <Button
          size="sm"
          type="button"
          onClick={handleView}
          title={m?.tracking.devices.watch}
        >
          <FaRegEye />
        </Button>{' '}
        <Button
          size="sm"
          type="button"
          onClick={handleModify}
          title={m?.general.modify}
        >
          <FaEdit />
        </Button>{' '}
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={handleDelete}
          title={m?.general.delete}
        >
          <FaTimes />
        </Button>
      </td>
    </tr>
  );
}
