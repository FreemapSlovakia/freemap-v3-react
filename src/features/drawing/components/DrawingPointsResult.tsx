import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { joinColorAlpha, splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useIconContentProps } from '@shared/drawingIcons.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import Color from 'color';
import { DragEndEvent, LeafletEvent, LeafletEventHandlerFnMap } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import type { DrawingPoint } from '../model/actions/drawingPointActions.js';
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
      {points.map((point, i) => {
        const interactive = interactive0 || activeIndex === i;

        const { color } = point;

        const { color: rgb, opacity } = splitColorAlpha(color || COLORS.normal);

        const renderColor =
          activeIndex === i
            ? joinColorAlpha(Color(rgb).lighten(0.75).hex(), opacity)
            : color || COLORS.normal;

        return (
          <DrawingPointMarker
            key={`${change}-${i}-${interactive ? 'a' : 'b'}`}
            point={point}
            renderColor={renderColor}
            interactive={interactive}
            draggable={!window.fmEmbedded && activeIndex === i}
            eventHandlers={{
              dragstart: onSelects[i],
              dragend: handleDragEnd,
              move: handleMove,
              click: onSelects[i],
            }}
          />
        );
      })}
    </>
  );
}

function DrawingPointMarker({
  point: { coords, label, markerType, icon },
  renderColor,
  interactive,
  draggable,
  eventHandlers,
}: {
  point: DrawingPoint;
  renderColor: string;
  interactive: boolean;
  draggable: boolean;
  eventHandlers: LeafletEventHandlerFnMap;
}): ReactElement {
  // The marker interior is the `icon` content: a bundled poi icon, a Font
  // Awesome icon, or up to 2 literal characters of text. The `label` is the
  // descriptive tooltip.
  const contentProps = useIconContentProps(icon);

  // Fade the label tooltip with the same alpha as the marker (0.9 is Leaflet's
  // default tooltip opacity) so the whole marker — including its label — is
  // uniformly transparent.
  const { opacity } = splitColorAlpha(renderColor);

  return (
    <RichMarker
      position={{ lat: coords.lat, lng: coords.lon }}
      color={renderColor}
      markerType={markerType}
      {...contentProps}
      draggable={draggable}
      interactive={interactive}
      eventHandlers={eventHandlers}
    >
      {label && (
        <Tooltip
          className="compact"
          direction="top"
          permanent
          opacity={0.9 * opacity}
        >
          <span>{label}</span>
        </Tooltip>
      )}
    </RichMarker>
  );
}
