import { useMessages } from '@features/l10n/l10nInjector.js';
import { Kbd, Menu } from '@mantine/core';
import { useMenuSelect } from '@shared/components/menuSelectContext.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
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

  const select = useMenuSelect();

  return (
    <>
      <SubmenuHeader icon={<FaBullseye />} title={m?.tools.tracking} />

      <Menu.Item
        component="a"
        href="#show=tracking-watched"
        leftSection={<FaRegEye />}
        rightSection={
          <>
            <Kbd>g</Kbd> <Kbd>w</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-tracking-watched');
        }}
      >
        {m?.tracking.trackedDevices.button}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=tracking-my"
        leftSection={<FaMobileAlt />}
        rightSection={
          <>
            <Kbd>g</Kbd> <Kbd>d</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-tracking-my');
        }}
      >
        {m?.tracking.devices.button}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Label>
        <FaPaintBrush /> {m?.general.visual}
      </Menu.Label>

      <Menu.Item
        leftSection={
          trackingDisplay === 'true,false' ? (
            <FaRegCheckCircle />
          ) : (
            <FaRegCircle />
          )
        }
        onClick={() => select('tracking-visual-10')}
      >
        {m?.tracking.visual.points}
      </Menu.Item>

      <Menu.Item
        leftSection={
          trackingDisplay === 'false,true' ? (
            <FaRegCheckCircle />
          ) : (
            <FaRegCircle />
          )
        }
        onClick={() => select('tracking-visual-01')}
      >
        {m?.tracking.visual.line}
      </Menu.Item>

      <Menu.Item
        leftSection={
          trackingDisplay === 'true,true' ? (
            <FaRegCheckCircle />
          ) : (
            <FaRegCircle />
          )
        }
        onClick={() => select('tracking-visual-11')}
      >
        {m?.tracking.visual['line+points']}
      </Menu.Item>
    </>
  );
}
