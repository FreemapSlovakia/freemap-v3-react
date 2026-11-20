import { nextQuarter, toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { routePlannerSetDeparture } from '../model/actions.js';

/** The route's departure for a date-time field, and turning it on and off. */
export function useDepartureInput(): {
  /** The set departure, epoch ms; null when there is none. */
  departure: number | null;
  /** Set, and its minute is over. */
  past: boolean;
  /** Empty without a departure. */
  value: string;
  onChange: (value: string) => void;
  /** Left empty (a picker's Clear), no departure; `incomplete`: half typed. */
  onBlur: (value: string, incomplete: boolean) => void;
  /** Sets the next quarter hour, or unsets the departure. */
  toggle: () => void;
} {
  const dispatch = useDispatch();

  const departure = useAppSelector((state) => state.routePlanner.departure);

  const now = useNow();

  // What is typed while it is no date yet; the field would reset otherwise.
  const [typing, setTyping] = useState<string | null>(null);

  return {
    departure,
    // The field holds whole minutes.
    past: departure !== null && departure + 60_000 <= now,
    value:
      typing ??
      (departure === null ? '' : toDatetimeLocal(new Date(departure))),
    onBlur: (value, incomplete) => {
      setTyping(null);

      if (!value && !incomplete) {
        dispatch(routePlannerSetDeparture(null));
      }
    },
    onChange: (value) => {
      // Parsed as local time, as the field shows it.
      const ms = value ? new Date(value).getTime() : Number.NaN;

      if (Number.isNaN(ms)) {
        setTyping(value);
      } else {
        setTyping(null);

        dispatch(routePlannerSetDeparture(ms));
      }
    },
    toggle: () => {
      setTyping(null);

      if (departure === null) {
        trackMatomo(['trackEvent', 'RoutePlanner', 'departure']);

        dispatch(routePlannerSetDeparture(nextQuarter(Date.now())));
      } else {
        dispatch(routePlannerSetDeparture(null));
      }
    },
  };
}
