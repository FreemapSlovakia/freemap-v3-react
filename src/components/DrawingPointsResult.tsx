import {
  drawingPointChangePosition,
  drawingPointMeasure,
} from 'fm3/actions/drawingPointActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { colors } from 'fm3/constants';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { RootState } from 'fm3/storeCreator';
import { DragEndEvent, Point } from 'leaflet';
import { ReactElement, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { RichMarker } from './RichMarker';

const embed = window.self !== window.top;

export function DrawingPointsResult(): ReactElement {
  const dispatch = useDispatch();

  const interactive0 = useSelector(selectingModeSelector);

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
      {points.map(({ lat, lon, label }, i) => {
        const interactive = interactive0 || activeIndex === i;

        return (
          <RichMarker
            key={`${change}-${i}-${interactive ? 'a' : 'b'}`}
            eventHandlers={{
              dragstart: onSelects[i],
              dragend: handleDragEnd,
              drag: handleDrag,
              click: onSelects[i],
            }}
            position={{ lat, lng: lon }}
            color={activeIndex === i ? colors.selected : undefined}
            draggable={!embed && activeIndex === i}
            interactive={interactive}
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
        );
      })}
    </>
  );
}
