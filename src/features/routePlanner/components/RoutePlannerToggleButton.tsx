import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapSigns } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setTool } from '@/app/store/actions.js';
import { LongPressTooltip } from '@/shared/components/LongPressTooltip.js';

export function RoutePlannerToggleButton(): ReactElement | undefined | false {
  const tool = useAppSelector((state) => state.main.tool);

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.routePlanner}>
      {({ props }) => (
        <Button
          {...props}
          disabled={tool === 'route-planner'}
          onClick={() => dispatch(setTool('route-planner'))}
        >
          <FaMapSigns />
        </Button>
      )}
    </LongPressTooltip>
  );
}
