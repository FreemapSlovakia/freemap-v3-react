import { selectFeature } from '@app/store/actions.js';
import { routePlannerSetDeparture } from '@features/routePlanner/model/actions.js';
import { DateTime } from '@shared/components/DateTime.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { type ReactElement, useState } from 'react';
import { Form } from 'react-bootstrap';
import { FaCloudSun } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { QUARTER_MS } from '../model/routeRows.js';
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

  const departure = useAppSelector((state) => state.routePlanner.departure);

  const now = useNow();

  // Unset, the departure is the next quarter hour from when the panel opened,
  // held while it stays open: a moving default would reset a time being typed
  // and move every row, asking for each again.
  const [opened, setOpened] = useState({ open, at: now });

  if (open !== opened.open) {
    setOpened({ open, at: now });
  }

  const from = departure ?? Math.ceil(opened.at / QUARTER_MS) * QUARTER_MS;

  // What is being typed while it is no date yet; the field would reset to the
  // departure otherwise.
  const [typing, setTyping] = useState<string | null>(null);

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

            <DateTime
              value={typing ?? toDatetimeLocal(new Date(from))}
              onChange={(value) => {
                // Parsed as local time, as the field shows it.
                const ms = value ? new Date(value).getTime() : Number.NaN;

                if (Number.isNaN(ms)) {
                  setTyping(value);
                } else {
                  setTyping(null);

                  dispatch(routePlannerSetDeparture(ms));
                }
              }}
            />
          </Form.Group>

          {route ? (
            <RouteForecast route={route} departure={new Date(from)} whenPast />
          ) : (
            <p>{m?.noRoute}</p>
          )}
        </>
      )}
    </DockPanel>
  );
}
