import { connect } from 'react-redux';
import React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { EditedDevice } from 'fm3/types/trackingTypes';
import { useTextInputState, useCheckboxInputState } from 'fm3/hooks/inputHooks';
import { Checkbox, InputGroup } from 'react-bootstrap';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const DeviceFormInt: React.FC<Props> = ({ onSave, onCancel, device, t }) => {
  const [name, setName] = useTextInputState(device?.name ?? '');

  const [maxCount, setMaxCount] = useTextInputState(
    device?.maxCount?.toString() ?? '',
  );

  const [maxAge, setMaxAge] = useTextInputState(
    device?.maxAge?.toString() ?? '',
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
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={maxAge}
              onChange={setMaxAge}
            />
            <InputGroup.Addon>s</InputGroup.Addon>
          </InputGroup>
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
          {t('general.cancel')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </form>
  );
};

const mapStateToProps = (state: RootState) => ({
  device: state.tracking.modifiedDeviceId
    ? state.tracking.devices.find(
        device => device.id === state.tracking.modifiedDeviceId,
      )
    : null,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onCancel() {
    dispatch(trackingActions.modifyDevice(undefined));
  },
  onSave(device: EditedDevice) {
    dispatch(trackingActions.saveDevice(device));
  },
});

export const DeviceForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(DeviceFormInt));
