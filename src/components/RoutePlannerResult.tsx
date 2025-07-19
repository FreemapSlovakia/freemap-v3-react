import { along } from '@turf/along';
import { lineString } from '@turf/helpers';
import { length } from '@turf/length';
import { Feature, Point } from 'geojson';
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
  GeoJSON,
  Marker,
  Polyline,
  Tooltip,
  useMapEvent,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectFeature, setTool } from '../actions/mainActions.js';
import {
  routePlannerAddPoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetPoint,
  routePlannerSetStart,
} from '../actions/routePlannerActions.js';
import { ElevationChartActivePoint } from '../components/ElevationChartActivePoint.js';
import { RichMarker } from '../components/RichMarker.js';
import { colors } from '../constants.js';
import { formatDistance } from '../distanceFormatter.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { selectingModeSelector } from '../selectors/mainSelectors.js';
import { transportTypeDefs } from '../transportTypeDefs.js';

const circularIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  html: `<div class="circular-leaflet-marker-icon" style="background-color: ${colors.normal}"></div>`,
});

export function RoutePlannerResult(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const points = useAppSelector((state) => state.routePlanner.points);

  const finishOnly = useAppSelector((state) => state.routePlanner.finishOnly);

  const alternatives = useAppSelector(
    (state) => state.routePlanner.alternatives,
  );

  const waypoints = useAppSelector((state) => state.routePlanner.waypoints);

  const isochrones = useAppSelector((state) => state.routePlanner.isochrones);

  const activeAlternativeIndex = useAppSelector(
    (state) => state.routePlanner.activeAlternativeIndex,
  );

  const transportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const mode = useAppSelector((state) => state.routePlanner.mode);

  const timestamp = useAppSelector((state) => state.routePlanner.timestamp);

  const milestonesMode = useAppSelector(
    (state) => state.routePlanner.milestones,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const zoom = useAppSelector((state) => state.map.zoom);

  const tRef = useRef<number>(undefined);

  const draggingRef = useRef<boolean>(undefined);

  const [dragLat, setDragLat] = useState<number>();

  const [dragLon, setDragLon] = useState<number>();

  const [dragSegment, setDragSegment] = useState<number>();

  const [dragAlt, setDragAlt] = useState<number>();

  const pickMode = useAppSelector((state) => state.routePlanner.pickMode);

  const tool = useAppSelector((state) => state.main.tool);

  const routePlannerToolActive = tool === 'route-planner';

  const interactive =
    useAppSelector(selectingModeSelector) || routePlannerToolActive;

  const selectedPoint = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.main.selection.id
      : undefined,
  );

  const [dragging, setDragging] = useState(false);

  const onlyStart =
    transportTypeDefs[transportType]?.api === 'gh' && mode !== 'route';

  useMapEvent(
    'click',
    useCallback(
      ({ latlng }: LeafletMouseEvent) => {
        if (window.fmEmbedded || dragging) {
          // nothing
        } else if (tool !== 'route-planner') {
          // nothing
        } else if (pickMode === 'start' || onlyStart) {
          dispatch(
            routePlannerSetStart({
              lat: latlng.lat,
              lon: latlng.lng,
            }),
          );
        } else if (pickMode === 'finish') {
          dispatch(
            routePlannerSetFinish({
              lat: latlng.lat,
              lon: latlng.lng,
            }),
          );
        } else {
          dispatch(setTool(null));
        }
      },
      [pickMode, dispatch, tool, dragging, onlyStart],
    ),
  );

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
      return (
        <div>
          <div>
            {m?.routePlanner.distance({
              value: formatDistance(distanceSum, language),
              diff:
                distanceDiff === undefined
                  ? undefined
                  : formatDistance(distanceDiff, language),
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

  const milestones = useMemo(() => {
    if (!milestonesMode || !alternatives[activeAlternativeIndex]) {
      return [];
    }

    const line = lineString(
      alternatives[activeAlternativeIndex].legs
        .flatMap((leg) => leg.steps)
        .filter((step) => step.geometry.coordinates.length > 1)
        .flatMap((step) => step.geometry.coordinates),
    );

    const len = length(line);

    const milestones: Feature<Point>[] = [];

    if (milestonesMode === 'abs') {
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

      for (let d = step; d < len; d += step) {
        const milestone = along(line, d);

        milestone.properties = { label: d };

        milestones.push(milestone);
      }
    } else {
      const pxLen = (len * Math.pow(2, zoom)) / 1000;

      const q = 50;

      const steps =
        pxLen < q
          ? pctSeq(50)
          : pxLen < q * 2
            ? pctSeq(25)
            : pxLen < q * 5
              ? pctSeq(10)
              : pxLen < q * 10
                ? pctSeq(5)
                : pxLen < q * 25
                  ? pctSeq(2)
                  : pctSeq(1);

      for (const pct of steps) {
        const milestone = along(line, (len / 100) * pct);

        milestone.properties = { label: pct };

        milestones.push(milestone);
      }
    }

    return milestones;
  }, [activeAlternativeIndex, alternatives, zoom, milestonesMode]);

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
      const { distance = undefined, duration = undefined } =
        alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

      return distance && duration ? (
        <Tooltip direction="top" permanent>
          {/* <div>{getPointDetails2(distance, duration)}</div> */}
          <div>{getPointDetails(points.length - 2, showDiff, true)}</div>
        </Tooltip>
      ) : null;
    },
    [alternatives, getPointDetails, points.length, activeAlternativeIndex],
  );

  const bringToFront = useCallback((ele: LPolyline) => {
    if (ele) {
      ele.bringToFront();
    }
  }, []);

  const handlePointClick = useCallback(
    (position: number) => {
      // also prevent default
      dispatch(selectFeature({ type: 'route-point', id: position }));
    },
    [dispatch],
  );

  const [pointHovering, setPointHovering] = useState<number>(-1);

  const handlePointMouseOver = useCallback((i: number) => {
    if (!draggingRef.current) {
      setPointHovering(i);
    }
  }, []);

  const handlePointMouseOut = useCallback(() => {
    setPointHovering(-1);
  }, []);

  const handlePolyMouseMove = useCallback(
    (e: LeafletMouseEvent, segment: number, alt: number) => {
      if (!routePlannerToolActive || draggingRef.current) {
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
    [routePlannerToolActive],
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

      if (dragSegment === undefined) {
        return;
      }

      dispatch(
        routePlannerAddPoint({
          point: {
            lat: e.target.getLatLng().lat,
            lon: e.target.getLatLng().lng,
          },
          position: dragSegment,
        }),
      );
    },
    [dispatch, dragSegment],
  );

  const changeAlternative = useCallback(
    (index: number) => {
      dispatch(routePlannerSetActiveAlternativeIndex(index));

      if (tool !== 'route-planner') {
        dispatch(setTool('route-planner'));
      }

      dispatch(selectFeature(null));
    },
    [dispatch, tool],
  );

  const handleFutureClick = useCallback(() => {
    if (dragAlt !== undefined) {
      changeAlternative(dragAlt);
    }
  }, [dragAlt, changeAlternative]);

  const handleRouteMarkerDragEnd = useCallback(
    (position: number, event: DragEndEvent) => {
      draggingRef.current = false;

      setTimeout(() => {
        setDragging(false);
      });

      const { lat, lng: lon } = event.target.getLatLng();

      dispatch(routePlannerSetPoint({ position, point: { lat, lon } }));
    },
    [dispatch],
  );

  const pointElements = useMemo(
    () =>
      points.map((point, i) => (
        <RichMarker
          key={`pt-${i}-${routePlannerToolActive}-${interactive}`}
          position={{ lat: point.lat, lng: point.lon }}
          interactive={interactive || selectedPoint === i}
          draggable={
            (routePlannerToolActive || selectedPoint === i) &&
            !window.fmEmbedded
          }
          label={
            i === 0 || (i === points.length - 1 && mode !== 'roundtrip')
              ? undefined
              : mode === 'route'
                ? i
                : waypoints[i]?.waypoint_index
          }
          color={
            i === 0 && !finishOnly
              ? selectedPoint === i
                ? '#a2daa2'
                : '#409a40'
              : mode !== 'roundtrip' && i === points.length - 1
                ? selectedPoint === i
                  ? '#feaca9'
                  : '#d9534f'
                : selectedPoint === i
                  ? '#9fb7ff'
                  : '#3e64d5'
          }
          faIcon={
            i === 0 && !finishOnly ? (
              <FaPlay color="#409a40" />
            ) : mode !== 'roundtrip' && i === points.length - 1 ? (
              <FaStop color="#d9534f" />
            ) : undefined
          }
          zIndexOffset={(i === 0 && !finishOnly) || points.length - 1 ? 10 : 1}
          eventHandlers={
            window.fmEmbedded
              ? {}
              : {
                  dragstart: handleDragStart,
                  dragend(e) {
                    handleRouteMarkerDragEnd(i, e);
                  },
                  click() {
                    handlePointClick(i);
                  },
                  mouseover() {
                    handlePointMouseOver(i);
                  },
                  mouseout: handlePointMouseOut,
                }
          }
        >
          {dragging ? null : i === points.length - 1 /* finish */ ? (
            mode === 'roundtrip' ? (
              <Tooltip direction="top">
                {getPointDetails(points.length - 2)}
              </Tooltip>
            ) : (
              getSummary(i === pointHovering)
            )
          ) : i === 0 && !finishOnly /* start */ ? (
            mode === 'roundtrip' && getSummary(i === pointHovering)
          ) : (
            <Tooltip direction="top" key={points.length}>
              {getPointDetails(i - 1)}
            </Tooltip>
          )}
        </RichMarker>
      )),
    [
      points,
      routePlannerToolActive,
      interactive,
      selectedPoint,
      mode,
      waypoints,
      finishOnly,
      handleDragStart,
      handlePointMouseOut,
      dragging,
      getPointDetails,
      handleRouteMarkerDragEnd,
      handlePointClick,
      handlePointMouseOver,
      getSummary,
      pointHovering,
    ],
  );

  const paths = useMemo(
    () =>
      alternatives
        .map((alternative, index) => ({
          ...alternative,
          alt: index,
          index: index === activeAlternativeIndex ? -1000 : index,
        }))
        .sort((a, b) => b.index - a.index)
        .map(({ legs, alt }) => (
          <Fragment key={`alt-${timestamp}-${alt}`}>
            {legs
              .flatMap((leg, legIndex) =>
                leg.steps.map((step) => ({ legIndex, ...step })),
              )
              .map((routeSlice, i: number) =>
                routeSlice.geometry.coordinates.length < 2 ? null : (
                  <Polyline
                    key={`slice-${i}-${interactive ? 'a' : 'b'}`}
                    interactive={interactive}
                    ref={bringToFront}
                    positions={routeSlice.geometry.coordinates.map(reverse)}
                    weight={10}
                    color="#fff"
                    bubblingMouseEvents={false}
                    eventHandlers={{
                      click() {
                        changeAlternative(alt);
                      },
                      mousemove: onlyStart
                        ? () => undefined
                        : (e: LeafletMouseEvent) =>
                            handlePolyMouseMove(e, routeSlice.legIndex, alt),

                      mouseout: handlePolyMouseOut,
                    }}
                  />
                ),
              )}

            {legs
              .flatMap((leg, legIndex) =>
                leg.steps.map((step) => ({ legIndex, ...step })),
              )
              .map((routeSlice, i: number) =>
                routeSlice.geometry.coordinates.length < 2 ? null : (
                  <Polyline
                    key={`slice-${timestamp}-${alt}-${i}-${
                      interactive ? 'a' : 'b'
                    }`}
                    ref={bringToFront}
                    positions={routeSlice.geometry.coordinates.map(reverse)}
                    weight={6}
                    pathOptions={{
                      color:
                        alt !== activeAlternativeIndex
                          ? '#868e96'
                          : routeSlice.legIndex % 2
                            ? 'hsl(211, 100%, 66%)'
                            : 'hsl(211, 100%, 50%)',
                    }}
                    opacity={/* alt === activeAlternativeIndex ? 1 : 0.5 */ 1}
                    dashArray={
                      ['foot', 'pushing bike', 'ferry'].includes(
                        routeSlice.mode,
                      )
                        ? '0, 10'
                        : undefined
                    }
                    interactive={false}
                    bubblingMouseEvents={false}
                  />
                ),
              )}
          </Fragment>
        )),
    [
      onlyStart,
      alternatives,
      activeAlternativeIndex,
      timestamp,
      interactive,
      bringToFront,
      handlePolyMouseOut,
      changeAlternative,
      handlePolyMouseMove,
    ],
  );

  return (
    <>
      {!window.fmEmbedded &&
        routePlannerToolActive &&
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

      {pointElements}

      {paths}

      {milestones.map((milestone, i) => (
        <CircleMarker
          radius={0}
          key={i}
          center={reverse(milestone.geometry.coordinates as [number, number])}
        >
          {!dragging && (
            <Tooltip className="compact" direction="right" permanent>
              <div>{milestone.properties?.['label']}</div>
            </Tooltip>
          )}
        </CircleMarker>
      ))}

      {isochrones?.map((isochrone) => (
        <GeoJSON
          key={'iso_' + timestamp + '_' + isochrone.properties?.['bucket']}
          interactive={false}
          style={(f) =>
            f?.properties['bucket'] === isochrones.length - 1
              ? { weight: 5, color: '#3388ff', fillOpacity: 0.15 }
              : {
                  weight: 5,
                  fill: false,
                  color: [
                    '#3388ff',
                    '#5f6fc8',
                    '#8b5692',
                    '#b73d5b',
                    '#e32525',
                  ][isochrones.length - f?.properties['bucket'] - 1],
                }
          }
          data={isochrone}
        />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}

function reverse(c: [number, number]) {
  return [c[1], c[0]] as [number, number];
}

function pctSeq(step: number) {
  const arr: number[] = [];

  for (let n = step; n < 100; n += step) {
    arr.push(n);
  }

  return arr;
}
