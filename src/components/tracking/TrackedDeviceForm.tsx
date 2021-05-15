import { selectFeature } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { DateTime } from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { useMessages } from 'fm3/l10nInjector';
import { TrackedDevice } from 'fm3/types/trackingTypes';
import { FormEvent, ReactElement, useState } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { FaBullseye } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export function TrackedDeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const { device, forceNew } = useSelector((state) => {
    let device: TrackedDevice | undefined;
    let forceNew = false;

    if (state.tracking.modifiedTrackedDeviceId != null) {
      device = state.tracking.trackedDevices.find(
        (device) => device.token === state.tracking.modifiedTrackedDeviceId,
      );

      if (!device) {
        device = { token: state.tracking.modifiedTrackedDeviceId };
        forceNew = true;
      }
    }

    return {
      device,
      forceNew,
    };
  }, shallowEqual);

  const [id, setId] = useTextInputState(device?.token?.toString() ?? '');

  const [label, setLabel] = useTextInputState(device?.label ?? '');

  const [color, setColor] = useTextInputState(device?.color ?? '#7239a8');

  const [width, setWidth] = useTextInputState(device?.width?.toString() ?? '');

  const [fromTime, setFromTime] = useState(
    device?.fromTime ? toDatetimeLocal(device.fromTime) : '',
  );

  const [maxCount, setMaxCount] = useTextInputState(
    device?.maxCount?.toString() ?? '',
  );

  const [maxAge, setMaxAge] = useTextInputState(
    typeof device?.maxAge === 'number' ? (device?.maxAge / 60).toString() : '',
  );

  const [splitDistance, setSplitDistance] = useTextInputState(
    device?.splitDistance?.toString() ?? '',
  );

  const [splitDuration, setSplitDuration] = useTextInputState(
    device?.splitDuration?.toString() ?? '',
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const did = id.trim();

    dispatch(
      trackingActions.saveTrackedDevice({
        token: did,
        label: label.trim() || null,
        color: color === '#7239a8' ? null : color.trim() || null,
        fromTime: fromTime === '' ? null : new Date(fromTime),
        maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10) * 60,
        maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
        width: width === '' ? null : Number.parseInt(width, 10),
        splitDistance:
          splitDistance === '' ? null : Number.parseInt(splitDistance, 10),
        splitDuration:
          splitDuration === '' ? null : Number.parseInt(splitDuration, 10),
      }),
    );

    dispatch(selectFeature({ type: 'tracking', id: did }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye />{' '}
          {device && !forceNew
            ? m?.tracking.trackedDevices.modifyTitle(
                device.label || device.token,
              )
            : m?.tracking.trackedDevices.createTitle(
                device?.label ?? device?.token,
              )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup className="required">
          {/* TODD: or ID */}
          <FormLabel>{m?.tracking.trackedDevice.token}</FormLabel>
          <FormControl value={id} onChange={setId} required />
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.label}</FormLabel>
          <FormControl value={label} onChange={setLabel} />
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.color}</FormLabel>
          <InputGroup>
            <FormControl type="color" value={color} onChange={setColor} />
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.width}</FormLabel>
          <InputGroup>
            <FormControl
              value={width}
              onChange={setWidth}
              type="number"
              min="1"
            />
            <InputGroup.Append>
              <InputGroup.Text>px</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.fromTime}</FormLabel>
          <DateTime value={fromTime} onChange={setFromTime} />
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.maxAge}</FormLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={maxAge}
              onChange={setMaxAge}
            />
            <InputGroup.Append>
              <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.maxCount}</FormLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.splitDistance}</FormLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={splitDistance}
              onChange={setSplitDistance}
            />
            <InputGroup.Append>
              <InputGroup.Text>{m?.general.meters}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.trackedDevice.splitDuration}</FormLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={splitDuration}
              onChange={setSplitDuration}
            />
            <InputGroup.Append>
              <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{m?.general.save}</Button>
        <Button
          variant="dark"
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyTrackedDevice(undefined));
          }}
        >
          {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </form>
  );
}
