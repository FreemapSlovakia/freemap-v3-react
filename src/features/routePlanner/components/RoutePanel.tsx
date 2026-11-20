import { panToUncovered } from '@features/map/panToUncovered.js';
import { RouteForecast } from '@features/weatherForecast/components/RouteForecast.js';
import { useWeatherForecastMessages } from '@features/weatherForecast/translations/useWeatherForecastMessages.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useMemo } from 'react';
import { Form, ToggleButton } from 'react-bootstrap';
import { FaCloudSun, FaListOl } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  routePanelShown,
  routePanelView,
  trackRoutePanelView,
} from '../hooks/useRoutePanel.js';
import { useRouteSchedule } from '../hooks/useRouteSchedule.js';
import { setHoverSpot } from '../hoverSpot.js';
import {
  type RoutePanelView,
  routePlannerSetPanelOpen,
  routePlannerSetPanelView,
  routePlannerSetTurnByTurn,
} from '../model/actions.js';
import { itinerary } from '../model/itinerary.js';
import { tolledMeters } from '../model/pathDetails.js';
import { legStops } from '../model/schedule.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { ItineraryRows } from './ItineraryRows.js';
import { RouteDepartureControl } from './RouteDepartureControl.js';
import { RouteSummary } from './RouteSummary.js';

/** The route planner's route: its itinerary, or its weather, from a departure. */
export default function RoutePanel(): ReactElement {
  const dispatch = useDispatch();

  const rpm = useRoutePlannerMessages();

  const wfm = useWeatherForecastMessages();

  const open = useAppSelector(routePanelShown);

  const mode = useAppSelector((state) => state.routePlanner.mode);

  // The other modes reorder the points, which an itinerary would have to follow.
  const hasItinerary = mode === 'route';

  const view = useAppSelector(routePanelView);

  const turnByTurn = useAppSelector(
    (state) => state.routePlannerSettings.turnByTurn,
  );

  const route = useAppSelector(
    (state) =>
      state.routePlanner.alternatives[
        state.routePlanner.activeAlternativeIndex
      ] ?? null,
  );

  const points = useAppSelector((state) => state.routePlanner.points);

  const transportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const stops = useMemo(
    () => (view === 'weather' ? legStops(mode, points) : undefined),
    [view, mode, points],
  );

  const schedule = useRouteSchedule();

  const plan = useMemo(
    () =>
      route && open && view === 'itinerary'
        ? itinerary(points, transportType, route.legs, schedule?.times)
        : undefined,
    [route, open, view, points, transportType, schedule?.times],
  );

  // Its rows stay mounted to slide out, so their hover goes with the panel.
  useEffect(() => {
    if (!open) {
      setHoverSpot(null);
    }
  }, [open]);

  const label = view === 'itinerary' ? rpm?.itinerary.title : wfm?.alongRoute;

  return (
    <DockPanel
      item={open ? 'route' : null}
      show={open}
      icon={view === 'itinerary' ? <FaListOl /> : <FaCloudSun />}
      label={label}
      title={() => label}
      manual="route-planner"
      onClose={() => dispatch(routePlannerSetPanelOpen(false))}
    >
      {() => (
        <>
          {hasItinerary && (
            <FitToggleButtonGroup
              type="radio"
              name="routePanelView"
              className="w-100 mb-3"
              value={view}
              onChange={(next: RoutePanelView) => {
                trackRoutePanelView(next);

                dispatch(routePlannerSetPanelView(next));
              }}
            >
              <ToggleButton
                id="routePanelView-itinerary"
                value="itinerary"
                variant="outline-primary"
              >
                <FaListOl /> {rpm?.itinerary.title}
              </ToggleButton>

              <ToggleButton
                id="routePanelView-weather"
                value="weather"
                variant="outline-primary"
              >
                <FaCloudSun /> {rpm?.itinerary.weather}
              </ToggleButton>
            </FitToggleButtonGroup>
          )}

          <RouteDepartureControl className="mb-3 flex-nowrap" />

          {!route ? (
            <p>{wfm?.noRoute}</p>
          ) : view === 'weather' ? (
            !schedule ? (
              <p className="text-muted">{rpm?.itinerary.noDeparture}</p>
            ) : (
              <RouteForecast
                route={route}
                stops={stops}
                departure={new Date(schedule.departure)}
                whenPast
                onHover={(row) =>
                  setHoverSpot(
                    row && { kind: 'weather', lat: row.lat, lon: row.lon },
                  )
                }
                onClick={(row) => void panToUncovered(dispatch, row)}
              />
            )
          ) : (
            <>
              <div className="mb-3">
                <RouteSummary
                  distance={route.distance}
                  duration={route.duration}
                  tolled={tolledMeters(route)}
                  withStops={schedule?.withStops}
                  arrival={schedule?.end}
                />
              </div>

              <Form.Check
                type="switch"
                id="routePanelTurnByTurn"
                className="mb-2"
                label={rpm?.turnByTurn.label}
                checked={turnByTurn}
                onChange={(e) => {
                  const on = e.currentTarget.checked;

                  if (on) {
                    trackMatomo(['trackEvent', 'RoutePlanner', 'turnByTurn']);
                  }

                  dispatch(routePlannerSetTurnByTurn(on));
                }}
              />

              {plan && <ItineraryRows plan={plan} turnByTurn={turnByTurn} />}
            </>
          )}
        </>
      )}
    </DockPanel>
  );
}
