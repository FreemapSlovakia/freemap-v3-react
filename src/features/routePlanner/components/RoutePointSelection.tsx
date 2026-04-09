import { useMessages } from '@features/l10n/l10nInjector.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';

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
            <RoutePlannerToggleButton /> <FaMapMarkerAlt />
          </>
        }
        label={m?.routePlanner.point.point}
        deletable
        noLeftMargin
      />
    )
  );
}
