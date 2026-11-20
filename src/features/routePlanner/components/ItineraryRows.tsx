import { selectFeature } from '@app/store/actions.js';
import {
  fitToUncovered,
  panToUncovered,
} from '@features/map/panToUncovered.js';
import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import { ClickableRow } from '@shared/components/ClickableRow.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import { Fragment, type ReactElement } from 'react';
import { Table } from 'react-bootstrap';
import { FaBed, FaMugHot, FaPlay, FaStop } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setHoverSpot } from '../hoverSpot.js';
import type { Leg, RoutePoint, Step } from '../model/actions.js';
import type {
  Itinerary,
  ItineraryLeg,
  ItineraryWaypoint,
} from '../model/itinerary.js';
import { leansLeft, type Maneuver, maneuverOf } from '../model/maneuvers.js';
import { WAYPOINT_COLORS, waypointKind } from '../model/routeColors.js';
import { legsBbox } from '../model/routeGeometry.js';
import type { RoutePlannerMessages } from '../translations/RoutePlannerMessages.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { maneuverIcon } from './maneuverIcon.js';

type Shared = {
  rpm: RoutePlannerMessages | undefined;
  language: string;
};

/** The itinerary's table: waypoints, the legs between, and their turns. */
export function ItineraryRows({
  plan,
  turnByTurn,
}: {
  plan: Itinerary<Leg>;
  turnByTurn: boolean;
}): ReactElement {
  const rpm = useRoutePlannerMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const points = useAppSelector((state) => state.routePlanner.points);

  const finishOnly = useAppSelector((state) => state.routePlanner.finishOnly);

  // Numbers, so another selection re-renders nothing here.
  const selectedPoint = useAppSelector(({ main: { selection } }) =>
    selection?.type === 'route-point' ? selection.id : undefined,
  );

  const selectedLeg = useAppSelector(({ main: { selection } }) =>
    selection?.type === 'route-leg' ? selection.id : undefined,
  );

  const format = useDateTimeFormat(WEEKDAY_TIME);

  const shared = { rpm, language };

  return (
    <Table size="sm" hover className="align-middle">
      <tbody>
        {plan.waypoints.map((waypoint, i) => {
          const leg = plan.legs[i];

          return (
            <Fragment key={waypoint.index}>
              <WaypointRow
                {...shared}
                waypoint={waypoint}
                point={points[waypoint.index]}
                number={i}
                kind={waypointKind(
                  waypoint.index,
                  points.length,
                  finishOnly,
                  'route',
                )}
                format={format}
                selected={selectedPoint === waypoint.index}
              />

              {leg && (
                <LegRow
                  {...shared}
                  leg={leg}
                  selected={
                    selectedLeg !== undefined &&
                    selectedLeg >= leg.legs[0] &&
                    selectedLeg <= leg.legs[1]
                  }
                />
              )}

              {turnByTurn &&
                leg?.joined.flatMap((routeLeg, j) =>
                  routeLeg.steps.map((step, k) => {
                    const maneuver = maneuverOf(step);

                    // Past a shaping point the leg only goes on.
                    return maneuver && !(maneuver === 'depart' && j > 0) ? (
                      <StepRow
                        key={`s${leg.legs[0] + j}-${k}`}
                        {...shared}
                        step={step}
                        maneuver={maneuver}
                      />
                    ) : null;
                  }),
                )}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
}

/** Distance and moving time, each kept with its unit. */
function Figures({
  metres,
  seconds,
  language,
}: {
  metres: number;
  seconds: number;
  language: string;
}): ReactElement {
  return (
    <>
      <span className="text-nowrap">{formatDistance(metres, language)}</span>
      {' · '}
      <span className="text-nowrap">{formatDuration(seconds, language)}</span>
    </>
  );
}

function WaypointRow({
  rpm,
  language,
  waypoint,
  point,
  number,
  kind,
  format,
  selected,
}: Shared & {
  waypoint: ItineraryWaypoint;
  point: RoutePoint | undefined;
  number: number;
  kind: ReturnType<typeof waypointKind>;
  format: Intl.DateTimeFormat;
  selected: boolean;
}): ReactElement {
  const dispatch = useDispatch();

  const name = usePlaceName(point, true);

  const { stop } = waypoint;

  return (
    <ClickableRow
      active={selected}
      onClick={() => {
        dispatch(selectFeature({ type: 'route-point', id: waypoint.index }));

        if (point) {
          void panToUncovered(dispatch, point);
        }
      }}
    >
      <td
        className="ps-2 text-center"
        // White on the selection's blue, which would hide a stop's number.
        style={selected ? undefined : { color: WAYPOINT_COLORS[kind] }}
      >
        {kind === 'start' ? (
          <FaPlay />
        ) : kind === 'finish' ? (
          <FaStop />
        ) : (
          <b>{number}</b>
        )}
      </td>

      <td>
        <div className="fw-semibold">
          {name ?? (point ? latLonToString(point, language) : '…')}
        </div>

        {number > 0 && (
          <div className="small text-muted">
            <Figures
              metres={waypoint.metres}
              seconds={waypoint.seconds}
              language={language}
            />
          </div>
        )}

        {stop && (
          <div className="small text-muted">
            {stop.kind === 'pause' ? (
              <>
                <FaMugHot /> {stop.minutes} {rpm?.waypointStop.minutes}
              </>
            ) : (
              <>
                <FaBed />
                {stop.nights > 1 && ` × ${stop.nights}`}
              </>
            )}
          </div>
        )}
      </td>

      <td className="text-end text-nowrap pe-2">
        {/* Only from a set departure; `format` of nothing is now. */}
        {number === 0
          ? waypoint.leave !== undefined && (
              <div>{format.format(waypoint.leave)}</div>
            )
          : waypoint.arrival !== undefined && (
              <>
                <div>{format.format(waypoint.arrival)}</div>

                {/* A stop's end, as the weather writes its span. */}
                {waypoint.leave !== undefined &&
                  waypoint.leave !== waypoint.arrival && (
                    <div className="small text-muted">
                      – {format.format(waypoint.leave)}
                    </div>
                  )}
              </>
            )}
      </td>
    </ClickableRow>
  );
}

function LegRow({
  language,
  leg,
  selected,
}: Shared & {
  leg: ItineraryLeg<Leg>;
  selected: boolean;
}): ReactElement {
  const dispatch = useDispatch();

  return (
    <ClickableRow
      active={selected}
      className="small text-muted"
      onClick={() => {
        // A stretch is named by its first leg, as the line's click names it.
        dispatch(selectFeature({ type: 'route-leg', id: leg.legs[0] }));

        const bbox = legsBbox(leg.joined);

        if (bbox) {
          void fitToUncovered(dispatch, bbox);
        }
      }}
    >
      <td className="ps-2 text-center">
        {leg.transports.map((transport, i) => (
          // A transport may come back within one leg.
          <span key={i}>{transportTypeDefs[transport].icon}</span>
        ))}
      </td>

      <td colSpan={2} className="pe-2">
        <Figures
          metres={leg.metres}
          seconds={leg.seconds}
          language={language}
        />
      </td>
    </ClickableRow>
  );
}

function StepRow({
  rpm,
  language,
  step,
  maneuver,
}: Shared & {
  step: Step;
  maneuver: Maneuver;
}): ReactElement {
  const dispatch = useDispatch();

  const at = step.geometry.coordinates[0];

  const left = leansLeft(step);

  return (
    <ClickableRow
      className="small"
      onClick={() => {
        if (at) {
          void panToUncovered(dispatch, { lat: at[1], lon: at[0] });
        }
      }}
      onHover={(on) =>
        setHoverSpot(
          on && at
            ? { kind: 'maneuver', lat: at[1], lon: at[0], maneuver, left }
            : null,
        )
      }
    >
      <td className="ps-2 text-center fs-6">{maneuverIcon(maneuver, left)}</td>

      <td>
        <div>{rpm?.turnByTurn.maneuvers[maneuver]}</div>

        {step.name && <div className="text-muted">{step.name}</div>}
      </td>

      <td className="text-end text-nowrap text-muted pe-2">
        {step.distance > 0 && formatDistance(step.distance, language)}
      </td>
    </ClickableRow>
  );
}
