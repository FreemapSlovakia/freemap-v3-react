import { activeModeSelector } from '@app/store/selectors.js';
import {
  dataViewerDrawAppend,
  dataViewerDrawStart,
} from '@features/dataViewer/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isEventOnMap } from '@shared/mapUtils.js';
import { lineStyleToProperties } from '@shared/styleFromProperties.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { drawingMeasure } from '../model/actions/drawingPointActions.js';

export default function DrawingLinesTool(): null {
  const tool = useAppSelector(activeModeSelector);

  const drawing = useAppSelector((state) => state.trackViewer.drawing);

  const holeFor = useAppSelector((state) => state.trackViewer.holeFor);

  const count = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features.length ?? 0,
  );

  const style = useAppSelector((state) => state.drawingSettings.style);

  const dispatch = useDispatch();

  const handleMapClick = useCallback(
    ({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (
        // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
        window.preventMapClick ||
        !isEventOnMap(originalEvent)
      ) {
        return;
      }

      const position = [latlng.lng, latlng.lat];

      if (drawing) {
        // Appending needs no open tool: a "continue" never opened one.
        dispatch(dataViewerDrawAppend(position));
      } else if (holeFor !== null) {
        dispatch(dataViewerDrawStart({ ring: holeFor, position }));
      } else if (tool === 'draw-lines' || tool === 'draw-polygons') {
        const type = tool === 'draw-lines' ? 'line' : 'polygon';

        dispatch(
          dataViewerDrawStart({
            type,
            position,
            index: count,
            properties: lineStyleToProperties({}, { ...style, type }),
          }),
        );
      } else {
        return;
      }

      dispatch(drawingMeasure({}));
    },
    [drawing, holeFor, tool, count, style, dispatch],
  );

  useMapEvent('click', handleMapClick);

  return null;
}
