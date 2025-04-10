import { ReactElement, useCallback } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  FaClipboard,
  FaEdit,
  FaKey,
  FaMobileAlt,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../actions/mainActions.js';
import { toastsAdd } from '../../actions/toastsActions.js';
import { trackingActions } from '../../actions/trackingActions.js';
import { copyToClipboard } from '../../clipboardUtils.js';
import { useDateTimeFormat } from '../../hooks/useDateTimeFormat.js';
import { useMessages } from '../../l10nInjector.js';
import { Device as DeviceType } from '../../types/trackingTypes.js';

type Props = {
  device: DeviceType;
};

export function Device({ device }: Props): ReactElement {
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
    dispatch(trackingActions.modifyDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'tracking.deleteDevice',
        messageKey: 'tracking.devices.delete',
        style: 'warning',
        cancelType: [
          trackingActions.modifyDevice.type,
          trackingActions.modifyTrackedDevice.type,
          trackingActions.showAccessTokens.type,
          setActiveModal.type,
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

  const handleCopyClick = useCallback(() => {
    copyToClipboard(
      dispatch,
      `${process.env['API_URL']}/tracking/track/${device.token}`,
    );
  }, [device.token, dispatch]);

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
                {/iPhone|iPad|iPod|Android/i.test(
                  window.navigator.userAgent,
                ) ? (
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
                  <FaMobileAlt />
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
        {/* <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={handleView}
          title={m?.tracking.devices.watchPrivately}
        >
          <FaRegEye />
        </Button>{' '} */}
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
