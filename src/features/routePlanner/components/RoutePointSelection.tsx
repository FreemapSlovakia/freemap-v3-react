import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';

export default function RoutePointSelection():
  | ReactElement
  | undefined
  | false {
  const point = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.routePlanner.points[state.main.selection.id]
      : undefined,
  );

  const rpm = useRoutePlannerMessages();

  return (
    point && (
      <Selection
        icon={
          <>
            <RoutePlannerToggleButton /> <FaMapMarkerAlt />
          </>
        }
        label={rpm?.point.point}
        deletable
        noLeftMargin
      />
    )
  );
}
