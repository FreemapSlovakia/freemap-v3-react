import { SubmitEvent, ReactElement, useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { trackingActions } from '../../actions/trackingActions.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useTextInputState } from '../../hooks/useTextInputState.js';
import { useMessages } from '../../l10nInjector.js';

import {
  Button,
  Dropdown,
  DropdownButton,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { isInvalidInt } from '../../numberValidator.js';

const TYPES = {
  url: 'Locus / OsmAnd / …',
  imei: 'TK102B IMEI',
  did: 'TK102B Device ID',
};

export function DeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const device = useAppSelector((state) =>
    state.tracking.modifiedDeviceId
      ? state.tracking.devices.find(
          (device) => device.id === state.tracking.modifiedDeviceId,
        )
      : null,
  );

  const [type, setType] = useState<'url' | 'imei' | 'did'>(() => {
    const m = device?.token?.match(/^(imei|did):/);

    return m ? (m[1] as 'imei' | 'did') : 'url';
  });

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
          token: type === 'url' ? token : `${type}:${token}`,
        }),
      );
    },
    [dispatch, name, maxCount, maxAge, type, token],
  );

  const onSelect = useCallback(
    (type: string | null) => {
      setType(type as keyof typeof TYPES);
    },
    [setType],
  );

  const invalidMaxCount = isInvalidInt(maxCount, false, 0);

  const invalidMaxAge = isInvalidInt(maxAge, false, 0);

  const invalidName = !/.*\w.*/.test(name) || name.length > 255;

  const pattern =
    type === 'imei' ? '[0-9]{15}' : type === 'did' ? '[0-9]+' : undefined;

  const invalidToken = pattern && !new RegExp(pattern).test(token);

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

          <InputGroup>
            <DropdownButton
              variant="secondary"
              id="input-dropdown-addon"
              title={TYPES[type]}
              onSelect={onSelect}
            >
              {Object.entries(TYPES).map(([key, value]) => (
                <Dropdown.Item key={key} eventKey={key} active={type === key}>
                  {value}
                </Dropdown.Item>
              ))}
            </DropdownButton>

            <Form.Control
              type="text"
              pattern={pattern}
              placeholder={
                type === 'url' ? m?.tracking.device.generatedToken : undefined
              }
              value={token}
              isInvalid={invalidToken}
              onChange={setToken}
            />
          </InputGroup>
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
          disabled={
            invalidName || invalidMaxCount || invalidMaxAge || invalidToken
          }
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
