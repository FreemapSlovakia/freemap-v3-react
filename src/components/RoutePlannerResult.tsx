import along from '@turf/along';
import { Feature, lineString, Point, Properties } from '@turf/helpers';
import length from '@turf/length';
import { setTool } from 'fm3/actions/mainActions';
import {
  Alternative,
  RouteAlternativeExtra,
  routePlannerAddMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetMidpoint,
  routePlannerSetPickMode,
  routePlannerSetStart,
  RouteStepExtra,
  Step,
} from 'fm3/actions/routePlannerActions';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { RichMarker } from 'fm3/components/RichMarker';
import { colors } from 'fm3/constants';
import { useMessages } from 'fm3/l10nInjector';
import { selectingModeSelector } from 'fm3/selectors/mainSelectors';
import { Messages } from 'fm3/translations/messagesInterface';
import { isSpecial } from 'fm3/transportTypeDefs';
import {
  divIcon,
  DragEndEvent,
  LeafletEvent,
  LeafletMouseEvent,
  Polyline as LPolyline,
} from 'leaflet';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import {
  CircleMarker,
  Marker,
  Polyline,
  Tooltip,
  useMapEvent,
} from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: ${colors.normal}"></div>`,
});

export function RoutePlannerResult(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const start = useSelector((state) => state.routePlanner.start);

  const finish = useSelector((state) => state.routePlanner.finish);

  const midpoints = useSelector((state) => state.routePlanner.midpoints);

  const alternatives = useSelector((state) => state.routePlanner.alternatives);

  const waypoints = useSelector((state) => state.routePlanner.waypoints);

  const activeAlternativeIndex = useSelector(
    (state) => state.routePlanner.activeAlternativeIndex,
  );

  const transportType = useSelector(
    (state) => state.routePlanner.transportType,
  );

  const mode = useSelector((state) => state.routePlanner.mode);

  const timestamp = useSelector((state) => state.routePlanner.timestamp);

  const showMilestones = useSelector((state) => state.routePlanner.milestones);

  const language = useSelector((state) => state.l10n.language);

  const zoom = useSelector((state) => state.map.zoom);

  const tRef = useRef<number>();

  const draggingRef = useRef<boolean>();

  const [dragLat, setDragLat] = useState<number>();

  const [dragLon, setDragLon] = useState<number>();

  const [dragSegment, setDragSegment] = useState<number>();

  const [dragAlt, setDragAlt] = useState<number>();

  const pickMode = useSelector((state) => state.routePlanner.pickMode);

  const tool = useSelector((state) => state.main.tool);

  const interactive0 = tool === 'route-planner'; // draggable

  const interactive1 = useSelector(selectingModeSelector) || interactive0; // markers, lines

  const [dragging, setDragging] = useState(false);

  const handlePoiAdd = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      if (window.fmEmbedded || dragging) {
        // nothing
      } else if (tool !== 'route-planner') {
        // nothing
      } else if (pickMode === 'start') {
        dispatch(
          routePlannerSetStart({ start: { lat: latlng.lat, lon: latlng.lng } }),
        );
      } else if (pickMode === 'finish') {
        dispatch(
          routePlannerSetFinish({
            finish: { lat: latlng.lat, lon: latlng.lng },
          }),
        );
      }
    },
    [pickMode, dispatch, tool, dragging],
  );

  useMapEvent('click', handlePoiAdd);

  useEffect(
    () => () => {
      const tim = tRef.current;

      if (typeof tim === 'number') {
        clearTimeout(tim);
      }
    },
    [],
  );

  const getPointDetails2 = useCallback(
    (
      distanceSum: number,
      durationSum: number,
      distanceDiff?: number,
      durationDiff?: number,
    ) => {
      const nf = Intl.NumberFormat(language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      return (
        <div>
          <div>
            {m?.routePlanner.distance({
              value: nf.format(distanceSum / 1000),
              diff:
                distanceDiff === undefined
                  ? undefined
                  : nf.format(distanceDiff / 1000),
            })}
          </div>
          {durationSum !== undefined && (
            <div>
              {m?.routePlanner.duration({
                h: Math.floor(Math.round(durationSum / 60) / 60),
                m: Math.round(durationSum / 60) % 60,
                diff:
                  durationDiff === undefined
                    ? undefined
                    : {
                        h: Math.floor(Math.round(durationDiff / 60) / 60),
                        m: Math.round(durationDiff / 60) % 60,
                      },
              })}
            </div>
          )}
        </div>
      );
    },
    [language, m],
  );

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

    const line = lineString(
      alternatives[activeAlternativeIndex].legs
        .flatMap((leg) => leg.steps)
        .flatMap((step) => step.geometry.coordinates),
    );

    const len = length(line);

    const milestones: Feature<Point, Properties>[] = [];

    for (let i = step; i < len; i += step) {
      milestones.push(along(line, i));
    }

    return milestones;
  }, [activeAlternativeIndex, alternatives, step, showMilestones]);

  const getPointDetails = useCallback(
    (i: number, showDiff = true, summary = false) => {
      let distanceSum = 0;
      let durationSum = 0;

      const offset = summary ? 0 : 1;

      const ii =
        mode === 'route' || summary
          ? i
          : (waypoints[i + offset]?.waypoint_index ?? -10) - offset;

      for (let j = 0; j <= ii; j++) {
        const leg = alternatives[activeAlternativeIndex]?.legs[j];

        if (leg) {
          distanceSum += leg.distance;
          durationSum += leg.duration;
        }
      }

      const leg =
        showDiff && ii > 0
          ? alternatives[activeAlternativeIndex]?.legs[ii]
          : undefined;

      return getPointDetails2(
        distanceSum,
        durationSum,
        leg?.distance,
        leg?.duration,
      );
    },
    [alternatives, activeAlternativeIndex, getPointDetails2, mode, waypoints],
  );

  const getSummary = useCallback(
    (showDiff?: boolean) => {
      const {
        distance = undefined,
        duration = undefined,
        extra = undefined,
      } = alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

      return isSpecial(transportType) && extra?.numbers ? (
        <Tooltip direction="top" offset={[0, -36]} permanent>
          <div>{imhdSummary(m, language, extra)}</div>
        </Tooltip>
      ) : distance && duration ? (
        <Tooltip direction="top" offset={[0, -36]} permanent>
          {/* <div>{getPointDetails2(distance, duration)}</div> */}
          <div>
            {getPointDetails(
              midpoints.length + (mode === 'roundtrip' ? 1 : 0),
              showDiff,
              true,
            )}
          </div>
        </Tooltip>
      ) : null;
    },
    [
      mode,
      midpoints.length,
      alternatives,
      activeAlternativeIndex,
      // getPointDetails2,
      getPointDetails,
      language,
      m,
      transportType,
    ],
  );

  const bringToFront = useCallback((ele: LPolyline) => {
    if (ele) {
      ele.bringToFront();
    }
  }, []);

  const maneuverToText = useCallback(
    (
      name: string,
      { type, modifier }: Step['maneuver'],
      extra?: RouteStepExtra,
    ) =>
      transportType === 'imhd'
        ? extra && imhdStep(m, language, extra)
        : transportType === 'bikesharing'
        ? extra && bikesharingStep(m, extra)
        : m?.routePlanner[name ? 'maneuverWithName' : 'maneuverWithoutName']({
            type: m?.routePlanner.maneuver.types[type],
            modifier: modifier
              ? ' ' + m?.routePlanner.maneuver.modifiers[modifier]
              : '',
            name,
          }),
    [m, transportType, language],
  );

  const handleStartPointClick = useCallback(() => {
    // also prevent default

    if (tool === 'route-planner') {
      dispatch(routePlannerSetPickMode('start'));
    } else {
      dispatch(setTool('route-planner'));
    }
  }, [dispatch, tool]);

  const handleEndPointClick = useCallback(() => {
    if (mode === 'roundtrip') {
      dispatch(routePlannerSetFinish({ finish: null, move: true }));
    }

    if (tool === 'route-planner') {
      dispatch(routePlannerSetPickMode('finish'));
    } else {
      dispatch(setTool('route-planner'));
    }
  }, [mode, tool, dispatch]);

  const [endPointHovering, setEndPointHovering] = useState(false);

  const handleEndPointMouseOver = useCallback(() => {
    if (!draggingRef.current) {
      setEndPointHovering(true);
    }
  }, []);

  const handleEndPointMouseOut = useCallback(() => {
    setEndPointHovering(false);
  }, []);

  const [startPointHovering, setStartPointHovering] = useState(false);

  const handleStartPointMouseOver = useCallback(() => {
    if (!draggingRef.current) {
      setStartPointHovering(true);
    }
  }, []);

  const handleStartPointMouseOut = useCallback(() => {
    if (!draggingRef.current) {
      setStartPointHovering(false);
    }
  }, []);

  const handlePolyMouseMove = useCallback(
    (e: LeafletMouseEvent, segment: number, alt: number) => {
      if (!interactive0 || draggingRef.current) {
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
    [interactive0],
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
      tRef.current = undefined;
    }

    draggingRef.current = true;
    setDragging(true);
  }, []);

  const handleFutureDragEnd = useCallback(
    (e: LeafletEvent) => {
      draggingRef.current = false;

      setTimeout(() => {
        setDragging(false);
      });

      setDragLat(undefined);

      setDragLon(undefined);

      if (dragSegment !== undefined) {
        dispatch(
          routePlannerAddMidpoint({
            midpoint: {
              lat: e.target.getLatLng().lat,
              lon: e.target.getLatLng().lng,
            },
            position: dragSegment,
          }),
        );
        dispatch(setTool('route-planner'));
      }
    },
    [dispatch, dragSegment],
  );

  const changeAlternative = useCallback(
    (index: number) => {
      dispatch(routePlannerSetActiveAlternativeIndex(index));
      dispatch(setTool('route-planner'));
    },
    [dispatch],
  );

  const handleFutureClick = useCallback(() => {
    if (dragAlt !== undefined) {
      changeAlternative(dragAlt);
    }
  }, [dragAlt, changeAlternative]);

  const handleRouteMarkerDragEnd = useCallback(
    (
      movedPointType: 'start' | 'midpoint' | 'finish',
      position: number | null,
      event: DragEndEvent,
    ) => {
      draggingRef.current = false;

      setTimeout(() => {
        setDragging(false);
      });

      const { lat, lng: lon } = event.target.getLatLng();

      switch (movedPointType) {
        case 'start':
          dispatch(routePlannerSetStart({ start: { lat, lon }, move: true }));
          dispatch(setTool('route-planner'));
          break;
        case 'finish':
          dispatch(routePlannerSetFinish({ finish: { lat, lon }, move: true }));
          dispatch(setTool('route-planner'));

          break;
        case 'midpoint':
          if (position !== null) {
            dispatch(
              routePlannerSetMidpoint({ position, midpoint: { lat, lon } }),
            );
            dispatch(setTool('route-planner'));
          }
          break;
        default:
          throw new Error('unknown pointType');
      }
    },
    [dispatch],
  );

  const special = !!transportType && isSpecial(transportType);

  const startMarker = useMemo(
    () =>
      start && (
        <RichMarker
          key={
            'start-' + (interactive0 ? 'a' : 'b') + (interactive1 ? 'a' : 'b')
          }
          interactive={interactive1}
          faIcon={<FaPlay color="#409a40" />}
          zIndexOffset={10}
          color="#409a40"
          draggable={interactive0 && !window.fmEmbedded}
          position={{ lat: start.lat, lng: start.lon }}
          eventHandlers={{
            dragstart: handleDragStart,
            dragend(e) {
              handleRouteMarkerDragEnd('start', null, e);
            },
            click: handleStartPointClick,
            mouseover: handleStartPointMouseOver,
            mouseout: handleStartPointMouseOut,
          }}
        >
          {!dragging && mode === 'roundtrip' && getSummary(startPointHovering)}
        </RichMarker>
      ),
    [
      start,
      interactive1,
      interactive0,
      handleDragStart,
      handleStartPointClick,
      handleStartPointMouseOver,
      handleStartPointMouseOut,
      dragging,
      mode,
      getSummary,
      startPointHovering,
      handleRouteMarkerDragEnd,
    ],
  );

  const finishMarker = useMemo(
    () =>
      finish && (
        <RichMarker
          key={
            'finish-' + (interactive0 ? 'a' : 'b') + (interactive1 ? 'a' : 'b')
          }
          interactive={interactive1}
          faIcon={mode === 'roundtrip' ? undefined : <FaStop color="#d9534f" />}
          label={
            mode === 'roundtrip'
              ? waypoints[waypoints.length - 1]?.waypoint_index
              : undefined
          }
          color={mode !== 'roundtrip' ? '#d9534f' : undefined}
          zIndexOffset={10}
          draggable={interactive0 && !window.fmEmbedded}
          position={{ lat: finish.lat, lng: finish.lon }}
          eventHandlers={{
            dragstart: handleDragStart,
            dragend(e) {
              handleRouteMarkerDragEnd('finish', null, e);
            },
            click: handleEndPointClick,
            mouseover: handleEndPointMouseOver,
            mouseout: handleEndPointMouseOut,
          }}
        >
          {!dragging && mode !== 'roundtrip' && getSummary(endPointHovering)}

          {!dragging && mode == 'roundtrip' && (
            <Tooltip direction="top" offset={[0, -36]}>
              {getPointDetails(midpoints.length)}
            </Tooltip>
          )}
        </RichMarker>
      ),
    [
      dragging,
      endPointHovering,
      finish,
      getPointDetails,
      getSummary,
      handleDragStart,
      handleEndPointClick,
      handleEndPointMouseOut,
      handleEndPointMouseOver,
      handleRouteMarkerDragEnd,
      interactive0,
      interactive1,
      midpoints.length,
      mode,
      waypoints,
    ],
  );

  const paths = useMemo(
    () =>
      (!special ? alternatives : alternatives.map(addMissingSegments))
        .map((x, index) => ({
          ...x,
          alt: index,
          index: index === activeAlternativeIndex ? -1000 : index,
        }))
        .sort((a, b) => b.index - a.index)
        .map(({ legs, alt }) => (
          <Fragment key={`alt-${timestamp}-${alt}`}>
            {alt === activeAlternativeIndex &&
              special &&
              legs
                .flatMap((leg) => leg.steps)
                .map(({ geometry, name, maneuver, extra }, i: number) => (
                  <Marker
                    key={i}
                    icon={circularIcon}
                    position={reverse(geometry.coordinates[0])}
                  >
                    {!dragging && (
                      <Tooltip direction="right" permanent>
                        <div>{maneuverToText(name, maneuver, extra)}</div>
                      </Tooltip>
                    )}
                  </Marker>
                ))}

            {legs
              .flatMap((leg, legIndex) =>
                leg.steps.map((step) => ({ legIndex, ...step })),
              )
              .map((routeSlice, i: number) => (
                <Polyline
                  key={`slice-${i}-${interactive1 ? 'a' : 'b'}`}
                  interactive={interactive1}
                  ref={bringToFront}
                  positions={routeSlice.geometry.coordinates.map(reverse)}
                  weight={10}
                  color="#fff"
                  bubblingMouseEvents={false}
                  eventHandlers={{
                    click() {
                      changeAlternative(alt);
                    },
                    mousemove: special
                      ? undefined
                      : (e: LeafletMouseEvent) =>
                          handlePolyMouseMove(e, routeSlice.legIndex, alt),

                    mouseout: handlePolyMouseOut,
                  }}
                />
              ))}

            {legs
              .flatMap((leg, legIndex) =>
                leg.steps.map((step) => ({ legIndex, ...step })),
              )
              .map((routeSlice, i: number) => (
                <Polyline
                  key={`slice-${timestamp}-${alt}-${i}-${
                    interactive1 ? 'a' : 'b'
                  }`}
                  ref={bringToFront}
                  positions={routeSlice.geometry.coordinates.map(reverse)}
                  weight={6}
                  pathOptions={{
                    color:
                      alt !== activeAlternativeIndex
                        ? '#868e96'
                        : !special && routeSlice.legIndex % 2
                        ? 'hsl(211, 100%, 66%)'
                        : 'hsl(211, 100%, 50%)',
                  }}
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
          </Fragment>
        )),
    [
      special,
      alternatives,
      activeAlternativeIndex,
      timestamp,
      dragging,
      maneuverToText,
      interactive1,
      bringToFront,
      handlePolyMouseOut,
      changeAlternative,
      handlePolyMouseMove,
    ],
  );

  const midpointElements = useMemo(
    () =>
      midpoints.map(({ lat, lon }, i) => (
        <RichMarker
          interactive={interactive1}
          draggable={interactive0 && !window.fmEmbedded}
          eventHandlers={
            window.fmEmbedded
              ? {}
              : {
                  dragstart: handleDragStart,
                  dragend(e) {
                    handleRouteMarkerDragEnd('midpoint', i, e);
                  },
                  click() {
                    if (tool === 'route-planner') {
                      dispatch(routePlannerRemoveMidpoint(i));
                    } else {
                      dispatch(setTool('route-planner'));
                    }
                  },
                }
          }
          key={`midpoint-${i}-${interactive0 ? 'a' : 'b'}-${
            interactive1 ? 'a' : 'b'
          }`}
          zIndexOffset={9}
          label={mode === 'route' ? i + 1 : waypoints[i + 1]?.waypoint_index}
          position={{ lat, lng: lon }}
        >
          {!dragging && (
            <Tooltip direction="top" offset={[0, -36]}>
              {getPointDetails(i)}
            </Tooltip>
          )}
        </RichMarker>
      )),
    [
      midpoints,
      interactive1,
      interactive0,
      handleDragStart,
      mode,
      waypoints,
      dragging,
      getPointDetails,
      handleRouteMarkerDragEnd,
      tool,
      dispatch,
    ],
  );

  return (
    <>
      {startMarker}

      {!window.fmEmbedded &&
        interactive0 &&
        dragLat !== undefined &&
        dragLon !== undefined && (
          <Marker
            draggable={!window.fmEmbedded}
            icon={circularIcon}
            eventHandlers={{
              dragstart: handleDragStart,
              dragend: handleFutureDragEnd,
              mouseover: handleFutureMouseOver,
              mouseout: handleFutureMouseOut,
              click: handleFutureClick,
            }}
            position={{ lat: dragLat, lng: dragLon }}
          />
        )}

      {midpointElements}

      {finishMarker}

      {paths}

      {milestones.map((ms, i) => (
        <CircleMarker
          radius={0}
          key={i}
          center={reverse(ms.geometry.coordinates as [number, number])}
        >
          {!dragging && (
            <Tooltip className="compact" direction="right" permanent>
              <div>{(i + 1) * step}</div>
            </Tooltip>
          )}
        </CircleMarker>
      ))}

      <ElevationChartActivePoint />
    </>
  );
}

function reverse(c: [number, number]) {
  return [c[1], c[0]] as [number, number];
}

// TODO instead of calling dispatch(setTool('route-planner')) implement selecting feature in globalReducer

// TODO do it in processor so that GPX export is the same
// adds missing foot segments (between bus-stop and footway)
function addMissingSegments(alt: Alternative) {
  const routeSlices: Step[] = [];

  const steps = alt.legs.flatMap((leg) => leg.steps);

  for (let i = 0; i < steps.length; i += 1) {
    const slice = steps[i];
    const prevSlice = steps[i - 1];
    const nextSlice = steps[i + 1];

    const prevSliceLastShapePoint = prevSlice
      ? prevSlice.geometry.coordinates[
          prevSlice.geometry.coordinates.length - 1
        ]
      : null;
    const firstShapePoint = slice.geometry.coordinates[0];

    const lastShapePoint =
      slice.geometry.coordinates[slice.geometry.coordinates.length - 1];
    const nextSliceFirstShapePoint = nextSlice
      ? nextSlice.geometry.coordinates[0]
      : null;

    const coordinates = [...slice.geometry.coordinates];

    if (slice.mode === 'foot') {
      if (
        prevSliceLastShapePoint &&
        (Math.abs(prevSliceLastShapePoint[0] - firstShapePoint[0]) >
          0.0000001 ||
          Math.abs(prevSliceLastShapePoint[1] - firstShapePoint[1]) > 0.0000001)
      ) {
        coordinates.unshift(prevSliceLastShapePoint);
      }

      if (
        nextSliceFirstShapePoint &&
        (Math.abs(nextSliceFirstShapePoint[0] - lastShapePoint[0]) >
          0.0000001 ||
          Math.abs(nextSliceFirstShapePoint[1] - lastShapePoint[1]) > 0.0000001)
      ) {
        coordinates.push(nextSliceFirstShapePoint);
      }
    }

    routeSlices.push({
      ...slice,
      geometry: {
        coordinates,
      },
    });
  }

  return { ...alt, itinerary: routeSlices };
}

function imhdSummary(
  m: Messages | undefined,
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

  return m?.routePlanner.imhd.total.full({
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
  m: Messages | undefined,
  language: string,
  { type, destination, departure, duration, number }: RouteStepExtra,
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return m?.routePlanner.imhd.step[type === 'foot' ? 'foot' : 'bus']({
    type: (m?.routePlanner.imhd.type as any)[type], // TODO
    destination,
    departure:
      departure === undefined ? undefined : dateFormat.format(departure * 1000),
    duration: duration === undefined ? undefined : Math.round(duration / 60),
    number,
  });
}

function bikesharingStep(
  m: Messages | undefined,
  { type, destination, duration }: RouteStepExtra,
) {
  return m?.routePlanner.bikesharing.step[type]({
    destination,
    duration: duration === undefined ? undefined : Math.round(duration / 60),
  });
}
