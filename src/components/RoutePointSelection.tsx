import { type ReactElement } from 'react';
import { FaMapSigns } from 'react-icons/fa';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { Selection } from './Selection.js';

export default RoutePointSelection;

export function RoutePointSelection(): ReactElement | undefined {
  const point = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.routePlanner.points[state.main.selection.id]
      : undefined,
  );

  return (
    point && <Selection icon={<FaMapSigns />} label="Route point" deletable />
  );
}
