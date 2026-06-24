import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
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
import { ListGroup, Overlay, Tooltip } from 'react-bootstrap';
import { FaEdit, FaKey, FaTrash } from 'react-icons/fa';
import { SiTraccar } from 'react-icons/si';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';
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

  const meta: { key: string; label: string; value: ReactNode }[] = [];

  if (device.maxCount) {
    meta.push({
      key: 'maxCount',
      label: tm?.device.maxCount ?? '',
      value: nf.format(device.maxCount),
    });
  }

  if (typeof device.maxAge === 'number') {
    meta.push({
      key: 'maxAge',
      label: tm?.device.maxAge ?? '',
      value: `${nf.format(device.maxAge / 60)} ${m?.general.minutes}`,
    });
  }

  meta.push({
    key: 'createdAt',
    label: m?.general.createdAt ?? '',
    value: dateFormat.format(device.createdAt),
  });

  const actionsRef = useRef<HTMLDivElement>(null);

  const [showQr, setShowQr] = useState(false);

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 me-2 min-w-0">
        <div>
          <code>{device.token}</code> · {device.name}
        </div>

        <small className="text-muted">
          {meta.map((item, i) => (
            <Fragment key={item.key}>
              {i > 0 && ' · '}
              <span className="text-nowrap">
                {item.label}: <strong>{item.value}</strong>
              </span>
            </Fragment>
          ))}
        </small>
      </div>

      <div ref={actionsRef} className="flex-shrink-0">
        {showQr && (
          <Overlay
            target={actionsRef.current}
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

        <ResponsiveActions align="end" toggleLabel={m?.general.actions}>
          <Action
            icon={<FaEdit />}
            label={m?.general.modify}
            onClick={handleModify}
            showFrom="md"
          />

          <Action
            icon={<FaKey />}
            label={tm?.devices.watchTokens}
            onClick={handleShowAccessTokens}
            showFrom="lg"
          />

          <Action
            icon={<SiTraccar />}
            label={tm?.devices.traccarQrCode}
            onClick={() => setShowQr(true)}
            showFrom="lg"
          />

          <ActionDivider />

          <Action
            icon={<FaTrash />}
            label={m?.general.delete}
            variant="danger"
            onClick={handleDelete}
            showFrom="md"
          />
        </ResponsiveActions>
      </div>
    </ListGroup.Item>
  );
}
