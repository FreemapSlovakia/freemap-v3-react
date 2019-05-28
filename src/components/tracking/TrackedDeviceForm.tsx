import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import DateTime from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import { ITrackedDevice } from 'fm3/types/trackingTypes';

interface Props {
  onCancel: () => void;
  onSave: (device: ITrackedDevice) => void;
  device: ITrackedDevice;
}

const TrackedDeviceForm: React.FC<Props> = ({ onSave, onCancel, device }) => {
  const [id, setId] = useTextInputState((device && device.id.toString()) || '');
  const [label, setLabel] = useTextInputState((device && device.label) || '');
  const [color, setColor] = useTextInputState((device && device.color) || '');
  const [width, setWidth] = useTextInputState(
    device && typeof device.width === 'number' ? device.width.toString() : '',
  );
  const [fromTime, setFromTime] = React.useState(
    device && device.fromTime ? toDatetimeLocal(device.fromTime) : '',
  );
  const [maxCount, setMaxCount] = useTextInputState(
    device && typeof device.maxCount === 'number'
      ? device.maxCount.toString()
      : '',
  );
  const [maxAge, setMaxAge] = useTextInputState(
    device && typeof device.maxAge === 'number' ? device.maxAge.toString() : '',
  );
  const [splitDistance, setSplitDistance] = useTextInputState(
    device && typeof device.splitDistance === 'number'
      ? device.splitDistance.toString()
      : '',
  );
  const [splitDuration, setSplitDuration] = useTextInputState(
    device && typeof device.splitDuration === 'number'
      ? device.splitDuration.toString()
      : '',
  );

  const handleSubmit = e => {
    e.preventDefault();
    const id0 = id.trim();
    onSave({
      id: /^\d+$/.test(id0) ? Number.parseInt(id0) : id0,
      label: label.trim() || null,
      color: color.trim() || null,
      fromTime: fromTime === '' ? null : new Date(fromTime),
      maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10),
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
          <FontAwesomeIcon icon="bullseye" />
          {device ? (
            <>
              {' '}
              Modify Watched Device <i>{device.label || device.id}</i>
            </>
          ) : (
            ' Add Watched Device'
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          {/* TODD: or ID */}
          <ControlLabel>Watch Token of existing shared device</ControlLabel>
          <FormControl value={id} onChange={setId} required />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Label</ControlLabel>
          <FormControl value={label} onChange={setLabel} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Color (HTML)</ControlLabel>
          <FormControl value={color} onChange={setColor} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Width (px)</ControlLabel>
          <FormControl
            value={width}
            onChange={setWidth}
            type="number"
            min="1"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show positions since</ControlLabel>
          <DateTime value={fromTime} onChange={setFromTime} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show positions not older than (seconds)</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxAge}
            onChange={setMaxAge}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show max # positions</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Split track at segments longer than (m)</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={splitDistance}
            onChange={setSplitDistance}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Split track on pauses longer than (minutes)
          </ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={splitDuration}
            onChange={setSplitDuration}
          />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">OK</Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </form>
  );
};

export default connect(
  (state: any) => ({
    device:
      state.tracking.modifiedTrackedDeviceId &&
      state.tracking.trackedDevices.find(
        device => device.id === state.tracking.modifiedTrackedDeviceId,
      ),
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackingActions.modifyTrackedDevice(undefined));
    },
    onSave(device) {
      dispatch(trackingActions.saveTrackedDevice(device));
    },
  }),
)(TrackedDeviceForm);
