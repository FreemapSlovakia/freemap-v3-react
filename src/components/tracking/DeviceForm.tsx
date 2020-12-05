import { useDispatch, useSelector } from 'react-redux';
import React, { ReactElement, useCallback, useState } from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { InputGroup } from 'react-bootstrap';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

const types: Record<string, string> = {
  url: 'Locus / OsmAnd / …',
  imei: 'TK102B IMEI',
  did: 'TK102B Device ID',
};

export function DeviceForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const device = useSelector((state: RootState) =>
    state.tracking.modifiedDeviceId
      ? state.tracking.devices.find(
          (device) => device.id === state.tracking.modifiedDeviceId,
        )
      : null,
  );

  const [type, setType] = useState(
    device?.token?.includes(':') ? device?.token?.replace(/:.*/, '') : 'url',
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

  const [regenerateToken, setRegenerateToken] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      dispatch(
        trackingActions.saveDevice({
          name: name.trim(),
          maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
          maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10) * 60,
          regenerateToken:
            type === 'url' || !device?.id ? undefined : regenerateToken,
          token: type === 'url' ? undefined : `${type}:${token}`,
        }),
      );
    },
    [dispatch, name, maxCount, maxAge, regenerateToken, type, token, device],
  );

  const onSelect = useCallback(
    (type) => {
      setType(type);
    },
    [setType],
  );

  const handleRegenerateTokenClick = useCallback(() => {
    setRegenerateToken((rt) => !rt);
  }, [setRegenerateToken]);

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {device
            ? m?.tracking.devices.modifyTitle({
                name: device.name,
              })
            : m?.tracking.devices.createTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup className="required">
          <ControlLabel>{m?.tracking.device.name}</ControlLabel>
          <FormControl
            type="text"
            value={name}
            onChange={setName}
            required
            pattern=".*\w.*"
            maxLength={255}
          />
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Token</ControlLabel>
          <InputGroup>
            <DropdownButton
              componentClass={InputGroup.Button}
              id="input-dropdown-addon"
              title={types[type]}
              onSelect={onSelect}
              disabled={!!device?.id}
            >
              {Object.entries(types).map(([key, value]) => (
                <MenuItem key={key} eventKey={key} active={type === key}>
                  {value}
                </MenuItem>
              ))}
            </DropdownButton>
            <FormControl
              type="text"
              pattern={
                type === 'imei'
                  ? '[0-9]{15}'
                  : type === 'did'
                  ? '[0-9]*'
                  : undefined
              }
              disabled={type === 'url' || !!device?.id}
              value={
                (type === 'url' && !device?.id) || regenerateToken
                  ? m?.tracking.device.generatedToken
                  : token
              }
              onChange={setToken}
            />
            {type === 'url' && !!device?.id && (
              <InputGroup.Button>
                <Button
                  active={regenerateToken}
                  onClick={handleRegenerateTokenClick}
                >
                  <FontAwesomeIcon icon="refresh" /> Regenerate
                </Button>
              </InputGroup.Button>
            )}
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{m?.tracking.device.maxCount}</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{m?.tracking.device.maxAge}</ControlLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={maxAge}
              onChange={setMaxAge}
            />
            <InputGroup.Addon>{m?.general.minutes}</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{m?.general.save}</Button>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyDevice(undefined));
          }}
        >
          {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </form>
  );
}
