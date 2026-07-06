import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerSetPoint } from '../model/actions.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

export default function RouteLegSelection(): ReactElement | undefined | false {
  const id = useAppSelector((state) =>
    state.main.selection?.type === 'route-leg'
      ? state.main.selection.id
      : undefined,
  );

  const point = useAppSelector((state) =>
    state.main.selection?.type === 'route-leg'
      ? state.routePlanner.points[state.main.selection.id]
      : undefined,
  );

  const canBeManual = useAppSelector(
    (state) =>
      state.main.selection?.type === 'route-leg' &&
      state.routePlanner.mode === 'route',
  );

  const rpm = useRoutePlannerMessages();

  const dispatch = useDispatch();

  return (
    id !== undefined &&
    point && (
      <Selection
        icon={
          <>
            <RoutePlannerToggleButton /> <FaMapMarkerAlt />
          </>
        }
        label={rpm?.leg}
        deletable
        noLeftMargin
      >
        {canBeManual && (
          <RoutePlannerTransportType
            withDefault
            value={point.transport}
            onChange={(transport) => {
              dispatch(
                routePlannerSetPoint({
                  point: { ...point, transport },
                  position: id,
                  preventSelect: true,
                }),
              );
            }}
          />
        )}
      </Selection>
    )
  );
}
