import { useMessages } from '@features/l10n/l10nInjector.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { FaMapMarkerAlt, FaMapSigns } from 'react-icons/fa';

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
