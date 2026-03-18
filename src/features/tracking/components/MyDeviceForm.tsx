import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useTextInputState } from '@shared/hooks/useTextInputState.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { ReactElement, SubmitEvent, useCallback } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';

export function MyDeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const device = useAppSelector((state) =>
    state.tracking.modifiedDeviceId
      ? state.tracking.devices.find(
          (device) => device.id === state.tracking.modifiedDeviceId,
        )
      : null,
  );

  const [token, setToken] = useTextInputState(
    device?.token?.replace(/[^:]*:/, '') ?? '',
  );

  const [name, setName] = useTextInputState(device?.name ?? '');

  const [maxCount, setMaxCount] = useTextInputState(
    device?.maxCount?.toString() ?? '',
  );

  const [maxAge, setMaxAge] = useTextInputState(
    typeof device?.maxAge === 'number' ? (device?.maxAge / 60).toString() : '',
  );

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      dispatch(
        trackingActions.saveDevice({
          name: name.trim(),
          maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
          maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10) * 60,
          token,
        }),
      );
    },
    [dispatch, name, maxCount, maxAge, token],
  );

  const invalidMaxCount = isInvalidInt(maxCount, false, 0);

  const invalidMaxAge = isInvalidInt(maxAge, false, 0);

  const invalidName = !/.*\w.*/.test(name) || name.length > 255;

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye />{' '}
          {device
            ? m?.tracking.devices.modifyTitle({
                name: device.name,
              })
            : m?.tracking.devices.createTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="deviceName" className="mb-3">
          <Form.Label className="required">
            {m?.tracking.device.name}
          </Form.Label>

          <Form.Control
            type="text"
            value={name}
            isInvalid={invalidName}
            onChange={setName}
            required
            pattern=".*\w.*"
            maxLength={255}
          />
        </Form.Group>

        <Form.Group controlId="token" className="mb-3 ">
          <Form.Label className="required">Token</Form.Label>

          <Form.Control
            type="text"
            placeholder={m?.tracking.device.generatedToken}
            value={token}
            onChange={setToken}
          />
        </Form.Group>

        <Form.Group controlId="maxCount" className="mb-3">
          <Form.Label>{m?.tracking.device.maxCount}</Form.Label>

          <Form.Control
            type="number"
            min="0"
            step="1"
            value={maxCount}
            isInvalid={invalidMaxCount}
            onChange={setMaxCount}
          />
        </Form.Group>

        <Form.Group controlId="maxAge" className="mb-3">
          <Form.Label>{m?.tracking.device.maxAge}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={maxAge}
              isInvalid={invalidMaxAge}
              onChange={setMaxAge}
            />

            <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="submit"
          disabled={invalidName || invalidMaxCount || invalidMaxAge}
        >
          {m?.general.save}
        </Button>

        <Button
          type="button"
          variant="dark"
          onClick={() => {
            dispatch(trackingActions.modifyDevice(undefined));
          }}
        >
          {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Form>
  );
}
