import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapsSave } from '@features/myMaps/model/actions.js';
import { loadMapDocument } from '@features/myMaps/model/loadMapDocument.js';
import { getMapDataFromState } from '@features/myMaps/model/mapDocument.js';
import {
  mapDirtySelector,
  mapHasContentSelector,
} from '@features/myMaps/model/selectors.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useConfirmChoice } from '@shared/components/ModalProvider.js';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  FaBan,
  FaCalendarDay,
  FaCheck,
  FaChild,
  FaDog,
  FaEye,
  FaFlag,
  FaGlobeEurope,
  FaLink,
  FaMapMarkerAlt,
  FaRegClock,
  FaRegImage,
  FaRegMap,
  FaRulerHorizontal,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import { MdTrendingDown, MdTrendingUp } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';
import {
  coverUrl,
  DIFFICULTIES,
  type Difficulty,
  type EventItem,
  type EventPoint,
  EventSchema,
  type EventVisibility,
  eventsSave,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsStartPicked,
  type TripStats,
} from '../model/actions.js';
import { TRANSPORT_KINDS } from '../model/transports.js';
import { tripStartOf, tripStatsOf } from '../model/tripStats.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICON, DIFFICULTY_ICONS } from './difficultyIcons.js';

type Props = { show: boolean };

/** The fields as typed: numbers as strings, times in `datetime-local` form. */
type Draft = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  /** The start point as typed, in any notation `parseCoordinates` reads. */
  position: string;
  visibility: EventVisibility;
  mapId: string;
  transports: string[];
  /** Kilometers. */
  distance: string;
  hours: string;
  minutes: string;
  ascent: string;
  descent: string;
  /** '' where not said. */
  difficulty: Difficulty | '';
  dogs: Tri;
  children: Tri;
};

/** A yes/no the organizer may leave unsaid; as the toggles' value. */
type Tri = '' | 'yes' | 'no';

const toTri = (b: boolean | null | undefined): Tri =>
  b == null ? '' : b ? 'yes' : 'no';

const fromTri = (t: Tri): boolean | null => (t === '' ? null : t === 'yes');

/** One of a few choices, as radio toggles. */
function Choice<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string;
  label: ReactNode;
  value: T;
  options: [T, ReactNode][];
  onChange: (value: T) => void;
}): ReactElement {
  return (
    // Alone on its line, which the stacking measure needs.
    <Form.Group className="mb-3">
      <Form.Label className="d-block">{label}</Form.Label>

      <FitToggleButtonGroup
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map(([option, text]) => (
          <ToggleButton
            key={option}
            id={`${name}-${option || 'unset'}`}
            value={option}
            variant="outline-primary"
          >
            {text}
          </ToggleButton>
        ))}
      </FitToggleButtonGroup>
    </Form.Group>
  );
}

function toDateTimeLocal(d: Date | null | undefined): string {
  if (!d) {
    return '';
  }

  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

const str = (n: number | null | undefined) => (n == null ? '' : String(n));

/** The numbers only: transports are picked, not typed, so they merge apart. */
function statsDraft(stats: Omit<TripStats, 'transports'>) {
  // Rounded as a whole, or 59.5 minutes would read as 60 — past the input's max.
  const minutes =
    stats.duration == null ? null : Math.round(stats.duration / 60);

  return {
    distance:
      stats.distance == null
        ? ''
        : String(Math.round(stats.distance / 100) / 10),
    hours: minutes == null ? '' : String(Math.floor(minutes / 60)),
    minutes: minutes == null ? '' : String(minutes % 60),
    ascent: str(stats.ascent),
    descent: str(stats.descent),
  };
}

function toDraft(
  event: EventItem | undefined,
  mapId: string | undefined,
  language: string,
): Draft {
  return {
    title: event?.title ?? '',
    description: event?.description ?? '',
    startAt: toDateTimeLocal(event?.startAt),
    endAt: toDateTimeLocal(event?.endAt),
    position: event ? latLonToString(event.startPoint, language) : '',
    visibility: event?.visibility ?? 'public',
    mapId: event?.mapId ?? mapId ?? '',
    transports: event?.transports ?? [],
    difficulty: event?.difficulty ?? '',
    dogs: toTri(event?.dogs),
    children: toTri(event?.children),
    ...statsDraft(
      event ?? {
        distance: null,
        duration: null,
        ascent: null,
        descent: null,
      },
    ),
  };
}

// An input group otherwise stretches its input to fill the row.
const NARROW = { flex: '0 0 5.5em' };

/** As the API takes it. */
const MAX_COVER_BYTES = 20 * 1024 * 1024;

const num = (s: string) => (s.trim() === '' ? null : Number(s));

function parsePosition(s: string): EventPoint | null {
  try {
    return parseCoordinates(s);
  } catch {
    return null;
  }
}

/** The Linked map choice that saves what is on the map as a new map. */
const NEW_MAP = '@new';

const isCount = (s: string) =>
  s.trim() === '' || (Number.isFinite(Number(s)) && Number(s) >= 0);

export default function EventFormModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const confirmChoice = useConfirmChoice();

  const m = useMessages();

  const rpm = useRoutePlannerMessages();

  const em = useEventsMessages();

  const target = useAppSelector((state) =>
    state.main.activeModal?.type === 'event-form'
      ? state.main.activeModal
      : undefined,
  );

  const known = useAppSelector((state) =>
    target?.id === undefined
      ? undefined
      : ([state.events.selected, ...state.events.list].find(
          (e) => e?.id === target.id,
        ) ?? undefined),
  );

  // One a link names that the store doesn't hold, fetched for the form alone:
  // selecting it would change the selection and show its toast behind the form.
  const [fetched, setFetched] = useState<{
    id: string;
    /** Unset while loading; `null` once it failed. */
    event?: EventItem | null;
  }>();

  const editing =
    known ??
    (fetched && fetched.id === target?.id
      ? (fetched.event ?? undefined)
      : undefined);

  const unavailable =
    !known && fetched?.id === target?.id && fetched?.event === null;

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const ownMaps = useAppSelector((state) => state.myMaps.maps);

  const activeMap = useAppSelector((state) => state.myMaps.activeMap);

  const mapDirty = useAppSelector(mapDirtySelector);

  const hasContent = useAppSelector(mapHasContentSelector);

  const picked = useAppSelector((state) => state.events.pickedStart);

  // Hidden rather than closed, so the form keeps what was typed.
  const pickingStart = useAppSelector((state) => state.events.pickingStart);

  const saving = useAppSelector((state) => state.events.saving);

  const language = useAppSelector((state) => state.l10n.language);

  const [draft, setDraft] = useState(() =>
    toDraft(editing, target?.mapId, language),
  );

  /** A newly chosen cover image; `null` once removed, unset keeps the event's. */
  const [cover, setCover] = useState<File | null>();

  const coverPreview = useMemo(
    () => (cover ? URL.createObjectURL(cover) : undefined),
    [cover],
  );

  useEffect(
    () => () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    },
    [coverPreview],
  );

  const coverInput = useRef<HTMLInputElement>(null);

  /** What the last fill couldn't take from the map. */
  const [fillNote, setFillNote] = useState<string | null>(null);

  const set = (patch: Partial<Draft>) =>
    setDraft((draft) => ({ ...draft, ...patch }));

  // What the last map filled in: a field still holding it is the map's, not
  // the user's, so another map replaces it — or empties it, saying nothing
  // about it. What the user typed always stands.
  const autoFilled = useRef<Partial<Draft>>({});

  // The map last asked for; an older answer arriving late is dropped.
  const fillingFor = useRef<string | null>(null);

  const fillFromMap = useCallback(
    async (mapId: string) => {
      fillingFor.current = mapId;

      try {
        const { activeMap } = store.getState().myMaps;

        // The open map as on screen, unsaved changes included.
        const { meta, data } =
          mapId === NEW_MAP || mapId === activeMap?.id
            ? {
                meta: mapId === NEW_MAP ? undefined : activeMap,
                data: getMapDataFromState(store.getState()),
              }
            : await loadMapDocument(mapId, store.getState, []);

        if (fillingFor.current !== mapId) {
          return;
        }

        const stats = tripStatsOf(data);

        const start = tripStartOf(data);

        const filled: Partial<Draft> = {
          ...(meta && { title: meta.name }),
          ...(start && { position: latLonToString(start, language) }),
          ...(stats && {
            ...statsDraft(stats),
            transports: stats.transports,
          }),
        };

        const previous = autoFilled.current;

        setDraft((draft) => {
          // Only what this map wrote: a value the user typed that happens to
          // equal the map's must stay theirs.
          const applied: Partial<Draft> = {};

          const next = Object.fromEntries(
            Object.entries(draft).map(([key, value]) => {
              const k = key as keyof Draft;

              const fill = filled[k];

              const empty = Array.isArray(value) ? !value.length : value === '';

              const fromPreviousMap =
                !empty &&
                previous[k] !== undefined &&
                JSON.stringify(value) === JSON.stringify(previous[k]);

              if (fill !== undefined && (empty || fromPreviousMap)) {
                Object.assign(applied, { [k]: fill });

                return [key, fill];
              }

              return [
                key,
                fromPreviousMap ? (Array.isArray(value) ? [] : '') : value,
              ];
            }),
          ) as Draft;

          autoFilled.current = applied;

          return next;
        });

        setFillNote(stats ? null : (em?.form.noTripStats ?? null));
      } catch (err) {
        // A map already moved away from has nothing left to say.
        if (fillingFor.current === mapId) {
          dispatch(
            toastsAdd({
              style: 'danger',
              messageKey: 'general.loadError',
              messageParams: { err },
            }),
          );
        }
      }
    },
    [dispatch, store, language, em],
  );

  // Once per opening, so `editing` refreshing can't wipe what is typed.
  const seededFor = useRef<string | null>(null);

  // Whether the draft holds the event yet: one a link names may arrive after
  // the form opens, and seeds it then — once, or losing it and getting it back
  // would wipe the edits in between.
  const seededLoaded = useRef(false);

  const openKey = show ? `${target?.id ?? ''}|${target?.mapId ?? ''}` : null;

  const targetId = target?.id;

  // Once per event: a failed fetch marks it unavailable rather than retrying.
  useEffect(() => {
    if (!show || !targetId || known || fetched?.id === targetId) {
      return;
    }

    setFetched({ id: targetId });

    httpRequest({
      getState: store.getState,
      url: `/events/${encodeURIComponent(targetId)}`,
      expectedStatus: 200,
    })
      .then(async (res) => EventSchema.parse(await res.json()))
      .then(
        (event) => setFetched({ id: targetId, event }),
        () => setFetched({ id: targetId, event: null }),
      );
  }, [show, targetId, known, fetched?.id, store]);

  // An edited event's trip fields count as its linked map's: relinking it
  // replaces them, as choosing a second map does for a new one.
  const seedMapId = target?.mapId;

  const seed = useCallback(
    (event: EventItem | undefined) => {
      const draft = toDraft(event, seedMapId, language);

      setDraft(draft);

      autoFilled.current = event?.mapId
        ? {
            position: draft.position,
            transports: draft.transports,
            distance: draft.distance,
            hours: draft.hours,
            minutes: draft.minutes,
            ascent: draft.ascent,
            descent: draft.descent,
          }
        : {};
    },
    [seedMapId, language],
  );

  // A new event from a map takes the map's stats.
  useEffect(() => {
    if (openKey === seededFor.current) {
      if (openKey !== null && editing && !seededLoaded.current) {
        seededLoaded.current = true;

        seed(editing);
      }

      return;
    }

    seededFor.current = openKey;

    // Closed: whatever map answer is still on its way has no form to fill.
    fillingFor.current = null;

    if (openKey === null) {
      // A failed fetch is tried again on the next opening.
      setFetched(undefined);

      return;
    }

    seededLoaded.current = Boolean(editing);

    seed(editing);

    setCover(undefined);

    setFillNote(null);

    if (!target?.id && target?.mapId) {
      void fillFromMap(target.mapId);
    }
  }, [openKey, editing, target?.id, target?.mapId, fillFromMap, seed]);

  // Only while open: the filter dialog picks a point the same way.
  useEffect(() => {
    if (show && picked) {
      setDraft((draft) => ({
        ...draft,
        position: latLonToString(picked, language),
      }));

      dispatch(eventsStartPicked(null));
    }
  }, [show, picked, dispatch, language]);

  const startPoint = parsePosition(draft.position);

  const coverTooLarge = (cover?.size ?? 0) > MAX_COVER_BYTES;

  const shownCover =
    coverPreview ??
    (cover === undefined && editing?.cover
      ? coverUrl(editing.cover, 'thumb')
      : undefined);

  const valid =
    !coverTooLarge &&
    draft.title.trim() !== '' &&
    draft.startAt !== '' &&
    startPoint !== null &&
    [
      draft.distance,
      draft.hours,
      draft.minutes,
      draft.ascent,
      draft.descent,
    ].every(isCount);

  const close = () => dispatch(setActiveModal(null));

  // What the server accepts: the user's own maps. A moderator editing
  // someone else's event can't relink it — these aren't the owner's maps.
  const myMaps = ownMaps.filter((map) => map.userId === myUserId);

  const othersEvent = editing !== undefined && editing.userId !== myUserId;

  const ownOpenMap = activeMap?.userId === myUserId ? activeMap : undefined;

  // The open map, when what is on screen is already one of those.
  const savedOpenMap = mapDirty ? undefined : ownOpenMap;

  const canCreateMap = hasContent && !savedOpenMap && !othersEvent;

  const unsavedOpenMap = mapDirty ? ownOpenMap : undefined;

  // Once saved — by a save of this form that failed after it, or from My
  // maps — the new map is the open one.
  const mapId =
    draft.mapId === NEW_MAP && !canCreateMap
      ? (savedOpenMap?.id ?? '')
      : draft.mapId;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!valid || !startPoint) {
      return;
    }

    const distanceKm = num(draft.distance);

    const hours = num(draft.hours);

    const minutes = num(draft.minutes);

    dispatch(
      eventsSave({
        id: editing?.id,
        body: {
          mapId: mapId === NEW_MAP ? null : mapId || null,
          title: draft.title.trim(),
          description: draft.description.trim() || null,
          startAt: new Date(draft.startAt).toISOString(),
          endAt: draft.endAt ? new Date(draft.endAt).toISOString() : null,
          startPoint,
          visibility: draft.visibility,
          transports: draft.transports,
          difficulty: draft.difficulty || null,
          dogs: fromTri(draft.dogs),
          children: fromTri(draft.children),
          distance: distanceKm === null ? null : Math.round(distanceKm * 1000),
          duration:
            hours === null && minutes === null
              ? null
              : Math.round((hours ?? 0) * 3600 + (minutes ?? 0) * 60),
          ascent: num(draft.ascent),
          descent: num(draft.descent),
        },
        cover: cover === null && !editing?.cover ? undefined : cover,
        newMap: mapId === NEW_MAP ? draft.title.trim() : undefined,
      }),
    );
  };

  return (
    <Modal
      show={show}
      onHide={close}
      size="lg"
      className={pickingStart ? 'd-none' : undefined}
      backdropClassName={pickingStart ? 'd-none' : undefined}
      enforceFocus={!pickingStart}
      keyboard={!pickingStart}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarDay />{' '}
          {target?.id ? em?.form.editEvent : em?.form.newEvent}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Body>
          {editing && !editing.canWrite && (
            <Alert variant="warning">{em?.form.onlyOrganizer}</Alert>
          )}

          {unavailable && (
            <Alert variant="danger">{em?.form.unavailable}</Alert>
          )}

          <Form.Group controlId="eventTitle" className="mb-3">
            <Form.Label className="required">{em?.form.title}</Form.Label>

            <Form.Control
              value={draft.title}
              onChange={(e) => set({ title: e.currentTarget.value })}
            />
          </Form.Group>

          <Form.Group controlId="eventDescription" className="mb-3">
            <Form.Label>{em?.form.description}</Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              value={draft.description}
              onChange={(e) => set({ description: e.currentTarget.value })}
            />

            <Form.Text>{em?.form.contactHint}</Form.Text>
          </Form.Group>

          <Form.Group controlId="eventCover" className="mb-3">
            <Form.Label>
              <FaRegImage /> {em?.form.cover}
            </Form.Label>

            <InputGroup hasValidation>
              <Form.Control
                ref={coverInput}
                type="file"
                accept="image/*"
                isInvalid={coverTooLarge}
                onChange={(e) => {
                  const file = (e.currentTarget as HTMLInputElement).files?.[0];

                  // A cancelled file dialog keeps the image shown.
                  if (file) {
                    setCover(file);
                  }
                }}
              />

              {shownCover && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setCover(null);

                    if (coverInput.current) {
                      coverInput.current.value = '';
                    }
                  }}
                >
                  <FaTimes /> {m?.general.remove}
                </Button>
              )}

              <Form.Control.Feedback type="invalid">
                {em?.form.coverTooLarge}
              </Form.Control.Feedback>
            </InputGroup>

            {shownCover && (
              <img
                src={shownCover}
                alt=""
                className="d-block rounded mt-2"
                style={{ maxWidth: '240px', maxHeight: '135px' }}
              />
            )}
          </Form.Group>

          <div className="d-flex flex-wrap gap-3 mb-3">
            <Form.Group controlId="eventStartAt" className="flex-grow-1">
              <Form.Label className="required">{em?.form.start}</Form.Label>

              <Form.Control
                type="datetime-local"
                value={draft.startAt}
                onChange={(e) => set({ startAt: e.currentTarget.value })}
              />
            </Form.Group>

            <Form.Group controlId="eventEndAt" className="flex-grow-1">
              <Form.Label>{em?.form.end}</Form.Label>

              <Form.Control
                type="datetime-local"
                value={draft.endAt}
                min={draft.startAt || undefined}
                onChange={(e) => set({ endAt: e.currentTarget.value })}
              />
            </Form.Group>
          </div>

          <Form.Group controlId="eventMap" className="mb-3">
            <Form.Label>
              <FaRegMap /> {em?.form.linkedMap}
            </Form.Label>

            <Form.Select
              value={mapId}
              disabled={othersEvent}
              onChange={async (e) => {
                let mapId = e.currentTarget.value;

                // The open map's own changes go to that map, if asked to.
                if (mapId === NEW_MAP && unsavedOpenMap) {
                  const choice = await confirmChoice({
                    title: em?.form.unsavedTitle,
                    message: em?.form.unsavedMessage({
                      name: unsavedOpenMap.name,
                    }),
                    confirmLabel: em?.form.saveOpenMap({
                      name: unsavedOpenMap.name,
                    }),
                    extraLabel: em?.form.newMap,
                  });

                  if (choice === 'cancel') {
                    return;
                  }

                  if (choice === 'confirm') {
                    dispatch(mapsSave());

                    mapId = unsavedOpenMap.id;
                  }
                }

                set({ mapId });

                // Picking a map is asking for what it says about the trip;
                // None drops whatever answer is still on its way.
                if (mapId) {
                  void fillFromMap(mapId);
                } else {
                  fillingFor.current = null;
                }
              }}
            >
              <option value="">{em?.form.noMap}</option>

              {canCreateMap && (
                <option value={NEW_MAP}>{em?.form.newMapFromContent}</option>
              )}

              {/* Kept while not among the listed ones, e.g. still loading. */}
              {mapId &&
                mapId !== NEW_MAP &&
                !myMaps.some((map) => map.id === mapId) && (
                  <option value={mapId}>
                    {mapId === activeMap?.id
                      ? activeMap.name
                      : (editing?.mapName ?? mapId)}
                  </option>
                )}

              {myMaps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
              ))}
            </Form.Select>

            {fillNote && (
              <Form.Text className="d-block text-warning">{fillNote}</Form.Text>
            )}
          </Form.Group>

          <Form.Group controlId="eventStartPoint" className="mb-3">
            <Form.Label className="required">
              <FaFlag /> {em?.form.startPoint}
            </Form.Label>

            <InputGroup>
              <Form.Control
                value={draft.position}
                isInvalid={draft.position !== '' && startPoint === null}
                onChange={(e) => set({ position: e.currentTarget.value })}
              />

              <Button
                variant="secondary"
                onClick={() => {
                  // A point already set starts there, to be moved.
                  dispatch(eventsSetPickPosition(startPoint));

                  dispatch(eventsSetPickingStart(true));
                }}
              >
                <FaMapMarkerAlt /> {em?.form.setLocation}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">{em?.form.transport}</Form.Label>

            <ToggleButtonGroup
              type="checkbox"
              value={draft.transports}
              onChange={(transports: string[]) => set({ transports })}
              className="d-flex flex-wrap gap-2"
            >
              {TRANSPORT_KINDS.map(({ kind, icon }) => (
                <ToggleButton
                  key={kind}
                  id={`event-transport-${kind}`}
                  value={kind}
                  variant="outline-primary"
                  className="rounded flex-grow-0"
                >
                  {icon} {rpm?.transportType[kind] ?? kind}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Form.Group>

          <Choice
            name="event-difficulty"
            label={
              <>
                {DIFFICULTY_ICON} {em?.form.difficulty}
              </>
            }
            value={draft.difficulty}
            options={[
              ['', em?.notSaid],
              ...DIFFICULTIES.map((d): [Difficulty, ReactNode] => [
                d,
                <>
                  {DIFFICULTY_ICONS[d]} {em?.difficulty[d]}
                </>,
              ]),
            ]}
            onChange={(difficulty) => set({ difficulty })}
          />

          <Choice
            name="event-dogs"
            label={
              <>
                <FaDog /> {em?.form.dogs}
              </>
            }
            value={draft.dogs}
            options={[
              ['', em?.notSaid],
              [
                'yes',
                <>
                  <FaCheck /> {em?.form.dogsWelcome}
                </>,
              ],
              [
                'no',
                <>
                  <FaBan /> {em?.form.dogsNotAllowed}
                </>,
              ],
            ]}
            onChange={(dogs) => set({ dogs })}
          />

          <Choice
            name="event-children"
            label={
              <>
                <FaChild /> {em?.form.children}
              </>
            }
            value={draft.children}
            options={[
              ['', em?.notSaid],
              [
                'yes',
                <>
                  <FaCheck /> {em?.form.childrenSuitable}
                </>,
              ],
              [
                'no',
                <>
                  <FaBan /> {em?.form.childrenNotSuitable}
                </>,
              ],
            ]}
            onChange={(children) => set({ children })}
          />

          <div className="d-flex flex-wrap gap-3 mb-3">
            <Form.Group controlId="eventDistance">
              <Form.Label>
                <FaRulerHorizontal /> {em?.form.length}
              </Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={0}
                  step="any"
                  style={NARROW}
                  value={draft.distance}
                  isInvalid={!isCount(draft.distance)}
                  onChange={(e) => set({ distance: e.currentTarget.value })}
                />

                <InputGroup.Text>km</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="eventHours">
              <Form.Label>
                <FaRegClock /> {em?.form.duration}
              </Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={0}
                  style={NARROW}
                  value={draft.hours}
                  isInvalid={!isCount(draft.hours)}
                  onChange={(e) => set({ hours: e.currentTarget.value })}
                />

                <InputGroup.Text>h</InputGroup.Text>

                <Form.Control
                  type="number"
                  min={0}
                  max={59}
                  style={NARROW}
                  value={draft.minutes}
                  isInvalid={!isCount(draft.minutes)}
                  onChange={(e) => set({ minutes: e.currentTarget.value })}
                />

                <InputGroup.Text>min</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="eventAscent">
              <Form.Label>
                <MdTrendingUp /> {em?.form.ascent}
              </Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={0}
                  style={NARROW}
                  value={draft.ascent}
                  isInvalid={!isCount(draft.ascent)}
                  onChange={(e) => set({ ascent: e.currentTarget.value })}
                />

                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="eventDescent">
              <Form.Label>
                <MdTrendingDown /> {em?.form.descent}
              </Form.Label>

              <InputGroup>
                <Form.Control
                  type="number"
                  min={0}
                  style={NARROW}
                  value={draft.descent}
                  isInvalid={!isCount(draft.descent)}
                  onChange={(e) => set({ descent: e.currentTarget.value })}
                />

                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </div>

          <Form.Group>
            <Form.Label className="d-block">
              <FaEye /> {em?.form.visibility}
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="event-visibility"
              value={draft.visibility}
              onChange={(visibility: EventVisibility) => set({ visibility })}
            >
              <ToggleButton
                id="event-visibility-public"
                value="public"
                variant="outline-primary"
              >
                <FaGlobeEurope /> {em?.form.public}
              </ToggleButton>

              <ToggleButton
                id="event-visibility-unlisted"
                value="unlisted"
                variant="outline-primary"
              >
                <FaLink /> {em?.form.unlisted}
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={
              !valid ||
              saving ||
              (target?.id !== undefined && !editing?.canWrite)
            }
            icon={<FaSave />}
            label={m?.general.save}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
