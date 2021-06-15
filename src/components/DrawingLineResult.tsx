import {
  drawingLineAddPoint,
  drawingLineJoinFinish,
  drawingLineUpdatePoint,
  Point,
} from 'fm3/actions/drawingLineActions';
import { drawingMeasure } from 'fm3/actions/drawingPointActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { colors } from 'fm3/constants';
import { distance } from 'fm3/geoutils';
import {
  drawingLinePolys,
  selectingModeSelector,
} from 'fm3/selectors/mainSelectors';
import { LatLon } from 'fm3/types/common';
import { divIcon, DomEvent, LeafletMouseEvent } from 'leaflet';
import { Fragment, ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: ${colors.normal}"></div>`,
});

const selectedCircularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: ${colors.selected}"></div>`,
});

type Props = {
  index: number;
};

export function DrawingLineResult({ index }: Props): ReactElement {
  const dispatch = useDispatch();

  const drawing = useSelector(drawingLinePolys);

  const line = useSelector((state) => state.drawingLines.lines[index]);

  const language = useSelector((state) => state.l10n.language);

  const selected = useSelector(
    (state) =>
      state.main.selection?.type === 'draw-line-poly' &&
      index === state.main.selection.id,
  );

  const selectedPointId = useSelector((state) =>
    state.main.selection?.type === 'line-point' &&
    index === state.main.selection.lineIndex
      ? state.main.selection.pointId
      : undefined,
  );

  const joinWith = useSelector((state) => state.drawingLines.joinWith);

  const interactive = useSelector(selectingModeSelector);

  const interactiveLine = interactive && joinWith === undefined;

  const { points } = line;

  const [coords, setCoords] = useState<LatLon | undefined>();

  const [touching, setTouching] = useState(false);

  const removeCoords = !!coords && ((!selected && !joinWith) || touching);

  useEffect(() => {
    if (removeCoords) {
      setCoords(undefined);
    }
  }, [removeCoords]);

  const map = useMap();

  useMapEvent('mousemove', ({ latlng, originalEvent }: LeafletMouseEvent) => {
    if (!touching && (selected || joinWith?.lineIndex === index)) {
      setCoords(
        joinWith ||
          (originalEvent.target as any)?.classList.contains('leaflet-container')
          ? { lat: latlng.lat, lon: latlng.lng }
          : undefined,
      );
    }
  });

  useMapEvent('mouseout', () => {
    if (selected) {
      setCoords(undefined);
    }
  });

  useEffect(() => {
    const mapContainer = selected && map.getContainer();

    if (mapContainer) {
      const handleTouchStart = () => {
        setTouching(true);
      };

      const handleTouchEnd = () => {
        setTouching(false);
      };

      DomEvent.on(mapContainer, 'touchstart', handleTouchStart);
      DomEvent.on(mapContainer, 'touchend', handleTouchEnd);

      return () => {
        DomEvent.off(mapContainer, 'touchstart', handleTouchStart);
        DomEvent.off(mapContainer, 'touchend', handleTouchEnd);
      };
    }
  }, [map, selected]);

  function addPoint(lat: number, lon: number, position: number, id0: number) {
    handleDragStart();
    const pos = position ? Math.ceil(position / 2) : points.length;

    let id: number | undefined;

    if (id0) {
      id = id0;
    } else if (pos === 0) {
      id = points.length ? points[pos].id - 1 : 0;
    } else if (pos === points.length) {
      id = points[pos - 1].id + 1;
    } else {
      id = (points[pos - 1].id + points[pos].id) / 2;
    }

    dispatch(
      drawingLineAddPoint({ index, point: { lat, lon, id }, position: pos }),
    );

    dispatch(drawingMeasure({}));
  }

  let prev: Point | null = null;

  let dist = 0;

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    [language],
  );

  function handleSelect() {
    dispatch(
      selectFeature({
        type: 'draw-line-poly',
        id: index,
      }),
    );

    dispatch(drawingMeasure({}));
  }

  const ps = useMemo(() => {
    const ps: Point[] = [];

    for (let i = 0; i < points.length; i++) {
      ps.push(points[i]);

      if (i < points.length - 1 || line.type === 'polygon') {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;

        ps.push({
          lat,
          lon,
          id: points.length - 1 === i ? points.length * 2 : (p1.id + p2.id) / 2,
        });
      }
    }

    return ps;
  }, [points, line.type]);

  let x;

  const futureLinePositions = (drawing || joinWith) &&
    ps.length > 0 &&
    coords !== undefined &&
    !window.preventMapClick && [
      joinWith?.lineIndex === index
        ? ((x = points.find((pt) => pt.id === joinWith.pointId)),
          {
            lat: x?.lat ?? -1,
            lng: x?.lon ?? -1,
          })
        : {
            lat: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lat,
            lng: ps[ps.length - (line.type === 'polygon' ? 2 : 1)].lon,
          },
      { lat: coords.lat, lng: coords.lon },
      ...(line.type === 'line' || ps.length < 3
        ? []
        : [{ lat: ps[0].lat, lng: ps[0].lon }]),
    ];

  return (
    <>
      {ps.length > 2 && line.type === 'line' && (
        <Fragment key={ps.map((p) => `${p.lat},${p.lon}`).join(',')}>
          <Polyline
            key={`line-${interactiveLine ? 'a' : 'b'}`}
            weight={12}
            opacity={0}
            interactive={interactiveLine}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: handleSelect,
            }}
            positions={ps
              .filter((_, i) => i % 2 === 0)
              .map(({ lat, lon }) => ({ lat, lng: lon }))}
          />

          <Polyline
            weight={4}
            pathOptions={{
              color: selected ? colors.selected : colors.normal,
            }}
            interactive={false}
            positions={ps
              .filter((_, i) => i % 2 === 0)
              .map(({ lat, lon }) => ({ lat, lng: lon }))}
          >
            {line.label && (
              <Tooltip className="compact" permanent>
                <span>{line.label}</span>
              </Tooltip>
            )}
          </Polyline>
        </Fragment>
      )}

      {ps.length > 1 && line.type === 'polygon' && (
        <Polygon
          key={`polygon-${interactiveLine ? 'a' : 'b'}`}
          weight={4}
          pathOptions={{
            color: selected ? colors.selected : colors.normal,
          }}
          interactive={interactiveLine}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: handleSelect,
          }}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        >
          {line.label && ps.length > 4 && (
            <Tooltip
              className="compact"
              offset={[-4, 0]}
              direction="center"
              permanent
            >
              <span>{line.label}</span>
            </Tooltip>
          )}
        </Polygon>
      )}

      {futureLinePositions && (
        <Polyline
          color={colors.selected}
          weight={4}
          dashArray="6,8"
          interactive={false}
          positions={futureLinePositions}
        />
      )}

      {(selected || selectedPointId !== undefined || joinWith !== undefined) &&
        ps.map((p, i) => {
          if (i % 2 === 0) {
            if (prev) {
              dist += distance(p.lat, p.lon, prev.lat, prev.lon);
            }

            prev = p;
          }

          if (
            joinWith !== undefined &&
            (line.type !== 'line' ||
              (i !== 0 && i !== ps.length - 1) ||
              joinWith.lineIndex === index)
          ) {
            return null;
          }

          return i % 2 === 0 ? (
            <Marker
              key={p.id}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
              icon={
                selectedPointId === p.id ? selectedCircularIcon : circularIcon
              }
              opacity={1}
              eventHandlers={{
                drag(e) {
                  const coord = e.target.getLatLng();

                  dispatch(
                    drawingLineUpdatePoint({
                      index,
                      point: { lat: coord.lat, lon: coord.lng, id: p.id },
                    }),
                  );

                  dispatch(drawingMeasure({}));
                },
                click() {
                  if (joinWith !== undefined) {
                    dispatch(
                      drawingLineJoinFinish({
                        lineIndex: index,
                        pointId: p.id,
                      }),
                    );

                    dispatch(drawingMeasure({}));
                  } else {
                    dispatch(
                      selectFeature({
                        type: 'line-point',
                        lineIndex: index,
                        pointId: p.id,
                      }),
                    );
                  }
                },
                dragstart: handleDragStart,
                dragend: handleDragEnd,
              }}
            >
              {line.type === 'line' && !joinWith && (
                <Tooltip className="compact" offset={[-4, 0]} direction="right">
                  <span>{nf.format(dist / 1000)} km</span>
                </Tooltip>
              )}
            </Marker>
          ) : (
            <Marker
              key={p.id}
              draggable
              position={{ lat: p.lat, lng: p.lon }}
              icon={circularIcon}
              opacity={0.33}
              eventHandlers={{
                dragstart(e) {
                  addPoint(
                    e.target.getLatLng().lat,
                    e.target.getLatLng().lng,
                    i,
                    p.id,
                  );
                },
                click(e) {
                  addPoint(
                    e.target.getLatLng().lat,
                    e.target.getLatLng().lng,
                    i,
                    p.id,
                  );
                },
              }}
            />
          );
        })}

      <ElevationChartActivePoint />
    </>
  );
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragStart() {
  window.preventMapClick = true;
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragEnd() {
  window.setTimeout(() => {
    window.preventMapClick = false;
  });
}
