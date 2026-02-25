import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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
import { SubmenuHeader } from './SubmenuHeader.js';

export function TrackingSubmenu(): ReactElement {
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

      <Dropdown.Item as="button" eventKey="tracking-visual-10">
        {trackingDisplay === 'true,false' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {m?.tracking.visual.points}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="tracking-visual-01">
        {trackingDisplay === 'false,true' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {m?.tracking.visual.line}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="tracking-visual-11">
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
