import { dataViewerAddFeatures } from '@features/dataViewer/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { pointStyleToProperties } from '@shared/styleFromProperties.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { drawingMeasure } from '../model/actions/drawingPointActions.js';

export function DrawingPointsTool(): null {
  const color = useAppSelector((state) => state.drawingSettings.style.color);

  const markerType = useAppSelector(
    (state) => state.drawingSettings.style.markerType,
  );

  const dispatch = useDispatch();

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        dispatch(
          dataViewerAddFeatures({
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [latlng.lng, latlng.lat],
                },
                properties: pointStyleToProperties(
                  {},
                  { color, markerType, icon: undefined },
                ),
              },
            ],
            select: true,
          }),
        );

        dispatch(drawingMeasure({}));
      },
      [dispatch, color, markerType],
    ),
  );

  return null;
}
