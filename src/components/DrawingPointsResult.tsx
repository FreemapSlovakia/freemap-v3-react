import Color from 'color';
import { DragEndEvent, LeafletEvent } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import {
  drawingMeasure,
  drawingPointChangePosition,
} from '../actions/drawingPointActions.js';
import { selectFeature } from '../actions/mainActions.js';
import { colors } from '../constants.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { selectingModeSelector } from '../selectors/mainSelectors.js';
import { RichMarker } from './RichMarker.js';

export function DrawingPointsResult(): ReactElement {
  const dispatch = useDispatch();

  const interactive0 = useAppSelector(selectingModeSelector);

  const activeIndex = useAppSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? (state.main.selection.id ?? null)
      : null,
  );

  const handleMove = useCallback(
    (e: LeafletEvent) => {
      if (
        activeIndex !== null &&
        // see https://github.com/PaulLeCam/react-leaflet/issues/981
        is<{ latlng: { lat: number; lng: number } }>(e)
      ) {
        dispatch(
          drawingPointChangePosition({
            index: activeIndex,
            lat: e.latlng.lat,
            lon: e.latlng.lng,
          }),
        );

        dispatch(drawingMeasure({ elevation: false }));
      }
    },
    [activeIndex, dispatch],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      if (activeIndex !== null) {
        const coords = e.target.getLatLng();

        dispatch(
          drawingPointChangePosition({
            index: activeIndex,
            lat: coords.lat,
            lon: coords.lng,
          }),
        );

        dispatch(drawingMeasure({}));
      }
    },
    [activeIndex, dispatch],
  );

  const points = useAppSelector((state) => state.drawingPoints.points);

  const onSelects = useMemo(
    () =>
      new Array(points.length).fill(0).map((_, id) => () => {
        if (id !== activeIndex) {
          dispatch(selectFeature({ type: 'draw-points', id }));

          dispatch(drawingMeasure({}));
        }
      }),
    [points.length, activeIndex, dispatch],
  );

  const change = useAppSelector((state) => state.drawingPoints.change);

  return (
    <>
      {points.map(({ lat, lon, label, color }, i) => {
        const interactive = interactive0 || activeIndex === i;

        return (
          <RichMarker
            key={`${change}-${i}-${interactive ? 'a' : 'b'}`}
            eventHandlers={{
              dragstart: onSelects[i],
              dragend: handleDragEnd,
              move: handleMove,
              click: onSelects[i],
            }}
            position={{ lat, lng: lon }}
            color={
              activeIndex === i
                ? Color(color || colors.normal)
                    .lighten(0.75)
                    .hex()
                : color || colors.normal
            }
            draggable={!window.fmEmbedded && activeIndex === i}
            interactive={interactive}
          >
            {label && (
              <Tooltip className="compact" direction="top" permanent>
                <span>{label}</span>
              </Tooltip>
            )}
          </RichMarker>
        );
      })}
    </>
  );
}
