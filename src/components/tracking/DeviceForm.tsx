import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { IEditedDevice } from 'fm3/types/trackingTypes';
import { useTextInputState, useCheckboxInputState } from 'fm3/hooks/inputHooks';
import { Checkbox } from 'react-bootstrap';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose } from 'redux';

interface Props {
  onCancel: () => void;
  onSave: (device: IEditedDevice) => void;
  device: IEditedDevice;
  t: Translator;
}

const DeviceForm: React.FC<Props> = ({ onSave, onCancel, device, t }) => {
  const [name, setName] = useTextInputState((device && device.name) || '');
  const [maxCount, setMaxCount] = useTextInputState(
    device && device.maxCount !== null ? device.maxCount.toString() : '',
  );
  const [maxAge, setMaxAge] = useTextInputState(
    device && device.maxAge !== null ? device.maxAge.toString() : '',
  );
  const [regenerateToken, setRegenerateToken] = useCheckboxInputState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
      maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10),
      regenerateToken,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {device
            ? t('tracking.devices.modifyTitle', {
                name: device.name,
              })
            : t('tracking.devices.createTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup className="required">
          <ControlLabel>{t('tracking.device.name')}</ControlLabel>
          <FormControl
            type="text"
            value={name}
            onChange={setName}
            required
            pattern=".*\w.*"
            maxLength={255}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.device.maxCount')}</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.device.maxAge')}</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxAge}
            onChange={setMaxAge}
          />
        </FormGroup>
        {!!device && (
          <Checkbox onChange={setRegenerateToken} checked={regenerateToken}>
            {t('tracking.device.regenerateToken')}
          </Checkbox>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{t('general.save')}</Button>
        <Button type="button" onClick={onCancel}>
          {t('general.cancel')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

export default compose(
  injectL10n(),
  connect(
    (state: any) => ({
      device:
        state.tracking.modifiedDeviceId &&
        state.tracking.devices.find(
          device => device.id === state.tracking.modifiedDeviceId,
        ),
    }),
    dispatch => ({
      onCancel() {
        dispatch(trackingActions.modifyDevice(undefined));
      },
      onSave(device: IEditedDevice) {
        dispatch(trackingActions.saveDevice(device));
      },
    }),
  ),
)(DeviceForm);
