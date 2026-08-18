import {
  drawingPointAdd,
  drawingPointChangePosition,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  CENTER_ICON,
  CENTER_LABEL,
  CENTER_PROP,
  CENTER_PROP_VALUE,
  toposcopeCenterSelector,
} from '../centerPoint.js';
import { toposcopeSetPickingCenter } from '../model/actions.js';

/**
 * Takes the click that says where the dial stands. The centre is an ordinary
 * drawn point — created here when there is none, moved when there is — so
 * labelling, styling and deleting it happen in the drawing tool afterwards.
 */
export default function ToposcopeCenterPicking(): null {
  const dispatch = useDispatch();

  const centerIndex = useAppSelector(
    (state) => toposcopeCenterSelector(state)?.index,
  );

  const pointCount = useAppSelector(
    (state) => state.drawingPoints.points.length,
  );

  const color = useAppSelector((state) => state.drawingSettings.style.color);

  const markerType = useAppSelector(
    (state) => state.drawingSettings.style.markerType,
  );

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        const coords = { lat: latlng.lat, lon: latlng.lng };

        if (centerIndex !== undefined) {
          dispatch(drawingPointChangePosition({ index: centerIndex, coords }));
        } else {
          dispatch(
            drawingPointAdd({
              coords,
              color,
              markerType,
              icon: CENTER_ICON,
              label: CENTER_LABEL,
              props: { [CENTER_PROP]: CENTER_PROP_VALUE },
              id: pointCount,
            }),
          );
        }

        dispatch(toposcopeSetPickingCenter(false));
      },
      [dispatch, centerIndex, pointCount, color, markerType],
    ),
  );

  return null;
}
