import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaCalendarAlt,
  FaFilter,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { EVENTS_LAYER } from '../model/actions.js';
import { isFilterEmpty } from '../model/filter.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

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

  // Collapsed until opened: the layer is on for first visits, and the
  // toolbar shouldn't take the room then.
  const [hidden, setHidden] = usePersistentBoolean(
    'fm.eventsMenu.collapsed',
    true,
  );

  return (
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
  );
}
