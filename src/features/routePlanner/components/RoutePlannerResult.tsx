import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import { along } from '@turf/along';
import { lineString } from '@turf/helpers';
import { length } from '@turf/length';
import { Feature, Point } from 'geojson';
import {
  DragEndEvent,
  LatLng,
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
  Polyline,
  Tooltip,
  useMapEvent,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  routePlannerAddPoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetPoint,
  routePlannerSetStart,
  StepMode,
} from '../model/actions.js';

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

  const [dragging, setDragging] = useState(false);

  const draggingRef = useRef(false);

  const [dragLatLng, setDragLatLng] = useState<LatLng>();

  const dragSegment = useRef<number | undefined>(undefined);

  const pickMode = useAppSelector((state) => state.routePlanner.pickMode);

  const tool = useAppSelector((state) => state.main.tool);

  const selectedPoint = useAppSelector((state) =>
    state.main.selection?.type === 'route-point'
      ? state.main.selection.id
      : undefined,
  );

  const selectedSegment = useAppSelector((state) =>
    state.main.selection?.type === 'route-leg'
      ? state.main.selection.id
      : undefined,
  );

  const routePlannerToolActive =
    tool === 'route-planner' ||
    selectedPoint !== undefined ||
    selectedSegment !== undefined;

  const interactive =
    useAppSelector(selectingModeSelector) || routePlannerToolActive;

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
        }
      },
      [pickMode, dispatch, tool, dragging, onlyStart],
    ),
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
          {!isNaN(durationSum) && (
            <div>
              {m?.routePlanner.duration({
                h: Math.floor(Math.round(durationSum / 60) / 60),
                m: Math.round(durationSum / 60) % 60,
                diff:
                  durationDiff === undefined || isNaN(durationDiff)
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
      const { distance } =
        alternatives.find((_, alt) => alt === activeAlternativeIndex) || {};

      return distance ? (
        <Tooltip direction="top" permanent>
          <div>{getPointDetails(points.length - 2, showDiff, true)}</div>
        </Tooltip>
      ) : null;
    },
    [alternatives, getPointDetails, points.length, activeAlternativeIndex],
  );

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

  const handleDragStart = useCallback(() => {
    draggingRef.current = true;

    setDragging(true);
  }, []);

  const changeAlternative = useCallback(
    (alternative: number) => {
      dispatch(routePlannerSetActiveAlternativeIndex(alternative));
    },
    [dispatch],
  );

  const handleRouteMarkerDragEnd = useCallback(
    (position: number, event: DragEndEvent) => {
      draggingRef.current = false;

      setTimeout(() => {
        setDragging(false);
      });

      const { lat, lng: lon } = event.target.getLatLng();

      dispatch(
        routePlannerSetPoint({
          position,
          point: {
            lat,
            lon,
            transport: points[position].transport,
          },
        }),
      );
    },
    [dispatch, points],
  );

  const map = useMap();

  const routePlannerToolActiveRef = useRef(routePlannerToolActive);

  useEffect(() => {
    routePlannerToolActiveRef.current = routePlannerToolActive;
  }, [routePlannerToolActive]);

  const mouseUpTsRef = useRef(0);

  useEffect(() => {
    if (!map) {
      return;
    }

    let moved = false;

    // this is to prevent map-click on drag-end
    const mapContainerClickHandler = (ev: PointerEvent): void => {
      if (Date.now() < mouseUpTsRef.current + 100) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    };

    map
      .getContainer()
      .addEventListener('click', mapContainerClickHandler, true);

    const handleMouseUp = (e: LeafletMouseEvent) => {
      map.dragging.enable();

      const segment = dragSegment.current;

      dragSegment.current = undefined;

      if (!moved || segment === undefined) {
        return;
      }

      mouseUpTsRef.current = Date.now();

      dispatch(
        routePlannerAddPoint({
          point: {
            lat: e.latlng.lat,
            lon: e.latlng.lng,
          },
          position: segment,
        }),
      );

      setDragLatLng(undefined);

      moved = false;
    };

    map.addEventListener('mouseup', handleMouseUp);

    const handleMouseMove = (e: LeafletMouseEvent) => {
      if (
        dragSegment.current === undefined ||
        !routePlannerToolActiveRef.current
      ) {
        return;
      }

      moved = true;

      setDragLatLng(e.latlng);
    };

    map.addEventListener('mousemove', handleMouseMove);

    return () => {
      map.removeEventListener('mouseup', handleMouseUp);
      map.removeEventListener('mousemove', handleMouseMove);
      map
        .getContainer()
        .removeEventListener('click', mapContainerClickHandler, true);
    };
  }, [map, dispatch]);

  const pointElements = useMemo(
    () =>
      points.map((point, i) => (
        <RichMarker
          key={`pt-${i}-${routePlannerToolActive}-${interactive}`}
          position={{ lat: point.lat, lng: point.lon }}
          interactive={window.fmEmbedded || interactive || selectedPoint === i}
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
          <Fragment
            key={`alt-${timestamp}--${activeAlternativeIndex}-${alt}-${selectedSegment}`}
          >
            {legs
              .flatMap((leg, legIndex) =>
                leg.steps.map((step) => ({ legIndex, ...step })),
              )
              .map((routeSlice, i: number) =>
                routeSlice.geometry.coordinates.length < 2 ? null : (
                  // background halo
                  <Polyline
                    key={`slice-${i}-${interactive}`}
                    interactive={interactive}
                    ref={bringToFront}
                    positions={routeSlice.geometry.coordinates.map(reverse)}
                    weight={10}
                    color={
                      selectedSegment === routeSlice.legIndex &&
                      alt === activeAlternativeIndex
                        ? '#156efd'
                        : '#fff'
                    }
                    bubblingMouseEvents={false}
                    eventHandlers={{
                      click() {
                        changeAlternative(alt);

                        dispatch(
                          selectFeature({
                            type: 'route-leg',
                            id: routeSlice.legIndex,
                          }),
                        );
                      },

                      mousedown() {
                        if (onlyStart || !routePlannerToolActiveRef.current) {
                          return;
                        }

                        map?.dragging.disable();
                        dragSegment.current = routeSlice.legIndex;
                      },
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
                  // foreground
                  <Polyline
                    key={`slice-${timestamp}-${alt}-${i}-${interactive}`}
                    ref={bringToFront}
                    positions={routeSlice.geometry.coordinates.map(reverse)}
                    weight={6}
                    pathOptions={{
                      color:
                        alt !== activeAlternativeIndex
                          ? '#868e96'
                          : (
                              {
                                manual: '#868e96',
                                cycling: '#968dfd',
                                driving: '#25a6fd',
                                walking: '#1db2c0',
                                'pushing bike': '#1db2c0',
                                foot: '#1db2c0',
                                ferry: '#3060ff',
                                train: '#000',
                                error: '#f00',
                              } satisfies Record<StepMode, string>
                            )[routeSlice.mode],
                    }}
                    opacity={/* alt === activeAlternativeIndex ? 1 : 0.5 */ 1}
                    dashArray={
                      ['manual', 'pushing bike', 'ferry', 'error'].includes(
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
      selectedSegment,
      changeAlternative,
      map,
      dispatch,
    ],
  );

  return (
    <>
      {!window.fmEmbedded && routePlannerToolActive && dragLatLng && (
        <RichMarker
          interactive={false}
          color="#156efd"
          opacity={0.5}
          position={dragLatLng}
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

function bringToFront(ele: LPolyline) {
  ele?.bringToFront();
}
