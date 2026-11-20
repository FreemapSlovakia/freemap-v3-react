import { nextQuarter, toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { routePlannerSetDeparture } from '../model/actions.js';

/**
 * The route's departure for a date-time field. Unset, it is the next quarter
 * hour from when `shown` last turned on, held so typing isn't reset.
 */
export function useDepartureInput(shown = true): {
  /** The set departure, epoch ms; null when unset. */
  departure: number | null;
  /** The departure in effect, epoch ms. */
  from: number;
  /** Set, and its minute is over. */
  past: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Unsets the departure, dropping what is being typed. */
  clear: () => void;
} {
  const dispatch = useDispatch();

  const departure = useAppSelector((state) => state.routePlanner.departure);

  const now = useNow();

  const [opened, setOpened] = useState({ shown, at: now });

  if (shown !== opened.shown) {
    setOpened({ shown, at: now });
  }

  const from = departure ?? nextQuarter(opened.at);

  // What is typed while it is no date yet; the field would reset otherwise.
  const [typing, setTyping] = useState<string | null>(null);

  return {
    departure,
    from,
    // The field holds whole minutes.
    past: departure !== null && departure + 60_000 <= now,
    value: typing ?? toDatetimeLocal(new Date(from)),
    onChange: (value) => {
      // Parsed as local time, as the field shows it.
      const ms = value ? new Date(value).getTime() : Number.NaN;

      if (Number.isNaN(ms)) {
        setTyping(value);
      } else {
        setTyping(null);

        if (departure === null) {
          trackMatomo(['trackEvent', 'RoutePlanner', 'departure']);
        }

        dispatch(routePlannerSetDeparture(ms));
      }
    },
    clear: () => {
      setTyping(null);

      // The default restarts from now, not from when the field was shown.
      setOpened({ shown, at: Date.now() });

      dispatch(routePlannerSetDeparture(null));
    },
  };
}
