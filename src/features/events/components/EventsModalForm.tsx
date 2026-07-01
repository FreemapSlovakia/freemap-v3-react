import { useMessages } from '@features/l10n/l10nInjector.js';
import { getStart } from '@features/routePlanner/model/reducer.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type FormEvent, type ReactElement, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type EventItem,
  type EventVisibility,
  eventsSave,
} from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

type Props = {
  editing?: EventItem;
  initialMapId?: string;
  onDone: () => void;
};

/** Converts a Date to a `datetime-local` input value (local wall-clock). */
function toDateTimeLocal(d: Date | null | undefined): string {
  if (!d) {
    return '';
  }

  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

export function EventsModalForm({
  editing,
  initialMapId,
  onDone,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const em = useEventsMessages();

  const writableMaps = useAppSelector((state) =>
    state.myMaps.maps.filter((map) => map.canWrite),
  );

  const routeStart = useAppSelector((state) => getStart(state.routePlanner));

  const [source, setSource] = useState<'map' | 'current'>(
    editing || initialMapId || writableMaps.length ? 'map' : 'current',
  );

  const [mapId, setMapId] = useState(editing?.mapId ?? initialMapId ?? '');

  const [newMapName, setNewMapName] = useState('');

  const [title, setTitle] = useState(editing?.title ?? '');

  const [description, setDescription] = useState(editing?.description ?? '');

  const [startAt, setStartAt] = useState(toDateTimeLocal(editing?.startAt));

  const [endAt, setEndAt] = useState(toDateTimeLocal(editing?.endAt));

  const [lat, setLat] = useState(
    editing?.startPoint ? String(editing.startPoint.lat) : '',
  );

  const [lon, setLon] = useState(
    editing?.startPoint ? String(editing.startPoint.lon) : '',
  );

  const [visibility, setVisibility] = useState<EventVisibility>(
    editing?.visibility ?? 'public',
  );

  const sourceValid =
    source === 'current' ? newMapName.trim() !== '' : mapId !== '';

  const valid = title.trim() !== '' && startAt !== '' && sourceValid;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!valid) {
      return;
    }

    const startPoint =
      lat !== '' && lon !== '' ? { lat: Number(lat), lon: Number(lon) } : null;

    dispatch(
      eventsSave({
        id: editing?.id,
        source:
          source === 'current'
            ? { type: 'current', name: newMapName.trim() }
            : { type: 'map', mapId },
        title: title.trim(),
        description: description.trim() || null,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : null,
        startPoint,
        // MVP: the meetup point doubles as the spatial-filter location.
        filterLocation: startPoint,
        visibility,
      }),
    );

    onDone();
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        {/* Source map: an existing saved map, or publish the current state. */}
        {!editing && (
          <Form.Group className="mb-3">
            <Form.Label>{em?.source}</Form.Label>

            <Form.Check
              type="radio"
              id="events-source-map"
              name="events-source"
              label={em?.sourceExisting}
              checked={source === 'map'}
              disabled={writableMaps.length === 0}
              onChange={() => setSource('map')}
            />

            <Form.Check
              type="radio"
              id="events-source-current"
              name="events-source"
              label={em?.sourceCurrent}
              checked={source === 'current'}
              onChange={() => setSource('current')}
            />
          </Form.Group>
        )}

        {source === 'map' ? (
          <Form.Group className="mb-3">
            <Form.Label>{em?.source}</Form.Label>

            {writableMaps.length === 0 ? (
              <p className="text-muted mb-0">{em?.noWritableMaps}</p>
            ) : (
              <Form.Select
                value={mapId}
                onChange={(e) => setMapId(e.currentTarget.value)}
              >
                <option value="">{em?.pickMap}</option>

                {writableMaps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        ) : (
          <Form.Group className="mb-3">
            <Form.Label>{em?.sourceCurrentName}</Form.Label>

            <Form.Control
              value={newMapName}
              onChange={(e) => setNewMapName(e.currentTarget.value)}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Label>{em?.formTitle}</Form.Label>

          <Form.Control
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{em?.formDescription}</Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
        </Form.Group>

        <div className="d-flex gap-3 mb-3">
          <Form.Group className="flex-grow-1">
            <Form.Label>{em?.startAt}</Form.Label>

            <Form.Control
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.currentTarget.value)}
            />
          </Form.Group>

          <Form.Group className="flex-grow-1">
            <Form.Label>{em?.endAt}</Form.Label>

            <Form.Control
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.currentTarget.value)}
            />
          </Form.Group>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>{em?.startPoint}</Form.Label>

          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="number"
              step="any"
              placeholder="lat"
              value={lat}
              onChange={(e) => setLat(e.currentTarget.value)}
            />

            <Form.Control
              type="number"
              step="any"
              placeholder="lon"
              value={lon}
              onChange={(e) => setLon(e.currentTarget.value)}
            />

            <Button
              variant="secondary"
              className="flex-shrink-0"
              disabled={!routeStart}
              onClick={() => {
                if (routeStart) {
                  setLat(String(routeStart.lat));
                  setLon(String(routeStart.lon));
                }
              }}
            >
              <FaMapMarkerAlt /> {em?.takeFromRouteStart}
            </Button>
          </div>
        </Form.Group>

        <Form.Group>
          <Form.Label>{em?.visibility}</Form.Label>

          <Form.Check
            type="radio"
            id="events-visibility-public"
            name="events-visibility"
            label={em?.visibilityPublic}
            checked={visibility === 'public'}
            onChange={() => setVisibility('public')}
          />

          <Form.Check
            type="radio"
            id="events-visibility-unlisted"
            name="events-visibility"
            label={em?.visibilityUnlisted}
            checked={visibility === 'unlisted'}
            onChange={() => setVisibility('unlisted')}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onDone}>
          {m?.general.cancel}
        </Button>

        <Button type="submit" variant="primary" disabled={!valid}>
          {m?.general.save}
        </Button>
      </Modal.Footer>
    </Form>
  );
}
