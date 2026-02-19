import { type ReactElement } from 'react';
import { FaMapMarkerAlt, FaMapSigns } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerSetPoint } from '../actions/routePlannerActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';
import RoutePlannerTransportType from './RoutePlannerTransportType.js';

export default RoutePointSelection;

export function RoutePointSelection(): ReactElement | undefined | false {
  const id = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.main.selection.id
      : undefined,
  );

  const point = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.routePlanner.points[state.main.selection.id]
      : undefined,
  );

  const canBeManual = useAppSelector(
    (state) =>
      state.main.selection?.type === 'route-point' &&
      state.routePlanner.mode === 'route' &&
      state.main.selection.id < state.routePlanner.points.length - 1,
  );

  const m = useMessages();

  const becomePremium = useBecomePremium();

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
        label={m?.routePlanner.point.point}
        deletable
      >
        {canBeManual && (
          <RoutePlannerTransportType
            value={point.transport}
            onChange={(transport) => {
              dispatch(
                routePlannerSetPoint({
                  point: { ...point, transport },
                  position: id,
                }),
              );
            }}
          />

          // <Form.Check
          //   className="ms-2 align-self-center"
          //   checked={point.manual}
          //   label={
          //     <>
          //       <span title={m?.routePlanner.manualTooltip}>
          //         {m?.routePlanner.manual}
          //       </span>

          //       <FaGem
          //         className="ms-1 text-warning"
          //         title={becomePremium ? m?.premium.premiumOnly : undefined}
          //         onClick={becomePremium}
          //       />
          //     </>
          //   }
          //   id="manual"
          //   disabled={!!becomePremium}
          //   onChange={(e) =>
          //     dispatch(
          //       routePlannerSetPoint({
          //         point: { ...point, manual: e.currentTarget.checked },
          //         position: id,
          //       }),
          //     )
          //   }
          // />
        )}
      </Selection>
    )
  );
}
