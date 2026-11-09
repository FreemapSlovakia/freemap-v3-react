import { selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { onMap } from '@features/map/hooks/leafletElementHolder.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import {
  ListSearch,
  ListSortDropdown,
  PanelToolbar,
} from '@features/mapSettings/components/PanelListControls.js';
import { PanelHeaderSlotContext } from '@features/mapSettings/panelHeaderSlot.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
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
import { Dropdown, ListGroup, ToggleButton } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import {
  FaCheck,
  FaCrosshairs,
  FaEye,
  FaHome,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaRegCheckSquare,
  FaRegClock,
  FaRegSquare,
  FaRulerHorizontal,
  FaSortAlphaDown,
  FaStar,
} from 'react-icons/fa';
import { MdCropFree, MdTrendingUp } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';
import {
  eventsSetListInView,
  eventsSetListSort,
  eventsToggleListTrait,
} from '../model/actions.js';
import { eventColor } from '../model/colorize.js';
import {
  type EventsListSort,
  EventsListSortSchema,
  EventsListTraitSchema,
  isNearSort,
  STAT_SORTS,
  sortEvents,
} from '../model/listSort.js';
import { selectedEventId } from '../model/selectors.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventLine } from './EventLine.js';
import { EventIndicators, traitLabel } from './EventTraits.js';

const PAGE = 50;

// A stat's two directions share its icon.
const SORT_ICONS: Record<EventsListSort, ReactElement> = {
  date: <FaRegCalendarAlt />,
  title: <FaSortAlphaDown />,
  lengthAsc: <FaRulerHorizontal />,
  lengthDesc: <FaRulerHorizontal />,
  ascentAsc: <MdTrendingUp />,
  ascentDesc: <MdTrendingUp />,
  durationAsc: <FaRegClock />,
  durationDesc: <FaRegClock />,
  nearMap: <FaCrosshairs />,
  nearHome: <FaHome />,
  nearPlace: <FaMapMarkerAlt />,
  interestedDesc: <FaStar />,
  goingDesc: <FaCheck />,
};

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

  const headerSlot = useContext(PanelHeaderSlotContext);

  const listTraits = useAppSelector((state) => state.eventsSettings.listTraits);

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

  // What the rows show: the ticked traits and the stat the list is sorted by.
  const traits = new Set(listTraits);

  const sortedStat = STAT_SORTS[effectiveSort]?.stat;

  if (sortedStat) {
    traits.add(sortedStat);
  }

  const selectedId = useAppSelector(selectedEventId);

  const display = (
    <Dropdown
      autoClose="outside"
      onSelect={(key) => {
        const trait = EventsListTraitSchema.parse(key);

        if (!listTraits.includes(trait)) {
          trackMatomo(['trackEvent', 'Events', 'listTrait', trait]);
        }

        dispatch(eventsToggleListTrait(trait));
      }}
    >
      <LongPressTooltip label={em?.list.show}>
        {({ props }) => (
          <Dropdown.Toggle
            variant="secondary"
            className="flex-shrink-0"
            {...props}
          >
            <FaEye />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        {EventsListTraitSchema.options.map((trait) => (
          <Dropdown.Item
            as="button"
            key={trait}
            eventKey={trait}
            active={traits.has(trait)}
            // The stat sorted by shows whatever is ticked.
            disabled={trait === sortedStat}
          >
            {traits.has(trait) ? <FaRegCheckSquare /> : <FaRegSquare />}
            <MenuLabel>{traitLabel(em, trait)}</MenuLabel>
          </Dropdown.Item>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );

  const header = headerSlot && createPortal(display, headerSlot);

  if (events.length === 0) {
    return (
      <>
        {header}

        <p className="text-muted mb-2">{em?.noEvents}</p>
      </>
    );
  }

  const controls = (
    <>
      <ListSearch
        placeholder={em?.list.search}
        value={query}
        onChange={setQuery}
        onSearchStart={() =>
          trackMatomo(['trackEvent', 'Events', 'listSearch'])
        }
      />

      <div className="d-flex gap-2 mb-2">
        <ListSortDropdown
          options={EventsListSortSchema.options.map((option) => ({
            id: option,
            label: em?.list.sorts[option],
            icon: SORT_ICONS[option],
            disabled: unavailable[option],
          }))}
          value={effectiveSort}
          onChange={(next) => {
            if (next === 'nearMap') {
              setCenter(mapCenter());
            }

            trackMatomo(['trackEvent', 'Events', 'listSort', next]);

            dispatch(eventsSetListSort(next));
          }}
        />

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
      <PanelToolbar>{controls}</PanelToolbar>

      {header}

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
              <div className="d-flex align-items-center gap-2">
                <span className="text-truncate me-auto">{event.title}</span>

                <EventIndicators event={event} traits={traits} />
              </div>

              <EventLine
                event={event}
                traits={traits}
                near={
                  km !== undefined && isNearSort(effectiveSort)
                    ? { sort: effectiveSort, km }
                    : undefined
                }
                sorted={sortedStat}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {more}
    </>
  );
}
