import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import {
  Button,
  Dropdown,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FaEdit, FaEllipsisV, FaKey, FaTrash } from 'react-icons/fa';
import { SiTraccar } from 'react-icons/si';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';
import { fixedPopperConfig } from '@/shared/fixedPopperConfig.js';
import { trackingActions } from '../model/actions.js';
import { Device as DeviceType } from '../model/types.js';

type Props = {
  device: DeviceType;
};

export function MyDevice({ device }: Props): ReactElement {
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

  const meta: { label: string; value: ReactNode }[] = [];

  if (device.maxCount) {
    meta.push({
      label: m?.tracking.device.maxCount ?? '',
      value: device.maxCount,
    });
  }

  if (typeof device.maxAge === 'number') {
    meta.push({
      label: m?.tracking.device.maxAge ?? '',
      value: `${device.maxAge / 60} ${m?.general.minutes}`,
    });
  }

  meta.push({
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(device.createdAt),
  });

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 me-2">
        <div>
          <code>{device.token}</code> · {device.name}
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

      <OverlayTrigger
        trigger="click"
        rootClose
        overlay={
          <Tooltip>
            <div className="bg-white p-3">
              <QRCode
                size={120}
                value={
                  'https://traccar.freemap.sk?accuracy=high&interval=10&id=' +
                  encodeURIComponent(device.token)
                }
              />
            </div>
          </Tooltip>
        }
      >
        <Button variant="outline-secondary" size="sm" title="Traccar">
          <SiTraccar />
        </Button>
      </OverlayTrigger>

      <Dropdown align="end">
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          aria-label={m?.general.actions}
        >
          <FaEllipsisV />
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <Dropdown.Item onClick={handleModify}>
            <FaEdit /> {m?.general.modify}
          </Dropdown.Item>

          <Dropdown.Item onClick={handleShowAccessTokens}>
            <FaKey /> {m?.tracking.devices.watchTokens}
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item className="text-danger" onClick={handleDelete}>
            <FaTrash /> {m?.general.delete}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ListGroup.Item>
  );
}
