import { trackingActions } from 'fm3/actions/trackingActions';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { FormEvent, ReactElement, useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { FaBullseye, FaSync } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

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
    (e: FormEvent) => {
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
          <FaBullseye />{' '}
          {device
            ? m?.tracking.devices.modifyTitle({
                name: device.name,
              })
            : m?.tracking.devices.createTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup className="required">
          <FormLabel>{m?.tracking.device.name}</FormLabel>
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
          <FormLabel>Token</FormLabel>
          <InputGroup>
            <DropdownButton
              variant="secondary"
              as={InputGroup.Append}
              id="input-dropdown-addon"
              title={types[type]}
              onSelect={onSelect}
              disabled={!!device?.id}
            >
              {Object.entries(types).map(([key, value]) => (
                <Dropdown.Item key={key} eventKey={key} active={type === key}>
                  {value}
                </Dropdown.Item>
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
              <InputGroup.Append>
                <Button
                  active={regenerateToken}
                  onClick={handleRegenerateTokenClick}
                >
                  <FaSync /> Regenerate
                </Button>
              </InputGroup.Append>
            )}
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.device.maxCount}</FormLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>{m?.tracking.device.maxAge}</FormLabel>
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
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{m?.general.save}</Button>
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
    </form>
  );
}
