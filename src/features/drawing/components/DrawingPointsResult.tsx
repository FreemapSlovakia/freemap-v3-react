import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import Color from 'color';
import { DragEndEvent, LeafletEvent } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  drawingMeasure,
  drawingPointChangePosition,
} from '../model/actions/drawingPointActions.js';

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
      if (activeIndex !== null) {
        // see https://github.com/PaulLeCam/react-leaflet/issues/981
        const { latlng } = e as unknown as {
          latlng: { lat: number; lng: number };
        };

        dispatch(
          drawingPointChangePosition({
            index: activeIndex,
            coords: {
              lat: latlng.lat,
              lon: latlng.lng,
            },
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
            coords: {
              lat: coords.lat,
              lon: coords.lng,
            },
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
      {points.map(({ coords, label, color }, i) => {
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
            position={{ lat: coords.lat, lng: coords.lon }}
            color={
              activeIndex === i
                ? Color(color || COLORS.normal)
                    .lighten(0.75)
                    .hex()
                : color || COLORS.normal
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
