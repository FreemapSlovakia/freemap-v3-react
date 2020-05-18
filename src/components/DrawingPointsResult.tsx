import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { drawingPointChangePosition } from 'fm3/actions/drawingPointActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { Point, DragEndEvent } from 'leaflet';
import { selectFeature } from 'fm3/actions/mainActions';
import { drawingPointMeasure } from 'fm3/actions/drawingPointActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const DrawingPointsResultInt: React.FC<Props> = ({
  points,
  change,
  onSelect,
  activeIndex,
  onDrawingPointPositionChange,
}) => {
  const handleDrag = useCallback(
    ({ latlng: { lat, lng: lon } }) => {
      if (activeIndex !== null) {
        onDrawingPointPositionChange(activeIndex, lat, lon, false);
      }
    },
    [onDrawingPointPositionChange, activeIndex],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      if (activeIndex !== null) {
        const coords = e.target.getLatLng();
        onDrawingPointPositionChange(activeIndex, coords.lat, coords.lng, true);
      }
    },
    [onDrawingPointPositionChange, activeIndex],
  );

  const onSelects = useMemo(() => {
    return new Array(points.length).fill(0).map((_, i) => () => {
      if (i !== activeIndex) {
        onSelect(i);
      }
    });
  }, [points.length, onSelect, activeIndex]);

  return (
    <>
      {points.map(({ lat, lon, label }, i) => (
        <RichMarker
          key={`${change}-${i}`}
          faIconLeftPadding="2px"
          ondragstart={onSelects[i]}
          ondragend={handleDragEnd}
          ondrag={handleDrag}
          position={{ lat, lng: lon }}
          onclick={onSelects[i]}
          color={activeIndex === i ? '#65b2ff' : undefined}
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
};

const mapStateToProps = (state: RootState) => ({
  points: state.drawingPoints.points,
  change: state.drawingPoints.change,
  activeIndex:
    state.main.selection?.type === 'draw-points'
      ? state.main.selection.id ?? null
      : null,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onDrawingPointPositionChange(
    index: number,
    lat: number,
    lon: number,
    final: boolean,
  ) {
    dispatch(drawingPointChangePosition({ index, lat, lon }));
    dispatch(drawingPointMeasure(final));
  },
  onSelect(index: number) {
    dispatch(selectFeature({ type: 'draw-points', id: index }));
    dispatch(drawingPointMeasure(true));
  },
});

export const DrawingPointsResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawingPointsResultInt);
