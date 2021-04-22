import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { copyToClipboard } from 'fm3/clipboardUtils';
import { useMessages } from 'fm3/l10nInjector';
import { AccessToken as AccessTokenType } from 'fm3/types/trackingTypes';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FaClipboard, FaEdit, FaRegEye, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getType } from 'typesafe-actions';

type Props = {
  accessToken: AccessTokenType;
};

export function AccessToken({ accessToken }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const language = useSelector((state) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
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
          getType(trackingActions.modifyAccessToken),
          getType(trackingActions.showAccessTokens),
          getType(setActiveModal),
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
