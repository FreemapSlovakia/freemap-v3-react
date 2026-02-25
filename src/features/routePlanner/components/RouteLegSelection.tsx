import { useMessages } from '@features/l10n/l10nInjector.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { FaMapMarkerAlt, FaMapSigns } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerSetPoint } from '../model/actions.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

export default RouteLegSelection;

export function RouteLegSelection(): ReactElement | undefined | false {
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

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    id !== undefined &&
    point && (
      <Selection
        icon={
          <>
            <FaMapSigns /> <FaMapMarkerAlt />
          </>
        }
        label={m?.routePlanner.leg}
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
