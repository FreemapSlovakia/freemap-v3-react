import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Polyline, Tooltip, Marker, CircleMarker } from 'react-leaflet';

import { RichMarker } from 'fm3/components/RichMarker';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import {
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerAddMidpoint,
  routePlannerSetMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetActiveAlternativeIndex,
  Alternative,
  RouteAlternativeExtra,
  RouteStepExtra,
} from 'fm3/actions/routePlannerActions';
import { Translator, withTranslator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { LatLon } from 'fm3/types/common';
import {
  divIcon,
  DragEndEvent,
  LeafletMouseEvent,
  LeafletEvent,
} from 'leaflet';
import { isSpecial } from 'fm3/transportTypeDefs';
import { lineString, Point, Properties, Feature } from '@turf/helpers';
import along from '@turf/along';
import length from '@turf/length';
import { selectFeature } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const RoutePlannerResultInt: React.FC<Props> = ({
  transportType,
  t,
  language,
  activeAlternativeIndex,
  alternatives,
  mode,
  onFinishSet,
  onAddMidpoint,
  onAlternativeChange,
  onStartSet,
  onMidpointSet,
  onRemoveMidpoint,
  start,
  midpoints,
  finish,
  timestamp,
  zoom,
  showMilestones,
}) => {
  const tRef = useRef<number>();
  const draggingRef = useRef<boolean>();

  const [dragLat, setDragLat] = useState<number>();
  const [dragLon, setDragLon] = useState<number>();
  const [dragSegment, setDragSegment] = useState<number>();
  const [dragAlt, setDragAlt] = useState<number>();

  useEffect(
    () => () => {
      const tim = tRef.current;
      if (typeof tim === 'number') {
        clearTimeout(tim);
      }
    },
    [],
  );

  const getSummary = useMemo(
    () => () => {
      const { distance = undefined, duration = undefined, extra = undefined } =
        alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

      const nf = Intl.NumberFormat(language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      return isSpecial(transportType) && extra?.numbers ? (
        <Tooltip direction="top" offset={[0, -36]} permanent>
          <div>{imhdSummary(t, language, extra)}</div>
        </Tooltip>
      ) : distance ? (
        <Tooltip direction="top" offset={[0, -36]} permanent>
          <div>
            <div>
              {t('routePlanner.distance', { value: nf.format(distance) })}
            </div>
            {duration !== undefined && (
              <div>
                {t('routePlanner.duration', {
                  h: Math.floor(duration / 60),
                  m: Math.round(duration % 60),
                })}
              </div>
            )}
          </div>
        </Tooltip>
      ) : null;
    },
    [alternatives, activeAlternativeIndex, language, t, transportType],
  );

  const bringToFront = useCallback(ele => {
    if (ele) {
      ele.leafletElement.bringToFront();
    }
  }, []);

  const maneuverToText = useCallback(
    (name: string, { type, modifier }, extra: RouteStepExtra) => {
      const p = 'routePlanner.maneuver';
      return transportType === 'imhd'
        ? imhdStep(t, language, extra)
        : transportType === 'bikesharing'
        ? bikesharingStep(t, extra)
        : t(`routePlanner.maneuverWith${name ? '' : 'out'}Name`, {
            type: t(`${p}.types.${type}`, {}, type),
            modifier: modifier
              ? ` ${t(`${p}.modifiers.${modifier}`, {}, modifier)}`
              : '',
            name,
          });
    },
    [t, transportType, language],
  );

  const handleStartPointClick = useCallback(() => {
    // prevent default
  }, []);

  const handleEndPointClick = useCallback(() => {
    if (mode === 'roundtrip') {
      onFinishSet(null);
    }
  }, [mode, onFinishSet]);

  const handlePolyMouseMove = useCallback(
    (e: LeafletMouseEvent, segment: number, alt: number) => {
      if (draggingRef.current) {
        return;
      }
      if (tRef.current) {
        clearTimeout(tRef.current);
        tRef.current = undefined;
      }

      setDragLat(e.latlng.lat);
      setDragLon(e.latlng.lng);
      setDragSegment(segment);
      setDragAlt(alt);
    },
    [],
  );

  const resetOnTimeout = useCallback(() => {
    if (tRef.current) {
      clearTimeout(tRef.current);
    }
    tRef.current = window.setTimeout(() => {
      setDragLat(undefined);
      setDragLon(undefined);
    }, 200);
  }, []);

  const handlePolyMouseOut = useCallback(() => {
    if (!draggingRef.current) {
      resetOnTimeout();
    }
  }, [resetOnTimeout]);

  const handleFutureMouseOver = useCallback(() => {
    if (!draggingRef.current && tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = undefined;
    }
  }, []);

  const handleFutureMouseOut = useCallback(() => {
    if (!draggingRef.current) {
      resetOnTimeout();
    }
  }, [resetOnTimeout]);

  const handleDragStart = useCallback(() => {
    if (tRef.current) {
      clearTimeout(tRef.current);
    }
    draggingRef.current = true;
  }, []);

  const handleFutureDragEnd = useCallback(
    (e: LeafletEvent) => {
      draggingRef.current = false;
      setDragLat(undefined);
      setDragLon(undefined);

      if (dragSegment !== undefined) {
        onAddMidpoint(dragSegment, {
          lat: e.target.getLatLng().lat,
          lon: e.target.getLatLng().lng,
        });
      }
    },
    [onAddMidpoint, dragSegment],
  );

  const handleFutureClick = useCallback(() => {
    if (dragAlt !== undefined) {
      onAlternativeChange(dragAlt);
    }
  }, [onAlternativeChange, dragAlt]);

  const handleRouteMarkerDragEnd = useCallback(
    (
      movedPointType: 'start' | 'midpoint' | 'finish',
      position: number | null,
      event: DragEndEvent,
    ) => {
      draggingRef.current = false;

      const { lat, lng: lon } = event.target.getLatLng();

      switch (movedPointType) {
        case 'start':
          onStartSet({ lat, lon });
          break;
        case 'finish':
          onFinishSet({ lat, lon });
          break;
        case 'midpoint':
          if (position !== null) {
            onMidpointSet(position, { lat, lon });
          }
          break;
        default:
          throw new Error('unknown pointType');
      }
    },
    [onStartSet, onFinishSet, onMidpointSet],
  );

  const handleMidpointClick = useCallback(
    position => {
      onRemoveMidpoint(position);
    },
    [onRemoveMidpoint],
  );

  const special = !!transportType && isSpecial(transportType);

  const circularIcon = divIcon({
    // CircleMarker is not draggable
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: '<div class="circular-leaflet-marker-icon"></div>',
  });

  const isRoute = mode === 'route';

  const step =
    zoom > 13
      ? 1
      : zoom > 12
      ? 2
      : zoom > 10
      ? 5
      : zoom > 9
      ? 10
      : zoom > 8
      ? 20
      : zoom > 7
      ? 25
      : 50;

  const milestones = useMemo(() => {
    if (!showMilestones || !alternatives[activeAlternativeIndex]) {
      return [];
    }

    const points: [number, number][] = [];
    for (const step of alternatives[activeAlternativeIndex].itinerary) {
      points.push(
        ...step.shapePoints.map(([a, b]) => [b, a] as [number, number]),
      );
    }

    const line = lineString(points);
    const len = length(line);

    const milestones: Feature<Point, Properties>[] = [];
    for (let i = step; i < len; i += step) {
      milestones.push(along(line, i));
    }

    return milestones;
  }, [activeAlternativeIndex, alternatives, step, showMilestones]);

  return (
    <>
      {start && (
        <RichMarker
          faIcon="play"
          zIndexOffset={10}
          faIconLeftPadding="2px"
          color="#409a40"
          draggable
          ondragstart={handleDragStart}
          ondragend={e => handleRouteMarkerDragEnd('start', null, e)}
          position={{ lat: start.lat, lng: start.lon }}
          onclick={handleStartPointClick}
        >
          {!isRoute && getSummary()}
        </RichMarker>
      )}
      {dragLat !== undefined && dragLon !== undefined && (
        <Marker
          draggable
          icon={circularIcon}
          onDragStart={handleDragStart}
          onDragEnd={handleFutureDragEnd}
          onMouseOver={handleFutureMouseOver}
          onMouseOut={handleFutureMouseOut}
          position={{ lat: dragLat, lng: dragLon }}
          onclick={handleFutureClick}
        />
      )}
      {midpoints.map(({ lat, lon }, i) => (
        <RichMarker
          draggable
          ondragstart={handleDragStart}
          ondragend={e => handleRouteMarkerDragEnd('midpoint', i, e)}
          onclick={() => handleMidpointClick(i)}
          key={`midpoint-${i}`}
          zIndexOffset={9}
          faIcon={isRoute ? undefined : 'flag'}
          label={isRoute ? i + 1 : undefined}
          position={{ lat, lng: lon }}
        />
      ))}
      {finish && (
        <RichMarker
          faIcon={mode !== 'roundtrip' ? 'stop' : 'flag'}
          color={mode !== 'roundtrip' ? '#d9534f' : undefined}
          zIndexOffset={10}
          draggable
          ondragstart={handleDragStart}
          ondragend={e => handleRouteMarkerDragEnd('finish', null, e)}
          position={{ lat: finish.lat, lng: finish.lon }}
          onclick={handleEndPointClick}
        >
          {isRoute && getSummary()}
        </RichMarker>
      )}
      {(!special ? alternatives : alternatives.map(addMissingSegments))
        .map((x, index) => ({
          ...x,
          alt: index,
          index: index === activeAlternativeIndex ? -1000 : index,
        }))
        .sort((a, b) => b.index - a.index)
        .map(({ itinerary, alt }) => (
          <React.Fragment key={`alt-${timestamp}-${alt}`}>
            {alt === activeAlternativeIndex &&
              special &&
              itinerary.map(
                ({ shapePoints, name, maneuver, extra: extra1 }, i: number) => (
                  <Marker key={i} icon={circularIcon} position={shapePoints[0]}>
                    <Tooltip direction="right" permanent>
                      <div>{maneuverToText(name, maneuver, extra1)}</div>
                    </Tooltip>
                  </Marker>
                ),
              )}
            {itinerary.map((routeSlice, i: number) => (
              <Polyline
                key={`slice-${i}`}
                ref={bringToFront}
                positions={routeSlice.shapePoints}
                weight={10}
                color="#fff"
                bubblingMouseEvents={false}
                onClick={() => onAlternativeChange(alt)}
                onMouseMove={
                  special
                    ? undefined
                    : (e: LeafletMouseEvent) =>
                        handlePolyMouseMove(e, routeSlice.legIndex, alt)
                }
                onMouseOut={handlePolyMouseOut}
              />
            ))}
            {itinerary.map((routeSlice, i: number) => (
              <Polyline
                key={`slice-${timestamp}-${alt}-${i}`}
                ref={bringToFront}
                positions={routeSlice.shapePoints}
                weight={6}
                color={
                  alt !== activeAlternativeIndex
                    ? '#868e96'
                    : !special && routeSlice.legIndex % 2
                    ? 'hsl(211, 100%, 66%)'
                    : 'hsl(211, 100%, 50%)'
                }
                opacity={/* alt === activeAlternativeIndex ? 1 : 0.5 */ 1}
                dashArray={
                  ['foot', 'pushing bike', 'ferry'].includes(routeSlice.mode)
                    ? '0, 10'
                    : undefined
                }
                interactive={false}
                bubblingMouseEvents={false}
              />
            ))}
          </React.Fragment>
        ))}
      {milestones.map((ms, i) => (
        <CircleMarker
          radius={0}
          key={i}
          center={[ms.geometry.coordinates[1], ms.geometry.coordinates[0]]}
        >
          <Tooltip className="compact" direction="right" permanent>
            <div>{(i + 1) * step}</div>
          </Tooltip>
        </CircleMarker>
      ))}
      <ElevationChartActivePoint />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  start: state.routePlanner.start,
  finish: state.routePlanner.finish,
  midpoints: state.routePlanner.midpoints,
  alternatives: state.routePlanner.alternatives,
  activeAlternativeIndex: state.routePlanner.activeAlternativeIndex,
  transportType: state.routePlanner.transportType,
  mode: state.routePlanner.mode,
  timestamp: state.routePlanner.timestamp,
  showMilestones: state.routePlanner.milestones,
  language: state.l10n.language,
  zoom: state.map.zoom,
  selected: state.main.selection?.type === 'route-planner',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onStartSet(start: LatLon | null) {
    dispatch(routePlannerSetStart({ start, move: true }));
  },
  onFinishSet(finish: LatLon | null) {
    dispatch(routePlannerSetFinish({ finish, move: true }));
  },
  onAddMidpoint(position: number, midpoint: LatLon) {
    dispatch(routePlannerAddMidpoint({ midpoint, position }));
  },
  onMidpointSet(position: number, midpoint: LatLon) {
    dispatch(routePlannerSetMidpoint({ position, midpoint }));
  },
  onRemoveMidpoint(position: number) {
    dispatch(routePlannerRemoveMidpoint(position));
  },
  onAlternativeChange(index: number) {
    dispatch(routePlannerSetActiveAlternativeIndex(index));
    dispatch(selectFeature({ type: 'route-planner' }));
  },
  onSelect() {
    dispatch(selectFeature({ type: 'route-planner' }));
  },
});

export const RoutePlannerResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(RoutePlannerResultInt));

// TODO do it in logic so that GPX export is the same
// adds missing foot segments (between bus-stop and footway)
function addMissingSegments(alt: Alternative) {
  const routeSlices: any[] = [];
  for (let i = 0; i < alt.itinerary.length; i += 1) {
    const slice = alt.itinerary[i];
    const prevSlice = alt.itinerary[i - 1];
    const nextSlice = alt.itinerary[i + 1];

    const prevSliceLastShapePoint = prevSlice
      ? prevSlice.shapePoints[prevSlice.shapePoints.length - 1]
      : null;
    const firstShapePoint = slice.shapePoints[0];

    const lastShapePoint = slice.shapePoints[slice.shapePoints.length - 1];
    const nextSliceFirstShapePoint = nextSlice
      ? nextSlice.shapePoints[0]
      : null;

    const shapePoints = [...slice.shapePoints];

    if (slice.mode === 'foot') {
      if (
        prevSliceLastShapePoint &&
        (Math.abs(prevSliceLastShapePoint[0] - firstShapePoint[0]) >
          0.0000001 ||
          Math.abs(prevSliceLastShapePoint[1] - firstShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.unshift(prevSliceLastShapePoint);
      }

      if (
        nextSliceFirstShapePoint &&
        (Math.abs(nextSliceFirstShapePoint[0] - lastShapePoint[0]) >
          0.0000001 ||
          Math.abs(nextSliceFirstShapePoint[1] - lastShapePoint[1]) > 0.0000001)
      ) {
        shapePoints.push(nextSliceFirstShapePoint);
      }
    }

    routeSlices.push({
      ...slice,
      shapePoints,
    });
  }

  return { ...alt, itinerary: routeSlices };
}

function imhdSummary(
  t: Translator,
  language: string,
  extra: RouteAlternativeExtra,
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const {
    duration: { foot, bus, home, wait },
    price,
    arrival,
    numbers,
  } = extra;

  return t('routePlanner.imhd.total.full', {
    total: Math.round(
      ((foot ?? 0) + (bus ?? 0) + (home ?? 0) + (wait ?? 0)) / 60,
    ),
    foot: Math.round(foot ?? 0 / 60),
    bus: Math.round(bus ?? 0 / 60),
    home: Math.round(home ?? 0 / 60),
    walk: Math.round(foot ?? 0 / 60),
    wait: Math.round(wait ?? 0 / 60),
    price:
      price === undefined
        ? undefined
        : Intl.NumberFormat(language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price),
    arrival: dateFormat.format(arrival * 1000),
    numbers,
  });
}

function imhdStep(
  t: Translator,
  language: string,
  { type, destination, departure, duration, number }: RouteStepExtra,
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return t(`routePlanner.imhd.step.${type === 'foot' ? 'foot' : 'bus'}`, {
    type: t(`routePlanner.imhd.type.${type}`),
    destination,
    departure:
      departure === undefined ? undefined : dateFormat.format(departure * 1000),
    duration: duration === undefined ? undefined : Math.round(duration / 60),
    number,
  });
}

function bikesharingStep(
  t: Translator,
  { type, destination, duration }: RouteStepExtra,
) {
  return t(`routePlanner.bikesharing.step.${type}`, {
    destination,
    duration: duration === undefined ? undefined : Math.round(duration / 60),
  });
}
