import { drawingLineAddPoint } from 'fm3/actions/drawingLineActions';
import { drawingMeasure } from 'fm3/actions/drawingPointActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { isEventOnMap } from 'fm3/mapUtils';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export default DrawingLinesTool;

export function DrawingLinesTool(): null {
  const selection = useAppSelector((state) => state.main.selection);

  const tool = useAppSelector((state) => state.main.tool);

  const linePoints = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id].points
      : [],
  );

  const dispatch = useDispatch();

  const color = useAppSelector((state) => state.main.drawingColor);

  const width = useAppSelector((state) => state.main.drawingWidth);

  const handleMapClick = useCallback(
    ({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (
        // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
        window.preventMapClick ||
        !isEventOnMap(originalEvent)
      ) {
        return;
      }

      const pos = linePoints.length;

      let id;

      if (pos === 0) {
        id = linePoints.length ? linePoints[pos].id - 1 : 0;
      } else if (pos === linePoints.length) {
        id = linePoints[pos - 1].id + 1;
      } else {
        id = (linePoints[pos - 1].id + linePoints[pos].id) / 2;
      }

      dispatch(
        drawingLineAddPoint({
          index:
            selection?.type === 'draw-line-poly' ? selection.id : undefined,
          color,
          width,
          point: { lat: latlng.lat, lon: latlng.lng, id },
          position: pos,
          type: tool === 'draw-lines' ? 'line' : 'polygon',
        }),
      );

      dispatch(drawingMeasure({}));
    },
    [linePoints, dispatch, selection, tool, color, width],
  );

  useMapEvent('click', handleMapClick);

  return null;
}
