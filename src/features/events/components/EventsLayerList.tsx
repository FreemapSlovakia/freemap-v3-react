import { selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { onMap } from '@features/map/hooks/leafletElementHolder.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { PanelToolbarSlotContext } from '@features/mapSettings/panelHeaderSlot.js';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { fuzzyMatch, prepareFuzzyTarget } from '@shared/fuzzyMatch.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLngBounds } from 'leaflet';
import {
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Form, ListGroup, ToggleButton } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { MdCropFree } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';
import { eventsSetListInView, eventsSetListSort } from '../model/actions.js';
import { eventColor } from '../model/colorize.js';
import {
  type EventsListSort,
  EventsListSortSchema,
  sortEvents,
} from '../model/listSort.js';
import { selectedEventId } from '../model/selectors.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventTraits } from './EventTraits.js';
import { useEventDatesFormat } from './useEventDatesFormat.js';

const PAGE = 50;

/** The events the layer shows, on its page in the map layers panel. */
export function EventsLayerList(): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const events = useAppSelector((state) => state.events.list);

  const near = useAppSelector((state) => state.events.filter.near);

  const home = useAppSelector((state) => state.homeLocation.homeLocation);

  // Read when needed, not subscribed: the list needn't re-render on every pan.
  const store = useStore<RootState>();

  const mapCenter = () => {
    const { lat, lon } = store.getState().map;

    return { lat, lon };
  };

  const sort = useAppSelector((state) => state.eventsSettings.listSort);

  const colorizeBy = useAppSelector((state) => state.eventsSettings.colorizeBy);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const language = useAppSelector((state) => state.l10n.language);

  const now = useNow();

  const inView = useAppSelector((state) => state.eventsSettings.listInView);

  const toolbarSlot = useContext(PanelToolbarSlotContext);

  const [query, setQuery] = useState('');

  // The center as the list opened or the sort was chosen, not as it pans: a
  // row clicked pans the map, and a live one would re-sort it from under the
  // cursor. "In view" is what follows the map.
  const [center, setCenter] = useState(mapCenter);

  // A distance sort needs its origin; without one it can't be chosen.
  const unavailable: Partial<Record<EventsListSort, boolean>> = {
    nearHome: !home,
    nearPlace: !near,
  };

  const effectiveSort = unavailable[sort] ? 'date' : sort;

  // One whose origin went away is by date from then on, so choosing date
  // later isn't a no-op leaving the old sort to come back.
  useEffect(() => {
    if (effectiveSort !== sort) {
      dispatch(eventsSetListSort('date'));
    }
  }, [effectiveSort, sort, dispatch]);

  // The map's view, watched only while the list keeps to it.
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    if (!inView) {
      // Not to filter by a stale view when turned on again.
      setBounds(null);

      return;
    }

    let off: (() => void) | undefined;

    // A remounted map (max zoom changed) is watched instead.
    const unsubscribe = onMap((map) => {
      off?.();

      const update = () => setBounds(map.getBounds());

      update();

      map.on('moveend', update);

      off = () => map.off('moveend', update);
    });

    return () => {
      unsubscribe();

      off?.();
    };
  }, [inView]);

  // Normalized once per list, not on every keystroke.
  const targets = useMemo(
    () => new Map(events.map((e) => [e.id, prepareFuzzyTarget(e.title)])),
    [events],
  );

  const list = useMemo(() => {
    const q = query.trim();

    const found = events.filter(
      (e) =>
        (!inView ||
          !bounds ||
          bounds.contains([e.startPoint.lat, e.startPoint.lon])) &&
        (!q || fuzzyMatch(q, targets.get(e.id)!) !== null),
    );

    return sortEvents(
      found,
      effectiveSort,
      {
        nearMap: center,
        nearHome: home,
        nearPlace: near ?? null,
      },
      language,
    );
  }, [
    events,
    targets,
    query,
    effectiveSort,
    center,
    home,
    near,
    language,
    inView,
    bounds,
  ]);

  const { shown, more, reset } = usePaged(list, PAGE);

  // A new order, search or scope starts from its top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: these are what reset it
  useEffect(() => {
    reset();
  }, [query, effectiveSort, center, inView, near, home, bounds]);

  const kmFormat = new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  });

  const selectedId = useAppSelector(selectedEventId);

  const formatDates = useEventDatesFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (events.length === 0) {
    return <p className="text-muted mb-2">{em?.noEvents}</p>;
  }

  const controls = (
    <>
      <Form.Control
        type="search"
        size="sm"
        className="mb-2"
        placeholder={em?.list.search}
        value={query}
        onChange={(e) => {
          const next = e.currentTarget.value;

          // Once per search, not per keystroke.
          if (!query.trim() && next.trim()) {
            trackMatomo(['trackEvent', 'Events', 'listSearch']);
          }

          setQuery(next);
        }}
      />

      <div className="d-flex gap-2 mb-2">
        <Form.Select
          size="sm"
          className="flex-grow-1 w-auto"
          value={effectiveSort}
          onChange={(e) => {
            const next = EventsListSortSchema.parse(e.currentTarget.value);

            if (next === 'nearMap') {
              setCenter(mapCenter());
            }

            trackMatomo(['trackEvent', 'Events', 'listSort', next]);

            dispatch(eventsSetListSort(next));
          }}
        >
          {EventsListSortSchema.options.map((option) => (
            <option key={option} value={option} disabled={unavailable[option]}>
              {em?.list.sorts[option]}
            </option>
          ))}
        </Form.Select>

        <LongPressTooltip label={em?.list.inView}>
          {({ props }) => (
            <ToggleButton
              id="eventsListInView"
              type="checkbox"
              size="sm"
              variant="outline-primary"
              value="1"
              checked={inView}
              onChange={(e) => {
                const on = e.currentTarget.checked;

                if (on) {
                  trackMatomo(['trackEvent', 'Events', 'listInView']);
                }

                dispatch(eventsSetListInView(on));
              }}
              {...props}
            >
              <MdCropFree />
            </ToggleButton>
          )}
        </LongPressTooltip>
      </div>
    </>
  );

  return (
    <>
      {/* In the panel's toolbar, staying put while the list scrolls. */}
      {toolbarSlot ? createPortal(controls, toolbarSlot) : controls}

      {list.length === 0 ? (
        <p className="text-muted mb-2">{em?.list.noMatch}</p>
      ) : (
        <ListGroup className="mb-2">
          {shown.map(({ event, km }) => (
            <ListGroup.Item
              key={event.id}
              action
              active={event.id === selectedId}
              // The marker's colour, so a row is found on the map by it.
              style={{
                borderLeft: `4px solid ${eventColor(event, colorizeBy, userId, now)}`,
              }}
              onClick={() => {
                dispatch(selectFeature({ type: 'event', id: event.id }));

                void panToUncovered(dispatch, event.startPoint, {
                  ifHidden: true,
                });
              }}
            >
              <div className="text-truncate">{event.title}</div>

              <small className="d-flex align-items-center gap-2">
                <span className="text-truncate">
                  {formatDates(event)}
                  {km !== undefined && ` · ${kmFormat.format(km)} km`}
                </span>

                <span className="ms-auto">
                  <EventTraits event={event} />
                </span>
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {more}
    </>
  );
}
