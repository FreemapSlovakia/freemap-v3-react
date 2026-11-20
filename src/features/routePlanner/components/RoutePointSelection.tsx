import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';
import { RouteStopControl } from './RouteStopControl.js';

export default function RoutePointSelection():
  | ReactElement
  | undefined
  | false {
  const index = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.main.selection.id
      : undefined,
  );

  const point = useAppSelector((state) =>
    index === undefined ? undefined : state.routePlanner.points[index],
  );

  // A stop holds the route between two legs: only on an inner waypoint of a
  // route through the points in order.
  const inner = useAppSelector(
    (state) =>
      index !== undefined &&
      index > 0 &&
      index < state.routePlanner.points.length - 1 &&
      state.routePlanner.mode === 'route',
  );

  const rpm = useRoutePlannerMessages();

  return (
    point &&
    index !== undefined && (
      <Selection
        control={<RoutePlannerToggleButton />}
        icon={<FaMapMarkerAlt />}
        label={rpm?.point.point}
        deletable
      >
        {inner && <RouteStopControl index={index} stop={point.stop} />}

        <PlaceActionsButton lat={point.lat} lon={point.lon} selection />
      </Selection>
    )
  );
}
