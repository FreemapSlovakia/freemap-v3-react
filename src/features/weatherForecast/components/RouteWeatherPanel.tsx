import { selectFeature } from '@app/store/actions.js';
import { useDepartureInput } from '@features/routePlanner/hooks/useDepartureInput.js';
import { legStops } from '@features/routePlanner/model/schedule.js';
import { DateTime } from '@shared/components/DateTime.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { FaCloudSun } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { RouteForecast } from './RouteForecast.js';

/** The weather along the route planner's active route, from its departure. */
export default function RouteWeatherPanel(): ReactElement {
  const dispatch = useDispatch();

  const m = useWeatherForecastMessages();

  const open = useAppSelector(
    (state) => state.main.selection?.type === 'route-weather',
  );

  const route = useAppSelector(
    (state) =>
      state.routePlanner.alternatives[
        state.routePlanner.activeAlternativeIndex
      ] ?? null,
  );

  const points = useAppSelector((state) => state.routePlanner.points);

  const mode = useAppSelector((state) => state.routePlanner.mode);

  const stops = useMemo(() => legStops(mode, points), [mode, points]);

  const input = useDepartureInput(open);

  return (
    <DockPanel
      item="route"
      show={open}
      icon={<FaCloudSun />}
      label={m?.alongRoute}
      title={() => m?.alongRoute}
      onClose={() => dispatch(selectFeature(null))}
    >
      {() => (
        <>
          <Form.Group className="mb-3">
            <Form.Label>{m?.departure}</Form.Label>

            <DateTime value={input.value} onChange={input.onChange} />
          </Form.Group>

          {route ? (
            <RouteForecast
              route={route}
              stops={stops}
              departure={new Date(input.from)}
              whenPast
            />
          ) : (
            <p>{m?.noRoute}</p>
          )}
        </>
      )}
    </DockPanel>
  );
}
