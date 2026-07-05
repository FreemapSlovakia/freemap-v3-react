import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isEventOnMap } from '@shared/mapUtils.js';
import type { LeafletMouseEvent } from 'leaflet';
import { useCallback } from 'react';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { activeModeSelector } from '@/app/store/selectors.js';
import {
  drawingLineAddPoint,
  type Point,
} from '../model/actions/drawingLineActions.js';
import { drawingMeasure } from '../model/actions/drawingPointActions.js';

const EMPTY: Point[] = [];

export default function DrawingLinesTool(): null {
  const selection = useAppSelector((state) => state.main.selection);

  const tool = useAppSelector(activeModeSelector);

  const linePoints = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id].points
      : EMPTY,
  );

  const drawing = useAppSelector((state) => state.drawingLines.drawing);

  const dispatch = useDispatch();

  const color = useAppSelector((state) => state.drawingSettings.style.color);

  const fillColor = useAppSelector(
    (state) => state.drawingSettings.style.fillColor,
  );

  const width = useAppSelector((state) => state.drawingSettings.style.width);

  const dashArray = useAppSelector(
    (state) => state.drawingSettings.style.dashArray,
  );

  const lineCap = useAppSelector(
    (state) => state.drawingSettings.style.lineCap,
  );

  const lineJoin = useAppSelector(
    (state) => state.drawingSettings.style.lineJoin,
  );

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

      // Append to the current line only while a drawing is in progress; a click
      // on a merely-selected (stopped) line starts a fresh line instead.
      const appending = drawing && selection?.type === 'draw-line-poly';

      const lineIndex = appending ? selection.id : undefined;

      // Starting a new line needs an active draw tool; appending does not (the
      // tool may have been deactivated, or a "continue" never activated one).
      if (
        lineIndex === undefined &&
        tool !== 'draw-lines' &&
        tool !== 'draw-polygons'
      ) {
        return;
      }

      const points = appending ? linePoints : EMPTY;

      const pos = points.length;

      const id = pos === 0 ? 0 : points[pos - 1].id + 1;

      dispatch(
        lineIndex === undefined
          ? drawingLineAddPoint({
              lineProps: {
                type: tool === 'draw-lines' ? 'line' : 'polygon',
                color,
                fillColor: tool === 'draw-lines' ? undefined : fillColor,
                width,
                dashArray: dashArray,
                lineCap,
                lineJoin,
              },
              point: { lat: latlng.lat, lon: latlng.lng, id },
              position: pos,
              indexOfLineToSelect: linesLength,
              drawing: true,
            })
          : drawingLineAddPoint({
              lineIndex,
              point: { lat: latlng.lat, lon: latlng.lng, id },
              position: pos,
              indexOfLineToSelect: lineIndex,
              drawing: true,
            }),
      );

      dispatch(drawingMeasure({}));
    },
    [
      linePoints,
      drawing,
      dispatch,
      selection,
      tool,
      color,
      fillColor,
      width,
      dashArray,
      lineCap,
      lineJoin,
      linesLength,
    ],
  );

  useMapEvent('click', handleMapClick);

  return null;
}
