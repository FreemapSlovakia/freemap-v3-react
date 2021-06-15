import { drawingLineAddPoint } from 'fm3/actions/drawingLineActions';
import { drawingMeasure } from 'fm3/actions/drawingPointActions';
import { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

export function DrawingLinesTool(): null {
  const selection = useSelector((state) => state.main.selection);

  const tool = useSelector((state) => state.main.tool);

  const linePoints = useSelector((state) =>
    state.main.selection?.type !== 'draw-line-poly'
      ? []
      : state.drawingLines.lines[state.main.selection.id].points,
  );

  const dispatch = useDispatch();

  const handleMapClick = useCallback(
    ({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (
        // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
        window.preventMapClick ||
        !(
          originalEvent.target instanceof HTMLDivElement &&
          originalEvent.target.classList.contains('leaflet-container')
        )
      ) {
        return;
      }

      const pos = linePoints.length;

      let id: number;

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
          point: { lat: latlng.lat, lon: latlng.lng, id },
          position: pos,
          type: tool === 'draw-lines' ? 'line' : 'polygon',
        }),
      );

      dispatch(drawingMeasure({}));
    },
    [linePoints, dispatch, selection, tool],
  );

  useMapEvent('click', handleMapClick);

  return null;
}
