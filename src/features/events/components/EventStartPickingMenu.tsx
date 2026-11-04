import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  eventsConfirmPick,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsSetPickRadius,
} from '../model/actions.js';
import { nearestRadiusStop, RADIUS_STOPS } from '../model/filter.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

/** Picks the event's start point, or with a radius the place to filter by. */
export default function EventStartPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const placed = useAppSelector((state) => state.events.pickPosition !== null);

  const radius = useAppSelector((state) => state.events.pickRadius);

  const em = useEventsMessages();

  return (
    <PickingMenu
      prompt={radius === null ? em?.picking.startPoint : em?.picking.place}
      onConfirm={() => dispatch(eventsConfirmPick())}
      confirmDisabled={!placed}
      onCancel={() => dispatch(eventsSetPickingStart(false))}
      cancelKbd="Esc"
      onPlace={(position) => dispatch(eventsSetPickPosition(position))}
    >
      {radius !== null && (
        <div className="d-flex align-items-center gap-2 px-1">
          <Form.Range
            min={0}
            max={RADIUS_STOPS.length - 1}
            style={{ width: '8rem' }}
            value={nearestRadiusStop(radius)}
            onChange={(e) =>
              dispatch(
                eventsSetPickRadius(
                  RADIUS_STOPS[Number(e.currentTarget.value)] ?? radius,
                ),
              )
            }
          />

          <span className="text-nowrap" style={{ minWidth: '4em' }}>
            {radius} km
          </span>
        </div>
      )}
    </PickingMenu>
  );
}
