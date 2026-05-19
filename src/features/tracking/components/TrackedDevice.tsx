import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { TrackedDevice as TrackedDeviceType } from '../model/types.js';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
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
    dispatch(trackingActions.modifyTrackedDevice(device));
  }, [device, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(trackingActions.deleteTrackedDevice(device.token));
  }, [device.token, dispatch]);

  const meta: { label: string; value: ReactNode }[] = [];

  if (device.fromTime) {
    meta.push({
      label: m?.tracking.trackedDevice.fromTime ?? '',
      value: dateFormat.format(device.fromTime),
    });
  }

  if (typeof device.maxAge === 'number') {
    meta.push({
      label: m?.tracking.trackedDevice.maxAge ?? '',
      value: `${device.maxAge / 60} ${m?.general.minutes}`,
    });
  }

  if (device.maxCount) {
    meta.push({
      label: m?.tracking.trackedDevice.maxCount ?? '',
      value: device.maxCount,
    });
  }

  if (device.splitDistance) {
    meta.push({
      label: m?.tracking.trackedDevice.splitDistance ?? '',
      value: device.splitDistance,
    });
  }

  if (device.splitDuration) {
    meta.push({
      label: m?.tracking.trackedDevice.splitDuration ?? '',
      value: device.splitDuration,
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

      <div className="flex-grow-1 me-2">
        <div>
          <code>{device.token}</code>
          {device.label && <> · {device.label}</>}
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

      <LongPressTooltip label={m?.general.modify}>
        {({ props }) => (
          <Button
            size="sm"
            variant="outline-secondary"
            type="button"
            onClick={handleModify}
            {...props}
          >
            <FaEdit />
          </Button>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.general.delete}>
        {({ props }) => (
          <Button
            variant="outline-danger"
            size="sm"
            type="button"
            onClick={handleDelete}
            {...props}
          >
            <FaTimes />
          </Button>
        )}
      </LongPressTooltip>
    </ListGroup.Item>
  );
}
