import { connect } from 'react-redux';
import React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import { DateTime } from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { TrackedDevice } from 'fm3/types/trackingTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { InputGroup } from 'react-bootstrap';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { selectFeature } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const TrackedDeviceFormInt: React.FC<Props> = ({
  onSave,
  onCancel,
  device,
  forceNew,
  t,
}) => {
  const [id, setId] = useTextInputState(device?.id?.toString() ?? '');

  const [label, setLabel] = useTextInputState(device?.label ?? '');

  const [color, setColor] = useTextInputState(device?.color ?? '');

  const [width, setWidth] = useTextInputState(device?.width?.toString() ?? '');

  const [fromTime, setFromTime] = React.useState(
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id0 = id.trim();
    onSave({
      id: /^\d+$/.test(id0) ? Number.parseInt(id0) : id0,
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
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {device && !forceNew
            ? t('tracking.trackedDevices.modifyTitle', {
                name: device.label || device.id,
              })
            : t('tracking.trackedDevices.createTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup className="required">
          {/* TODD: or ID */}
          <ControlLabel>{t('tracking.trackedDevice.token')}</ControlLabel>
          <FormControl value={id} onChange={setId} required />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.label')}</ControlLabel>
          <FormControl value={label} onChange={setLabel} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.color')}</ControlLabel>
          <InputGroup>
            <FormControl value={color} onChange={setColor} />
            <InputGroup.Addon>HTML</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.width')}</ControlLabel>
          <InputGroup>
            <FormControl
              value={width}
              onChange={setWidth}
              type="number"
              min="1"
            />
            <InputGroup.Addon>px</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.fromTime')}</ControlLabel>
          <DateTime value={fromTime} onChange={setFromTime} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.maxAge')}</ControlLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={maxAge}
              onChange={setMaxAge}
            />
            <InputGroup.Addon>{t('general.minutes')}</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.trackedDevice.maxCount')}</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {t('tracking.trackedDevice.splitDistance')}
          </ControlLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={splitDistance}
              onChange={setSplitDistance}
            />
            <InputGroup.Addon>{t('general.meters')}</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {t('tracking.trackedDevice.splitDuration')}
          </ControlLabel>
          <InputGroup>
            <FormControl
              type="number"
              min="0"
              step="1"
              value={splitDuration}
              onChange={setSplitDuration}
            />
            <InputGroup.Addon>{t('general.minutes')}</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
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

const mapStateToProps = (state: RootState) => {
  let device: TrackedDevice | undefined;
  let forceNew = false;

  if (state.tracking.modifiedTrackedDeviceId != null) {
    device = state.tracking.trackedDevices.find(
      device => device.id === state.tracking.modifiedTrackedDeviceId,
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
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onCancel() {
    dispatch(trackingActions.modifyTrackedDevice(undefined));
  },
  onSave(device: TrackedDevice) {
    dispatch(trackingActions.saveTrackedDevice(device));
    dispatch(selectFeature({ type: 'tracking', id: device.id }));
  },
});

export const TrackedDeviceForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TrackedDeviceFormInt));
