import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Dropdown, ListGroup, Overlay, Tooltip } from 'react-bootstrap';
import { FaEdit, FaEllipsisV, FaKey, FaTrash } from 'react-icons/fa';
import { SiTraccar } from 'react-icons/si';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';
import { fixedPopperConfig } from '@/shared/fixedPopperConfig.js';
import { trackingActions } from '../model/actions.js';
import { Device as DeviceType } from '../model/types.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';

type Props = {
  device: DeviceType;
};

export function MyDevice({ device }: Props): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const nf = useNumberFormat();

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = useCallback(async () => {
    if (
      await confirm({
        title: tm?.devices.deleteTitle,
        message: tm?.devices.delete(device.name),
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(trackingActions.deleteDevice(device.id));
    }
  }, [device.id, device.name, dispatch, confirm, m, tm]);

  const handleShowAccessTokens = useCallback(() => {
    dispatch(trackingActions.showAccessTokens(device.id));
  }, [device.id, dispatch]);

  const meta: { label: string; value: ReactNode }[] = [];

  if (device.maxCount) {
    meta.push({
      label: tm?.device.maxCount ?? '',
      value: nf.format(device.maxCount),
    });
  }

  if (typeof device.maxAge === 'number') {
    meta.push({
      label: tm?.device.maxAge ?? '',
      value: `${nf.format(device.maxAge / 60)} ${m?.general.minutes}`,
    });
  }

  meta.push({
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(device.createdAt),
  });

  const dropdownRef = useRef<HTMLButtonElement>(null);

  const [showQr, setShowQr] = useState(false);

  return (
    <ListGroup.Item className="d-flex flex-wrap align-items-center gap-2">
      <div className="flex-grow-1 me-2">
        <div>
          <code>{device.token}</code> · {device.name}
        </div>

        <small className="text-muted">
          {meta.map((item, i) => (
            <Fragment key={item.label}>
              {i > 0 && ' · '}
              <span className="text-nowrap">
                {item.label}: <strong>{item.value}</strong>
              </span>
            </Fragment>
          ))}
        </small>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {showQr && (
          <Overlay
            target={dropdownRef.current}
            show
            rootClose
            onHide={() => setShowQr(false)}
          >
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
          </Overlay>
        )}

        <Dropdown align="end">
          <Dropdown.Toggle
            ref={dropdownRef}
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
              <FaKey /> {tm?.devices.watchTokens}
            </Dropdown.Item>

            <Dropdown.Item onClick={() => setShowQr(true)}>
              <SiTraccar /> {tm?.devices.traccarQrCode}
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item className="text-danger" onClick={handleDelete}>
              <FaTrash /> {m?.general.delete}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </ListGroup.Item>
  );
}
