import { type ReactElement } from 'react';
import { FaMapMarkerAlt, FaMapSigns } from 'react-icons/fa';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';

export default RoutePointSelection;

export function RoutePointSelection(): ReactElement | undefined | false {
  const point = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.routePlanner.points[state.main.selection.id]
      : undefined,
  );

  const m = useMessages();

  return (
    point && (
      <Selection
        icon={
          <>
            <FaMapSigns /> <FaMapMarkerAlt />
          </>
        }
        label={m?.routePlanner.point.point}
        deletable
      />
    )
  );
}
