import { getStart } from '@features/routePlanner/model/reducer.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaCrosshairs, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type EventSavePayload,
  type EventVisibility,
  eventsSetPickingStart,
  eventsStartPicked,
  type MapEvent,
} from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

/** The event fields as typed; times in `datetime-local` form. */
export type MapEventDraft = {
  description: string;
  startAt: string;
  endAt: string;
  lat: string;
  lon: string;
  visibility: EventVisibility;
};

/** Converts a Date to a `datetime-local` input value (local wall-clock). */
function toDateTimeLocal(d: Date | null | undefined): string {
  if (!d) {
    return '';
  }

  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

export function toDraft(event: MapEvent | null | undefined): MapEventDraft {
  return {
    description: event?.description ?? '',
    startAt: toDateTimeLocal(event?.startAt),
    endAt: toDateTimeLocal(event?.endAt),
    lat: event?.startPoint ? String(event.startPoint.lat) : '',
    lon: event?.startPoint ? String(event.startPoint.lon) : '',
    visibility: event?.visibility ?? 'public',
  };
}

const isCoord = (s: string, max: number) =>
  s.trim() !== '' && Number.isFinite(Number(s)) && Math.abs(Number(s)) <= max;

/** Whether the draft has what the server requires. */
export const isDraftComplete = (draft: MapEventDraft): boolean =>
  draft.startAt !== '' && isCoord(draft.lat, 90) && isCoord(draft.lon, 180);

/** Only for a draft {@link isDraftComplete} accepts. */
export function fromDraft(
  draft: MapEventDraft,
): Omit<EventSavePayload, 'mapId'> {
  const startPoint = { lat: Number(draft.lat), lon: Number(draft.lon) };

  return {
    description: draft.description.trim() || null,
    startAt: new Date(draft.startAt).toISOString(),
    endAt: draft.endAt ? new Date(draft.endAt).toISOString() : null,
    startPoint,
    // The meetup point doubles as the spatial-filter location.
    filterLocation: startPoint,
    visibility: draft.visibility,
  };
}

type Props = {
  value: MapEventDraft;
  onChange: (value: MapEventDraft) => void;
};

export function MapEventFields({ value, onChange }: Props): ReactElement {
  const em = useEventsMessages();

  const dispatch = useDispatch();

  const routeStart = useAppSelector((state) => getStart(state.routePlanner));

  const picked = useAppSelector((state) => state.events.pickedStart);

  const set = (patch: Partial<MapEventDraft>) =>
    onChange({ ...value, ...patch });

  useEffect(() => {
    if (picked) {
      onChange({
        ...value,
        lat: picked.lat.toFixed(6),
        lon: picked.lon.toFixed(6),
      });

      dispatch(eventsStartPicked(null));
    }
  }, [picked, value, onChange, dispatch]);

  return (
    <>
      <Form.Group controlId="eventDescription" className="mb-3">
        <Form.Label>{em?.formDescription}</Form.Label>

        <Form.Control
          as="textarea"
          rows={3}
          value={value.description}
          onChange={(e) => set({ description: e.currentTarget.value })}
        />
      </Form.Group>

      <div className="d-flex gap-3 mb-3">
        <Form.Group controlId="eventStartAt" className="flex-grow-1">
          <Form.Label className="required">{em?.startAt}</Form.Label>

          <Form.Control
            type="datetime-local"
            value={value.startAt}
            onChange={(e) => set({ startAt: e.currentTarget.value })}
          />
        </Form.Group>

        <Form.Group controlId="eventEndAt" className="flex-grow-1">
          <Form.Label>{em?.endAt}</Form.Label>

          <Form.Control
            type="datetime-local"
            value={value.endAt}
            onChange={(e) => set({ endAt: e.currentTarget.value })}
          />
        </Form.Group>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="required">{em?.startPoint}</Form.Label>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Form.Control
            type="number"
            step="any"
            placeholder="lat"
            className="w-auto flex-grow-1"
            value={value.lat}
            onChange={(e) => set({ lat: e.currentTarget.value })}
          />

          <Form.Control
            type="number"
            step="any"
            placeholder="lon"
            className="w-auto flex-grow-1"
            value={value.lon}
            onChange={(e) => set({ lon: e.currentTarget.value })}
          />

          <Button
            variant="secondary"
            className="flex-shrink-0"
            onClick={() => dispatch(eventsSetPickingStart(true))}
          >
            <FaCrosshairs /> {em?.pickOnMap}
          </Button>

          <Button
            variant="secondary"
            className="flex-shrink-0"
            disabled={!routeStart}
            onClick={() => {
              if (routeStart) {
                set({
                  lat: String(routeStart.lat),
                  lon: String(routeStart.lon),
                });
              }
            }}
          >
            <FaMapMarkerAlt /> {em?.takeFromRouteStart}
          </Button>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{em?.visibility}</Form.Label>

        <Form.Check
          type="radio"
          id="event-visibility-public"
          name="event-visibility"
          label={em?.visibilityPublic}
          checked={value.visibility === 'public'}
          onChange={() => set({ visibility: 'public' })}
        />

        <Form.Check
          type="radio"
          id="event-visibility-unlisted"
          name="event-visibility"
          label={em?.visibilityUnlisted}
          checked={value.visibility === 'unlisted'}
          onChange={() => set({ visibility: 'unlisted' })}
        />
      </Form.Group>
    </>
  );
}
