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
import { modalMenuItemProps } from '@/shared/hooks/useMenuHandler.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function TrackingSubmenu(): ReactElement {
  const m = useMessages();

  const trackingDisplay = useAppSelector(
    (state) => state.tracking.showPoints + ',' + state.tracking.showLine,
  );

  return (
    <>
      <SubmenuHeader icon={<FaBullseye />} title={m?.tools.tracking} />

      <Dropdown.Item {...modalMenuItemProps('tracking-watched')}>
        <FaRegEye /> {m?.tracking.trackedDevices.button} <kbd>g</kbd>{' '}
        <kbd>w</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('tracking-my')}>
        <FaMobileAlt /> {m?.tracking.devices.button} <kbd>g</kbd> <kbd>d</kbd>
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
