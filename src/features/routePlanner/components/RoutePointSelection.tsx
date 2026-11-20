import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RouteDepartureControl } from './RouteDepartureControl.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';
import { RouteShapingToggle } from './RouteShapingToggle.js';
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

  // A stop or shaping holds between two legs: only on an inner waypoint of a
  // route through the points in order.
  const inner = useAppSelector(
    (state) =>
      index !== undefined &&
      index > 0 &&
      index < state.routePlanner.points.length - 1 &&
      state.routePlanner.mode === 'route',
  );

  // A lone finish has no departure, and an isochrone takes no time of day.
  const start = useAppSelector(
    (state) =>
      index === 0 &&
      !state.routePlanner.finishOnly &&
      state.routePlanner.mode !== 'isochrone',
  );

  const rpm = useRoutePlannerMessages();

  const shaping = inner && Boolean(point?.shaping);

  return (
    point &&
    index !== undefined && (
      <Selection
        control={<RoutePlannerToggleButton />}
        icon={<FaMapMarkerAlt />}
        label={rpm?.point.point}
        deletable
      >
        {start && <RouteDepartureControl />}

        {inner && <RouteShapingToggle index={index} shaping={shaping} />}

        {inner && !shaping && (
          <RouteStopControl index={index} stop={point.stop} />
        )}

        <PlaceActionsButton lat={point.lat} lon={point.lon} selection />
      </Selection>
    )
  );
}
