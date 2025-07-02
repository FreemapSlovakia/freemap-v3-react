import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBullseye,
  FaMobileAlt,
  FaPaintBrush,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegEye,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../../actions/trackingActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function TrackingSubmenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const trackingDisplay = useAppSelector(
    (state) => state.tracking.showPoints + ',' + state.tracking.showLine,
  );

  return (
    <>
      <SubmenuHeader icon={<FaBullseye />} title={m?.tools.tracking} />

      <Dropdown.Item
        href="#show=tracking-watched"
        eventKey="modal-tracking-watched"
      >
        <FaRegEye /> {m?.tracking.trackedDevices.button}
      </Dropdown.Item>

      <Dropdown.Item href="#show=tracking-my" eventKey="modal-tracking-my">
        <FaMobileAlt /> {m?.tracking.devices.button}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <FaPaintBrush /> {m?.general.visual}
      </Dropdown.Header>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(trackingActions.setShowPoints(true));

          dispatch(trackingActions.setShowLine(false));
        }}
      >
        {trackingDisplay === 'true,false' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {m?.tracking.visual.points}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(trackingActions.setShowPoints(false));

          dispatch(trackingActions.setShowLine(true));
        }}
      >
        {trackingDisplay === 'false,true' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {m?.tracking.visual.line}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={() => {
          dispatch(trackingActions.setShowPoints(true));

          dispatch(trackingActions.setShowLine(true));
        }}
      >
        {trackingDisplay === 'true,true' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {m?.tracking.visual['line+points']}
      </Dropdown.Item>
    </>
  );
}
