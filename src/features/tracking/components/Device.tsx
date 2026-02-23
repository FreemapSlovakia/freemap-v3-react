import { type ReactElement, useCallback } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  FaClipboard,
  FaEdit,
  FaKey,
  FaMobileAlt,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../../actions/mainActions.js';
import { toastsAdd } from '../../toasts/model/actions.js';
import { trackingActions } from '../model/actions.js';
import { copyToClipboard } from '../../../clipboardUtils.js';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat.js';
import { useMessages } from '../../../l10nInjector.js';
import { Device as DeviceType } from '../model/types.js';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';

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
              {/iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent) ? (
                <LongPressTooltip label={m?.general.copyUrl}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      onClick={handleCopyClick}
                      size="sm"
                      type="button"
                      {...props}
                    >
                      <FaClipboard />
                    </Button>
                  )}
                </LongPressTooltip>
              ) : (
                <FaMobileAlt />
              )}
            </span>
          </OverlayTrigger>
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
        <LongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={handleModify}
              {...props}
            >
              <FaEdit />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.tracking.devices.watchTokens}>
          {({ props }) => (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={handleShowAccessTokens}
              className="ms-1"
              {...props}
            >
              <FaKey />
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
