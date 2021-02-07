import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { Device as DeviceType } from 'fm3/types/trackingTypes';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {
  FaClipboard,
  FaEdit,
  FaKey,
  FaMobile,
  FaRegEye,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getType } from 'typesafe-actions';

type Props = {
  device: DeviceType;
};

export function Device({ device }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'tracking.deleteDevice',
        messageKey: 'tracking.devices.delete',
        style: 'warning',
        cancelType: [
          getType(trackingActions.modifyDevice),
          getType(trackingActions.modifyTrackedDevice),
          getType(trackingActions.showAccessTokens),
          getType(setActiveModal),
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteDevice(device.id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }, [device.id, dispatch]);

  const handleShowAccessTokens = useCallback(() => {
    dispatch(trackingActions.showAccessTokens(device.id));
  }, [device.id, dispatch]);

  const handleView = useCallback(() => {
    dispatch(setActiveModal('tracking-watched'));
    dispatch(trackingActions.modifyTrackedDevice(device.id));
  }, [device.id, dispatch]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env['API_URL']}/tracking/track/${device.token}`,
    );
  }, [device.token]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>
        {device.token.startsWith('did:')
          ? `${device.token.slice(4)} (TK102B Device ID)`
          : device.token.startsWith('imei:')
          ? `${device.token.slice(5)} (TK102B IMEI)`
          : device.token}
        {!device.token.includes(':') && (
          <>
            {' '}
            <OverlayTrigger
              trigger={['hover', 'focus']}
              placement="right"
              overlay={
                <Tooltip id={device.token}>
                  <span style={{ overflowWrap: 'break-word' }}>
                    {process.env['API_URL']}/tracking/track/{device.token}
                  </span>
                </Tooltip>
              }
            >
              <span>
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                  <Button
                    variant="secondary"
                    onClick={handleCopyClick}
                    size="sm"
                    title={m?.general.copyUrl}
                    type="button"
                  >
                    <FaClipboard />
                  </Button>
                ) : (
                  <FaMobile />
                )}
              </span>
            </OverlayTrigger>
          </>
        )}
      </td>
      <td>{device.maxCount}</td>
      <td>
        {typeof device.maxAge === 'number'
          ? `${device.maxAge / 60} ${m?.general.minutes}`
          : ''}
      </td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={handleModify}
          title={m?.general.modify}
        >
          <FaEdit />
        </Button>{' '}
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={handleShowAccessTokens}
          title={m?.tracking.devices.watchTokens}
        >
          <FaKey />
        </Button>{' '}
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={handleView}
          title={m?.tracking.devices.watchPrivately}
        >
          <FaRegEye />
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
