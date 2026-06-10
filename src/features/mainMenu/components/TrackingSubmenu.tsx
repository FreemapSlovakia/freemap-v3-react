import { useMessages } from '@features/l10n/l10nInjector.js';
import { useTrackingMessages } from '@features/tracking/translations/useTrackingMessages.js';
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

  const tm = useTrackingMessages();

  const trackingDisplay = useAppSelector(
    (state) => state.tracking.showPoints + ',' + state.tracking.showLine,
  );

  return (
    <>
      <SubmenuHeader icon={<FaBullseye />} title={m?.tools.tracking} />

      <Dropdown.Item {...modalMenuItemProps('tracking-watched')}>
        <FaRegEye /> {tm?.trackedDevices.button} <kbd>g</kbd> <kbd>w</kbd>
      </Dropdown.Item>

      <Dropdown.Item {...modalMenuItemProps('tracking-my')}>
        <FaMobileAlt /> {tm?.devices.button} <kbd>g</kbd> <kbd>d</kbd>
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
        {tm?.visual.points}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="tracking-visual-01">
        {trackingDisplay === 'false,true' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {tm?.visual.line}
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="tracking-visual-11">
        {trackingDisplay === 'true,true' ? (
          <FaRegCheckCircle />
        ) : (
          <FaRegCircle />
        )}{' '}
        {tm?.visual['line+points']}
      </Dropdown.Item>
    </>
  );
}
