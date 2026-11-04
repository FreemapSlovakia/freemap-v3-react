import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { LEGEND_ITEM } from '@shared/colorizers/components/legendToggleOption.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaBan,
  FaCalendarAlt,
  FaChild,
  FaDog,
  FaFilter,
  FaHourglassHalf,
  FaMountain,
  FaPalette,
  FaPlus,
  FaRegCheckSquare,
  FaRegClock,
  FaRegSquare,
  FaRulerHorizontal,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  EVENTS_LAYER,
  eventsColorizeBy,
  eventsToggleLegend,
} from '../model/actions.js';
import {
  type EventsColorizeBy,
  EventsColorizeBySchema,
} from '../model/colorize.js';
import { isFilterEmpty } from '../model/filter.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICON } from './difficultyIcons.js';
import { EventsLegend } from './EventsLegend.js';

const COLORIZE_ICONS: Record<EventsColorizeBy, ReactElement> = {
  when: <FaRegClock />,
  mine: <FaUser />,
  distance: <FaRulerHorizontal />,
  duration: <FaHourglassHalf />,
  ascent: <FaMountain />,
  difficulty: DIFFICULTY_ICON,
  dogs: <FaDog />,
  children: <FaChild />,
};

/** The events layer's toolbar. */
export default function EventsMenu(): ReactElement {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const em = useEventsMessages();

  const dispatch = useDispatch();

  const filterActive = useAppSelector(
    ({ events: { filter } }) => !isFilterEmpty(filter),
  );

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const colorizeBy = useAppSelector((state) => state.eventsSettings.colorizeBy);

  const showLegend = useAppSelector((state) => state.eventsSettings.showLegend);

  const [hidden, setHidden] = usePersistentBoolean(
    'fm.eventsMenu.collapsed',
    false,
  );

  return (
    <>
      <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
        <div />

        <Toolbar className="mt-2">
          <ButtonToolbar>
            <LongPressTooltip
              label={m?.mapLayers.letters[EVENTS_LAYER]}
              breakpoint="sm"
            >
              {({ props, label, labelClassName }) => (
                <span
                  className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
                  {...props}
                >
                  <FaCalendarAlt />
                  <span className={labelClassName}>{label}</span>
                </span>
              )}
            </LongPressTooltip>

            {!hidden && (
              <LongPressTooltip label={em?.menu.filter} breakpoint="lg">
                {({ props, label, labelClassName }) => (
                  <Button
                    variant="secondary"
                    active={filterActive}
                    onClick={() =>
                      dispatch(setActiveModal({ type: 'events-filter' }))
                    }
                    {...props}
                  >
                    <FaFilter /> <span className={labelClassName}>{label}</span>
                  </Button>
                )}
              </LongPressTooltip>
            )}

            {!hidden && (
              <Dropdown
                onSelect={(key) => {
                  if (key === LEGEND_ITEM) {
                    dispatch(eventsToggleLegend());

                    return;
                  }

                  trackMatomo([
                    'trackEvent',
                    'Events',
                    'colorize',
                    key ?? 'none',
                  ]);

                  dispatch(
                    eventsColorizeBy(
                      key === 'none' ? null : (key as EventsColorizeBy),
                    ),
                  );
                }}
              >
                <LongPressTooltip
                  label={
                    colorizeBy
                      ? em?.colorize.modes[colorizeBy]
                      : em?.colorize.none
                  }
                  name={em?.colorize.by}
                  breakpoint="lg"
                >
                  {({ props, label, labelClassName }) => (
                    <Dropdown.Toggle variant="secondary" {...props}>
                      <FaPalette />{' '}
                      <span className={labelClassName}>{label}</span>
                    </Dropdown.Toggle>
                  )}
                </LongPressTooltip>

                <FmDropdownMenu>
                  {colorizeBy && (
                    <>
                      <Dropdown.Item
                        as="button"
                        eventKey={LEGEND_ITEM}
                        active={showLegend}
                      >
                        {showLegend ? <FaRegCheckSquare /> : <FaRegSquare />}
                        <MenuLabel>{em?.colorize.legend}</MenuLabel>
                      </Dropdown.Item>

                      <Dropdown.Divider />
                    </>
                  )}

                  <Dropdown.Item
                    as="button"
                    eventKey="none"
                    active={!colorizeBy}
                  >
                    <FaBan />
                    <MenuLabel>{em?.colorize.none}</MenuLabel>
                  </Dropdown.Item>

                  {EventsColorizeBySchema.options.map((by) => (
                    <Dropdown.Item
                      as="button"
                      eventKey={by}
                      key={by}
                      active={colorizeBy === by}
                    >
                      {COLORIZE_ICONS[by]}
                      <MenuLabel>{em?.colorize.modes[by]}</MenuLabel>
                    </Dropdown.Item>
                  ))}
                </FmDropdownMenu>
              </Dropdown>
            )}

            {!hidden && loggedIn && (
              <LongPressTooltip label={em?.menu.newEvent} breakpoint="lg">
                {({ props, label, labelClassName }) => (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      dispatch(setActiveModal({ type: 'event-form' }))
                    }
                    {...props}
                  >
                    <FaPlus /> <span className={labelClassName}>{label}</span>
                  </Button>
                )}
              </LongPressTooltip>
            )}

            <ButtonGroup>
              <LongPressTooltip
                label={hidden ? m?.general.expand : m?.general.collapse}
              >
                {({ props }) => (
                  <Button
                    variant="dark"
                    onClick={() => setHidden((hidden) => !hidden)}
                    {...props}
                  >
                    {hidden ? <FaAngleRight /> : <FaAngleLeft />}
                  </Button>
                )}
              </LongPressTooltip>

              {!hidden && (
                <LongPressTooltip label={m?.general.close}>
                  {({ props }) => (
                    <Button
                      variant="dark"
                      onClick={() =>
                        dispatch(
                          mapToggleLayer({ type: EVENTS_LAYER, enable: false }),
                        )
                      }
                      {...props}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </LongPressTooltip>
              )}
            </ButtonGroup>
          </ButtonToolbar>
        </Toolbar>
      </div>

      {colorizeBy && showLegend && <EventsLegend />}
    </>
  );
}
