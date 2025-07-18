import { type ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMapSigns } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerSetPoint } from '../actions/routePlannerActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';

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
        label={m?.routePlanner.point.point}
        deletable
      >
        <Form.Check
          className="ms-2"
          checked={!!point.manual}
          label="Manual"
          id="manual"
          onChange={(e) =>
            dispatch(
              routePlannerSetPoint({
                point: { ...point, manual: e.currentTarget.checked },
                position: id,
              }),
            )
          }
        />
      </Selection>
    )
  );
}
