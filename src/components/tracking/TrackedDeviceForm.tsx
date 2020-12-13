import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { FormEvent, ReactElement, useState } from 'react';
import { DateTime } from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { TrackedDevice } from 'fm3/types/trackingTypes';
import { useMessages } from 'fm3/l10nInjector';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Modal from 'react-bootstrap/Modal';

import { RootState } from 'fm3/storeCreator';
import { selectFeature } from 'fm3/actions/mainActions';

export function TrackedDeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const { device, forceNew } = useSelector((state: RootState) => {
    let device: TrackedDevice | undefined;
    let forceNew = false;

    if (state.tracking.modifiedTrackedDeviceId != null) {
      device = state.tracking.trackedDevices.find(
        (device) => device.id === state.tracking.modifiedTrackedDeviceId,
      );

      if (!device) {
        device = { id: state.tracking.modifiedTrackedDeviceId };
        forceNew = true;
      }
    }

    return {
      device,
      forceNew,
    };
  }, shallowEqual);

  const [id, setId] = useTextInputState(device?.id?.toString() ?? '');

  const [label, setLabel] = useTextInputState(device?.label ?? '');

  const [color, setColor] = useTextInputState(device?.color ?? '');

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

    const id0 = id.trim();

    const did = /^\d+$/.test(id0) ? Number.parseInt(id0) : id0;

    dispatch(
      trackingActions.saveTrackedDevice({
        id: did,
        label: label.trim() || null,
        color: color.trim() || null,
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
          <FontAwesomeIcon icon="bullseye" />{' '}
          {device && !forceNew
            ? m?.tracking.trackedDevices.modifyTitle(device.label || device.id)
            : m?.tracking.trackedDevices.createTitle}
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
            <FormControl value={color} onChange={setColor} />
            <InputGroup.Append>HTML</InputGroup.Append>
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
            <InputGroup.Append>px</InputGroup.Append>
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
            <InputGroup.Append>{m?.general.minutes}</InputGroup.Append>
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
            <InputGroup.Append>{m?.general.meters}</InputGroup.Append>
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
            <InputGroup.Append>{m?.general.minutes}</InputGroup.Append>
          </InputGroup>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{m?.general.save}</Button>
        <Button
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
