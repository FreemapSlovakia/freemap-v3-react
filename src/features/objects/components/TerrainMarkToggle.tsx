import {
  GENEROUS_MARGIN_PX,
  panToUncovered,
} from '@features/map/panToUncovered.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  objectsTerrainMark,
  type TerrainMark,
  type TerrainMarkKind,
} from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = {
  kind: TerrainMarkKind;
  mark: TerrainMark;
  className?: string;
};

/** Marks a point on the map, bringing it into view, or takes the mark off. */
export function TerrainMarkToggle({
  kind,
  mark,
  className,
}: Props): ReactElement {
  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const shown = useAppSelector(
    (state) => state.objects.marks[kind]?.osmId === mark.osmId,
  );

  return (
    <LongPressTooltip label={om?.terrain.showOnMap}>
      {({ props }) => (
        <Button
          variant={shown ? 'primary' : 'outline-primary'}
          active={shown}
          size="sm"
          className={className}
          onClick={() => {
            dispatch(objectsTerrainMark({ kind, mark: shown ? null : mark }));

            if (!shown) {
              trackMatomo([
                'trackEvent',
                'Objects',
                'showTerrainMark',
                `${mark.poi}-${kind}`,
              ]);

              void panToUncovered(dispatch, mark, {
                ifHidden: true,
                margin: GENEROUS_MARGIN_PX,
              });
            }
          }}
          {...props}
        >
          <FaMapMarkerAlt />
        </Button>
      )}
    </LongPressTooltip>
  );
}
