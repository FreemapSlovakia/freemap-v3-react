import { FormEvent, ReactElement, useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { shallowEqual, useDispatch } from 'react-redux';
import { selectFeature } from '../../actions/mainActions.js';
import { trackingActions } from '../../actions/trackingActions.js';
import { DateTime } from '../../components/DateTime.js';
import { toDatetimeLocal } from '../../dateUtils.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useTextInputState } from '../../hooks/useTextInputState.js';
import { useMessages } from '../../l10nInjector.js';
import { isInvalidFloat, isInvalidInt } from '../../numberValidator.js';
import { TrackedDevice } from '../../types/trackingTypes.js';

export function TrackedDeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const { device, forceNew } = useAppSelector((state) => {
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

  const invalidWidth = isInvalidFloat(width, false, 1);
  const invalidMaxCount = isInvalidInt(maxCount, false, 0);
  const invalidMaxAge = isInvalidInt(maxAge, false, 0);
  const invalidSplitDistance = isInvalidFloat(splitDistance, false, 0);
  const invalidSplitDuration = isInvalidInt(splitDuration, false, 0);

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
    <Form onSubmit={handleSubmit}>
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
        <Form.Group controlId="token" className="mb-3 ">
          {/* TODD: or ID */}
          <Form.Label className="required">
            {m?.tracking.trackedDevice.token}
          </Form.Label>

          <Form.Control
            isInvalid={!id.trim()}
            value={id}
            onChange={setId}
            required
          />
        </Form.Group>

        <Form.Group controlId="label" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.label}</Form.Label>
          <Form.Control value={label} onChange={setLabel} />
        </Form.Group>

        <Form.Group controlId="color" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.color}</Form.Label>
          <InputGroup>
            <Form.Control type="color" value={color} onChange={setColor} />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="width" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.width}</Form.Label>

          <InputGroup>
            <Form.Control
              value={width}
              onChange={setWidth}
              type="number"
              min="1"
              isInvalid={invalidWidth}
            />
            <InputGroup.Text>px</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="fromTime" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.fromTime}</Form.Label>

          <DateTime value={fromTime} onChange={setFromTime} />
        </Form.Group>

        <Form.Group controlId="maxAge" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.maxAge}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              step="1"
              isInvalid={invalidMaxAge}
              value={maxAge}
              onChange={setMaxAge}
            />
            <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="maxCount" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.maxCount}</Form.Label>

          <Form.Control
            type="number"
            min="0"
            step="1"
            isInvalid={invalidMaxCount}
            value={maxCount}
            onChange={setMaxCount}
          />
        </Form.Group>

        <Form.Group controlId="splitDistance" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.splitDistance}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              isInvalid={invalidSplitDistance}
              onChange={setSplitDistance}
            />

            <InputGroup.Text>{m?.general.meters}</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="splitDuration" className="mb-3">
          <Form.Label>{m?.tracking.trackedDevice.splitDuration}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              step="1"
              isInvalid={invalidSplitDuration}
              value={splitDuration}
              onChange={setSplitDuration}
            />

            <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="submit"
          disabled={
            !id.trim() ||
            invalidSplitDistance ||
            invalidSplitDuration ||
            invalidMaxCount ||
            invalidMaxAge ||
            invalidWidth
          }
        >
          {m?.general.save}
        </Button>

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
    </Form>
  );
}
