import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
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
} from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { TrackedDevice as TrackedDeviceType } from '../model/types.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const nf = useNumberFormat();

  const handleModify = useCallback(() => {
    dispatch(setActiveModal({ type: 'tracking-watched', token: device.token }));
  }, [device.token, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(trackingActions.deleteTrackedDevice(device.token));
  }, [device.token, dispatch]);

  const meta: { key: string; label: string; value: ReactNode }[] = [];

  if (device.fromTime) {
    meta.push({
      key: 'fromTime',
      label: tm?.trackedDevice.fromTime ?? '',
      value: dateFormat.format(device.fromTime),
    });
  }

  if (typeof device.maxAge === 'number') {
    meta.push({
      key: 'maxAge',
      label: tm?.trackedDevice.maxAge ?? '',
      value: `${nf.format(device.maxAge / 60)} ${m?.general.minutes}`,
    });
  }

  if (device.maxCount) {
    meta.push({
      key: 'maxCount',
      label: tm?.trackedDevice.maxCount ?? '',
      value: nf.format(device.maxCount),
    });
  }

  if (device.splitDistance) {
    meta.push({
      key: 'splitDistance',
      label: tm?.trackedDevice.splitDistance ?? '',
      value: nf.format(device.splitDistance),
    });
  }

  if (device.splitDuration) {
    meta.push({
      key: 'splitDuration',
      label: tm?.trackedDevice.splitDuration ?? '',
      value: nf.format(device.splitDuration),
    });
  }

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2">
      <div
        style={{
          backgroundColor: device.color || '#7239a8',
          width: '20px',
          height: '20px',
          flexShrink: 0,
        }}
      />

      <div className="flex-grow-1 me-2 min-w-0">
        <div>
          <code>{device.token}</code>
          {device.label && <> · {device.label}</>}
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

      <div className="flex-shrink-0">
        <ResponsiveActions align="end" toggleLabel={m?.general.actions}>
          <Action
            icon={<FaEdit />}
            label={m?.general.modify}
            onClick={handleModify}
            showFrom="sm"
          />

          <ActionDivider />

          <Action
            icon={<FaTimes />}
            label={m?.general.delete}
            variant="danger"
            onClick={handleDelete}
            showFrom="sm"
          />
        </ResponsiveActions>
      </div>
    </ListGroup.Item>
  );
}
