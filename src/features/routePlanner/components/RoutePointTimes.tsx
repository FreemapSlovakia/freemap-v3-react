import { Text } from '@features/l10n/Text.js';
import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement } from 'react';
import { useRouteSchedule } from '../hooks/useRouteSchedule.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

/**
 * When a waypoint of a route in order is reached, and left where it holds a
 * stop; only from a set departure.
 */
export function RoutePointTimes({
  index,
}: {
  index: number;
}): ReactElement | null {
  const rpm = useRoutePlannerMessages();

  const schedule = useRouteSchedule();

  const format = useDateTimeFormat(WEEKDAY_TIME);

  const times = schedule?.times?.[index];

  if (!times) {
    return null;
  }

  return (
    <span className="align-self-center text-nowrap mx-1">
      <Text m={rpm}>
        {(rpm) => rpm.arrival({ time: format.format(times.arrival) })}
      </Text>

      {times.leave !== times.arrival && (
        <>
          {' · '}
          <Text m={rpm}>
            {(rpm) => rpm.departure({ time: format.format(times.leave) })}
          </Text>
        </>
      )}
    </span>
  );
}
