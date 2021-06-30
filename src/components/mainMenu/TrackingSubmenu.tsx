import { Modal, setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, SyntheticEvent, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaBullseye,
  FaMobileAlt,
  FaPaintBrush,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegEye,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function TrackingSubmenu(): ReactElement {
  const closeMenu = useMenuClose();

  const dispatch = useDispatch();

  const m = useMessages();

  const trackingDisplay = useSelector(
    (state) => state.tracking.showPoints + ',' + state.tracking.showLine,
  );

  const showModal = useCallback(
    (modal: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<Modal>(modal)) {
        dispatch(setActiveModal(modal));
      }
    },
    [closeMenu, dispatch],
  );

  return (
    <>
      <SubmenuHeader icon={<FaBullseye />} title={m?.tools.tracking} />

      <Dropdown.Item
        href="?show=tracking-watched"
        eventKey="tracking-watched"
        onSelect={showModal}
      >
        <FaRegEye /> {m?.tracking.trackedDevices.button}
      </Dropdown.Item>

      <Dropdown.Item
        href="?show=tracking-my"
        eventKey="tracking-my"
        onSelect={showModal}
      >
        <FaMobileAlt /> {m?.tracking.devices.button}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Header>
        <FaPaintBrush /> {m?.general.visual}
      </Dropdown.Header>

      <Dropdown.Item
        as="button"
        active={trackingDisplay === 'true,false'}
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
        active={trackingDisplay === 'false,true'}
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
        active={trackingDisplay === 'true,true'}
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
