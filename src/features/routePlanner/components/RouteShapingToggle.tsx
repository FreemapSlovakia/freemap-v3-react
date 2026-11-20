import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { TbCircleDot } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { routePlannerSetShaping } from '../model/actions.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

/** Makes an inner waypoint a shaping point, or a real one again. */
export function RouteShapingToggle({
  index,
  shaping,
}: {
  index: number;
  shaping: boolean;
}): ReactElement {
  const dispatch = useDispatch();

  const rpm = useRoutePlannerMessages();

  return (
    <LongPressTooltip
      breakpoint="md"
      label={rpm?.shaping.label}
      hint={rpm?.shaping.hint}
    >
      {({ props, label, labelClassName }) => (
        <Button
          {...props}
          variant="outline-primary"
          active={shaping}
          onClick={() => {
            if (!shaping) {
              trackMatomo(['trackEvent', 'RoutePlanner', 'shaping']);
            }

            dispatch(routePlannerSetShaping({ index, shaping: !shaping }));
          }}
        >
          <TbCircleDot />
          <span className={labelClassName}>&ensp;{label}</span>
        </Button>
      )}
    </LongPressTooltip>
  );
}
