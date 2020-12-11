import React, { useCallback, useMemo, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, useMapEvent } from 'react-leaflet';

import {
  drawingPointAdd,
  drawingPointChangePosition,
} from 'fm3/actions/drawingPointActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { RootState } from 'fm3/storeCreator';
import { Point, DragEndEvent, LeafletMouseEvent } from 'leaflet';
import { selectFeature } from 'fm3/actions/mainActions';
import { drawingPointMeasure } from 'fm3/actions/drawingPointActions';
import { colors } from 'fm3/constants';

export function DrawingPointsResult(): ReactElement {
  const dispatch = useDispatch();

  const selection = useSelector((state: RootState) => state.main.selection);

  const handlePoiAdd = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      const tool = selection?.type;

      if (tool === 'draw-points') {
        dispatch(
          drawingPointAdd({ lat: latlng.lat, lon: latlng.lng, label: '' }),
        );
        dispatch(drawingPointMeasure(true));
        return;
      }
    },
    [selection?.type, dispatch],
  );

  useMapEvent('click', handlePoiAdd);

  const activeIndex = useSelector((state: RootState) =>
    state.main.selection?.type === 'draw-points'
      ? state.main.selection.id ?? null
      : null,
  );

  const handleDrag = useCallback(
    ({ latlng: { lat, lng: lon } }) => {
      if (activeIndex !== null) {
        dispatch(drawingPointChangePosition({ index: activeIndex, lat, lon }));
        dispatch(drawingPointMeasure(false));
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
        dispatch(drawingPointMeasure(true));
      }
    },
    [activeIndex, dispatch],
  );

  const points = useSelector((state: RootState) => state.drawingPoints.points);

  const onSelects = useMemo(
    () =>
      new Array(points.length).fill(0).map((_, id) => () => {
        if (id !== activeIndex) {
          dispatch(selectFeature({ type: 'draw-points', id }));
          dispatch(drawingPointMeasure(true));
        }
      }),
    [points.length, activeIndex, dispatch],
  );

  const change = useSelector((state: RootState) => state.drawingPoints.change);

  return (
    <>
      {points.map(({ lat, lon, label }, i) => (
        <RichMarker
          key={`${change}-${i}`}
          faIconLeftPadding="2px"
          eventHandlers={{
            dragstart: onSelects[i],
            dragend: handleDragEnd,
            drag: handleDrag,
            click: onSelects[i],
          }}
          position={{ lat, lng: lon }}
          color={activeIndex === i ? colors.selected : undefined}
          draggable
        >
          {label && (
            <Tooltip
              className="compact"
              offset={new Point(0, -36)}
              direction="top"
              permanent
            >
              <span>{label}</span>
            </Tooltip>
          )}
        </RichMarker>
      ))}
    </>
  );
}
