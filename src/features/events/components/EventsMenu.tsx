import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaCalendarAlt, FaFilter, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { EVENTS_LAYER } from '../model/actions.js';

/** The events layer's toolbar. */
export default function EventsMenu(): ReactElement {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const dispatch = useDispatch();

  const filterActive = useAppSelector(({ events: { filter } }) =>
    Boolean(filter.from || filter.to || filter.inMapArea),
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

          <LongPressTooltip label="Filter" breakpoint="lg">
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
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
