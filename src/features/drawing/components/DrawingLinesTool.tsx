import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  type Point,
  drawingLineAddPoint,
} from '../model/actions/drawingLineActions.js';
import { drawingMeasure } from '../model/actions/drawingPointActions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { isEventOnMap } from '../../../mapUtils.js';

export default DrawingLinesTool;

const EMPTY: Point[] = [];

export function DrawingLinesTool(): null {
  const selection = useAppSelector((state) => state.main.selection);

  const tool = useAppSelector((state) => state.main.tool);

  const linePoints = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id].points
      : EMPTY,
  );

  const dispatch = useDispatch();

  const color = useAppSelector((state) => state.main.drawingColor);

  const width = useAppSelector((state) => state.main.drawingWidth);

  const linesLength = useAppSelector(
    (state) => state.drawingLines.lines.length,
  );

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

      const lineIndex =
        selection?.type === 'draw-line-poly' ? selection.id : undefined;

      dispatch(
        lineIndex === undefined
          ? drawingLineAddPoint({
              lineProps: {
                type: tool === 'draw-lines' ? 'line' : 'polygon',
                color,
                width,
              },
              point: { lat: latlng.lat, lon: latlng.lng, id },
              position: pos,
              indexOfLineToSelect: linesLength,
            })
          : drawingLineAddPoint({
              lineIndex,
              point: { lat: latlng.lat, lon: latlng.lng, id },
              position: pos,
              indexOfLineToSelect: lineIndex,
            }),
      );

      dispatch(drawingMeasure({}));
    },
    [linePoints, dispatch, selection, tool, color, width, linesLength],
  );

  useMapEvent('click', handleMapClick);

  return null;
}
