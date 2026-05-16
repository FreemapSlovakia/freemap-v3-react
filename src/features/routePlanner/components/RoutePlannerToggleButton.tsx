import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { FaMapSigns } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setTool } from '@/app/store/actions.js';
import { MantineLongPressTooltip } from '@/shared/components/MantineLongPressTooltip.js';

export function RoutePlannerToggleButton(): ReactElement | undefined | false {
  const tool = useAppSelector((state) => state.main.tool);

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <MantineLongPressTooltip label={m?.tools.routePlanner}>
      {({ props }) => (
        <ActionIcon
          variant="filled"
          size="input-sm"
          {...props}
          disabled={tool === 'route-planner'}
          onClick={() => dispatch(setTool('route-planner'))}
        >
          <FaMapSigns />
        </ActionIcon>
      )}
    </MantineLongPressTooltip>
  );
}
