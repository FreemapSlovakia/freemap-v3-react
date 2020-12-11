import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { DrawingLineResult } from './DrawingLineResult';
import { RootState } from 'fm3/storeCreator';
import { LeafletMouseEvent } from 'leaflet';
import { drawingLineAddPoint } from 'fm3/actions/drawingLineActions';
import { drawingPointMeasure } from 'fm3/actions/drawingPointActions';
import { useMapEvent } from 'react-leaflet';

export function DrawingLinesResult(): ReactElement {
  const lines = useSelector((state: RootState) => state.drawingLines.lines);

  const selection = useSelector((state: RootState) => state.main.selection);

  const linePoints = useSelector((state: RootState) =>
    (state.main.selection?.type !== 'draw-lines' &&
      state.main.selection?.type !== 'draw-polygons') ||
    state.main.selection.id === undefined
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
        ) ||
        (selection?.type !== 'draw-lines' &&
          selection?.type !== 'draw-polygons')
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
          index: selection?.id,
          point: { lat: latlng.lat, lon: latlng.lng, id },
          position: pos,
          type: selection?.type === 'draw-lines' ? 'line' : 'polygon',
        }),
      );

      dispatch(drawingPointMeasure(true));
    },
    [selection, linePoints, dispatch],
  );

  useMapEvent('click', handleMapClick);

  return (
    <>
      {lines.map((_, i) => (
        <DrawingLineResult key={i} index={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}
