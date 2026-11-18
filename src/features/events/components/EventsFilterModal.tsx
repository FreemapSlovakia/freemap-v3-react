import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { PlaceName } from '@features/search/components/PlaceName.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ANY, fromAnyValue, withAnyValue } from '@shared/anyToggle.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { Modal } from '@shared/components/Modal.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { getCurrentPosition, latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Dropdown,
  Form,
  InputGroup,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  FaCheck,
  FaChild,
  FaDog,
  FaEraser,
  FaFilter,
  FaHome,
  FaMapMarkerAlt,
  FaRegClock,
  FaRegDotCircle,
  FaRulerHorizontal,
  FaSearchLocation,
  FaTrash,
} from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';
import {
  DIFFICULTIES,
  eventsSetFilter,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsSetPickRadius,
  eventsStartPicked,
} from '../model/actions.js';
import {
  type EventsFilter,
  isFilterEmpty,
  MAX_RADIUS,
  MIN_RADIUS,
  parseWithin,
  RADIUS_STOPS,
  type Range,
  sameFilter,
  WITHIN,
  type Within,
} from '../model/filter.js';
import {
  fromSavedFilter,
  MAX_SAVED_FILTERS,
  type SavedEventFilter,
  toSavedFilter,
} from '../model/savedFilters.js';
import {
  eventsSavedFilterCreate,
  eventsSavedFilterDelete,
  eventsSavedFilterPicked,
  eventsSavedFiltersLoad,
  eventsSavedFilterUpdate,
  selectAppliedSavedFilter,
  selectSavedFilters,
} from '../model/savedFiltersSlice.js';
import { TRANSPORT_KINDS } from '../model/transports.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICON, DIFFICULTY_ICONS } from './difficultyIcons.js';

type Props = { show: boolean };

type RangeDraft = { min: string; max: string };

const toDateInput = (d: Date | undefined) =>
  d ? d.toISOString().slice(0, 10) : '';

// A 6-digit year makes an Invalid Date; it means no bound.
function fromDateInput(s: string): Date | undefined {
  const d = s ? new Date(s) : undefined;

  return d && !Number.isNaN(d.getTime()) ? d : undefined;
}

const toRangeDraft = (r: Range | undefined): RangeDraft => ({
  min: r?.min === undefined ? '' : String(r.min),
  max: r?.max === undefined ? '' : String(r.max),
});

function fromRangeDraft({ min, max }: RangeDraft): Range | undefined {
  const num = (s: string) => {
    const n = s.trim() === '' ? Number.NaN : Number(s);

    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const range = { min: num(min), max: num(max) };

  return range.min === undefined && range.max === undefined ? undefined : range;
}

// As the event form's, so the two read alike.
const NARROW = { flex: '0 0 5.5em' };

/** Km, what a place starts with. */
const DEFAULT_RADIUS = 20;

/** The saved-filter select's option that saves a new one; ids are numbers. */
const NEW_SAVED = 'new';

function parsePlace(s: string): LatLon | null {
  try {
    return s.trim() === '' ? null : parseCoordinates(s);
  } catch {
    return null;
  }
}

function RangeInput({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: ReactNode;
  unit: string;
  value: RangeDraft;
  onChange: (value: RangeDraft) => void;
}): ReactElement {
  const em = useEventsMessages();

  const from = em?.filter.from;

  const to = em?.filter.to;

  return (
    <Form.Group controlId={id}>
      <Form.Label>{label}</Form.Label>

      <InputGroup>
        <Form.Control
          type="number"
          min={0}
          step="any"
          placeholder={from}
          style={NARROW}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.currentTarget.value })}
        />

        <InputGroup.Text>–</InputGroup.Text>

        <Form.Control
          type="number"
          min={0}
          step="any"
          placeholder={to}
          style={NARROW}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.currentTarget.value })}
        />

        <InputGroup.Text>{unit}</InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );
}

/**
 * Any (indeterminate), yes (checked), no (unchecked), in turn — as the gallery
 * filter's panorama checkbox.
 */
function TriCheck({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: ReactNode;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}): ReactElement {
  const [input, setInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (input) {
      input.indeterminate = value === undefined;
    }
  }, [input, value]);

  return (
    <Form.Check
      id={id}
      ref={setInput}
      checked={Boolean(value)}
      onChange={() =>
        onChange(value ? false : value === false ? undefined : true)
      }
      label={label}
    />
  );
}

export default function EventsFilterModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const rpm = useRoutePlannerMessages();

  const em = useEventsMessages();

  const filter = useAppSelector((state) => state.eventsSettings.filter);

  const [from, setFrom] = useState('');

  const [to, setTo] = useState('');

  const [within, setWithin] = useState<Within>();

  /** The place as typed, in any notation `parseCoordinates` reads. */
  const [place, setPlace] = useState('');

  const [radius, setRadius] = useState(String(DEFAULT_RADIUS));

  const picked = useAppSelector((state) => state.events.pickedStart);

  const pickedRadius = useAppSelector((state) => state.events.pickRadius);

  // Hidden rather than closed, so the dialog keeps what was set.
  const picking = useAppSelector((state) => state.events.pickingStart);

  const language = useAppSelector((state) => state.l10n.language);

  const home = useAppSelector((state) => state.homeLocation.homeLocation);

  const [transport, setTransport] = useState<string[]>([]);

  const [difficulty, setDifficulty] = useState<string[]>([]);

  const [dogs, setDogs] = useState<boolean>();

  const [children, setChildren] = useState<boolean>();

  const [imported, setImported] = useState<boolean>();

  const [unsaid, setUnsaid] = useState(false);

  const [distance, setDistance] = useState(toRangeDraft(undefined));

  const [duration, setDuration] = useState(toRangeDraft(undefined));

  const [ascent, setAscent] = useState(toRangeDraft(undefined));

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const store = useStore<RootState>();

  const savedFilters = useAppSelector(selectSavedFilters);

  const applied = useAppSelector(selectAppliedSavedFilter);

  const confirm = useConfirm();

  /** Whether Apply saves the filter too, under `saveName`. */
  const [saving, setSaving] = useState(false);

  const [saveName, setSaveName] = useState('');

  const [saveNotify, setSaveNotify] = useState(false);

  /** The saved filter that applied on opening, which Apply then changes. */
  const [editing, setEditing] = useState<SavedEventFilter>();

  /** Fills the fields with `f`, editing `saved` if given. */
  const seed = useCallback(
    (f: EventsFilter, saved: SavedEventFilter | undefined) => {
      setEditing(saved);

      setSaving(Boolean(saved));

      setSaveName(saved?.name ?? '');

      setSaveNotify(saved?.notify ?? false);

      setFrom(toDateInput(f.from));

      setTo(toDateInput(f.to));

      setWithin(f.within);

      setPlace(f.near ? latLonToString(f.near, language) : '');

      setRadius(String(f.near?.radius ?? DEFAULT_RADIUS));

      setTransport(f.transport ?? []);

      setDifficulty(f.difficulty ?? []);

      setDogs(f.dogs);

      setChildren(f.children);

      setImported(f.imported);

      setUnsaid(Boolean(f.unsaid));

      setDistance(toRangeDraft(f.distance));

      setDuration(toRangeDraft(f.duration));

      setAscent(toRangeDraft(f.ascent));
    },
    [language],
  );

  // A link may open this without the toolbar, which otherwise loads them.
  useEffect(() => {
    if (show && loggedIn) {
      dispatch(eventsSavedFiltersLoad());
    }
  }, [show, loggedIn, dispatch]);

  // Seeded from what applies on each open; edits wait for Apply.
  useEffect(() => {
    if (show) {
      // Read, not selected: a list arriving later must not reset the fields.
      seed(filter, selectAppliedSavedFilter(store.getState()));
    }
  }, [show, filter, store, seed]);

  useEffect(() => {
    if (show && picked) {
      setPlace(latLonToString(picked, language));

      if (pickedRadius !== null) {
        setRadius(String(pickedRadius));
      }

      dispatch(eventsStartPicked(null));
    }
  }, [show, picked, pickedRadius, dispatch, language]);

  useDocumentTitle(show ? em?.filter.title : undefined);

  const close = () => dispatch(setActiveModal(null));

  const point = parsePlace(place);

  const radiusKm = Number(radius);

  const radiusValid =
    radius.trim() !== '' && radiusKm >= MIN_RADIUS && radiusKm <= MAX_RADIUS;

  const valid =
    (place.trim() === '' || (point !== null && radiusValid)) &&
    (!saving || saveName.trim() !== '');

  const takeMyLocation = () => {
    getCurrentPosition().then(
      (position) => setPlace(latLonToString(position, language)),
      () =>
        dispatch(
          toastsAdd({
            id: 'events.gpsError',
            style: 'warning',
            timeout: 5000,
            messageKey: 'main.locationError',
          }),
        ),
    );
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!valid) {
      return;
    }

    if (within) {
      trackMatomo(['trackEvent', 'Events', 'filterWithin', within]);
    }

    const next = {
      within,
      from: within ? undefined : fromDateInput(from),
      to: within ? undefined : fromDateInput(to),
      near: point ? { ...point, radius: radiusKm } : undefined,
      transport: transport.length ? transport : undefined,
      difficulty: difficulty.length ? difficulty : undefined,
      dogs,
      children,
      imported,
      unsaid: unsaid || undefined,
      distance: fromRangeDraft(distance),
      duration: fromRangeDraft(duration),
      ascent: fromRangeDraft(ascent),
    };

    dispatch(eventsSetFilter(next));

    if (saving) {
      const saved = { name: saveName.trim(), notify: saveNotify, filter: next };

      if (editing) {
        const unchanged =
          saved.name === editing.name &&
          saved.notify === editing.notify &&
          sameFilter(
            fromSavedFilter(toSavedFilter(next)),
            fromSavedFilter(editing.filter),
          );

        if (!unchanged) {
          dispatch(eventsSavedFilterUpdate({ id: editing.id, ...saved }));
        }

        dispatch(eventsSavedFilterPicked(editing.id));
      } else {
        dispatch(eventsSavedFilterCreate(saved));
      }
    }

    close();
  };

  const deleteSaved = async () => {
    if (
      editing &&
      (await confirm({
        title: em?.savedFilters.deleteTitle,
        message: em?.savedFilters.deleteMessage({ name: editing.name }),
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      }))
    ) {
      dispatch(eventsSavedFilterDelete(editing.id));

      // The filter stays as it is, no longer saved.
      setEditing(undefined);

      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={close}
      size="lg"
      className={picking ? 'd-none' : undefined}
      backdropClassName={picking ? 'd-none' : undefined}
      enforceFocus={!picking}
      keyboard={!picking}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFilter /> {em?.filter.title}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Body>
          {loggedIn && (
            <div className="border-bottom mb-3 pb-3">
              <Form.Group controlId="eventsSavedFilter">
                <Form.Label>{em?.savedFilters.savedFilter}</Form.Label>

                <Form.Select
                  value={editing?.id ?? (saving ? NEW_SAVED : '')}
                  onChange={(e) => {
                    const { value } = e.currentTarget;

                    const saved = savedFilters?.find(
                      (s) => String(s.id) === value,
                    );

                    if (saved) {
                      seed(fromSavedFilter(saved.filter), saved);

                      return;
                    }

                    // Everything stays, the name too: a saved one edited is then
                    // saved as a new one, or applied without saving.
                    setEditing(undefined);

                    setSaving(value === NEW_SAVED);
                  }}
                >
                  <option value="">{em?.savedFilters.dontSave}</option>

                  <option
                    value={NEW_SAVED}
                    disabled={(savedFilters?.length ?? 0) >= MAX_SAVED_FILTERS}
                  >
                    {em?.savedFilters.newFilter}
                  </option>

                  {savedFilters?.map((saved) => (
                    <option key={saved.id} value={saved.id}>
                      {saved.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {saving && (
                <>
                  <Form.Group controlId="eventsSaveName" className="my-3">
                    <Form.Label className="required">
                      {em?.savedFilters.name}
                    </Form.Label>

                    <Form.Control
                      maxLength={100}
                      value={saveName}
                      onChange={(e) => setSaveName(e.currentTarget.value)}
                    />
                  </Form.Group>

                  <Form.Check
                    id="eventsSaveNotify"
                    checked={saveNotify}
                    onChange={(e) => setSaveNotify(e.currentTarget.checked)}
                    label={em?.savedFilters.notify}
                  />

                  {within && saveNotify && (
                    <Alert variant="info" className="mt-3 mb-0">
                      {em?.savedFilters.periodNote}
                    </Alert>
                  )}

                  {!within && (from || to) && (
                    <Alert variant="warning" className="mt-3 mb-0">
                      {em?.savedFilters.datesWarning}
                    </Alert>
                  )}
                </>
              )}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="d-block">{em?.filter.date}</Form.Label>

            <div className={within ? undefined : 'mb-2'}>
              <FitToggleButtonGroup
                type="radio"
                name="eventsWithin"
                value={within ?? ''}
                onChange={(next: string) => setWithin(parseWithin(next))}
              >
                {(['', ...WITHIN] as const).map((w) => (
                  <ToggleButton
                    key={w}
                    id={`events-within-${w || 'dates'}`}
                    value={w}
                    variant="outline-primary"
                  >
                    {em?.filter.periods[w || 'dates']}
                  </ToggleButton>
                ))}
              </FitToggleButtonGroup>
            </div>

            {!within && (
              <>
                {/* Natural width, shrinking on a phone rather than wrapping. */}
                <InputGroup className="d-inline-flex w-auto mw-100 flex-nowrap">
                  <Form.Control
                    id="eventsDateFrom"
                    className="flex-grow-0 w-auto"
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => setFrom(e.currentTarget.value)}
                  />

                  <InputGroup.Text>–</InputGroup.Text>

                  <Form.Control
                    id="eventsDateTo"
                    className="flex-grow-0 w-auto"
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => setTo(e.currentTarget.value)}
                  />
                </InputGroup>

                <Form.Text className="d-block">{em?.filter.dateHint}</Form.Text>
              </>
            )}
          </Form.Group>

          <Form.Group controlId="eventsNear" className="mb-3">
            <Form.Label>
              <FaSearchLocation /> {em?.filter.near}
            </Form.Label>

            <InputGroup>
              <Form.Control
                placeholder={em?.filter.anywhere}
                value={place}
                isInvalid={place.trim() !== '' && point === null}
                onChange={(e) => setPlace(e.currentTarget.value)}
              />

              {/* Words only from `sm`: the row is too wide for a phone. */}
              <InputGroup.Text className="d-none d-sm-flex">
                {em?.filter.within}
              </InputGroup.Text>

              <Form.Control
                type="number"
                min={MIN_RADIUS}
                max={MAX_RADIUS}
                list="eventsRadii"
                style={NARROW}
                value={radius}
                disabled={point === null}
                isInvalid={point !== null && !radiusValid}
                onChange={(e) => setRadius(e.currentTarget.value)}
              />

              <InputGroup.Text>km</InputGroup.Text>

              <LongPressTooltip label={em?.form.setLocation} breakpoint="sm">
                {({ props, label, labelClassName }) => (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      dispatch(eventsSetPickPosition(point));

                      dispatch(
                        eventsSetPickRadius(
                          radiusValid ? radiusKm : DEFAULT_RADIUS,
                        ),
                      );

                      dispatch(eventsSetPickingStart(true));
                    }}
                    {...props}
                  >
                    <FaMapMarkerAlt />{' '}
                    <span className={labelClassName}>{label}</span>
                  </Button>
                )}
              </LongPressTooltip>

              {/* In an input group a Dropdown renders no wrapper of its own. */}
              <Dropdown
                align="end"
                onSelect={(key) => {
                  if (key === 'current') {
                    takeMyLocation();
                  } else if (key === 'home' && home) {
                    setPlace(latLonToString(home, language));
                  }
                }}
              >
                <Dropdown.Toggle split variant="secondary" />

                <FmDropdownMenu>
                  <Dropdown.Item as="button" type="button" eventKey="current">
                    <FaRegDotCircle />
                    <MenuLabel>{em?.filter.myLocation}</MenuLabel>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
                    type="button"
                    eventKey="home"
                    disabled={!home}
                  >
                    <FaHome />
                    <MenuLabel>{em?.filter.homePosition}</MenuLabel>
                  </Dropdown.Item>
                </FmDropdownMenu>
              </Dropdown>
            </InputGroup>

            <PlaceName position={point} className="mt-1" />

            <datalist id="eventsRadii">
              {RADIUS_STOPS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">{em?.form.transport}</Form.Label>

            <ToggleButtonGroup
              type="checkbox"
              value={withAnyValue(transport)}
              onChange={(next: string[]) =>
                setTransport(fromAnyValue(next, transport))
              }
              className="d-flex flex-wrap gap-2"
            >
              <ToggleButton
                id="events-transport-any"
                value={ANY}
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {em?.any}
              </ToggleButton>

              {TRANSPORT_KINDS.map(({ kind, icon }) => (
                <ToggleButton
                  key={kind}
                  id={`events-transport-${kind}`}
                  value={kind}
                  variant="outline-primary"
                  className="rounded flex-grow-0"
                >
                  {icon} {rpm?.transportType[kind] ?? kind}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              {DIFFICULTY_ICON} {em?.form.difficulty}
            </Form.Label>

            <ToggleButtonGroup
              type="checkbox"
              value={withAnyValue(difficulty)}
              onChange={(next: string[]) =>
                setDifficulty(fromAnyValue(next, difficulty))
              }
              className="d-flex flex-wrap gap-2"
            >
              <ToggleButton
                id="events-difficulty-any"
                value={ANY}
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {em?.any}
              </ToggleButton>

              {DIFFICULTIES.map((d) => (
                <ToggleButton
                  key={d}
                  id={`events-difficulty-${d}`}
                  value={d}
                  variant="outline-primary"
                  className="rounded flex-grow-0"
                >
                  {DIFFICULTY_ICONS[d]} {em?.difficulty[d]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Form.Group>

          <div className="d-flex flex-wrap gap-3 mb-3">
            <TriCheck
              id="eventsDogs"
              value={dogs}
              onChange={setDogs}
              label={
                <>
                  <FaDog /> {em?.filter.dogsWelcome}
                </>
              }
            />

            <TriCheck
              id="eventsChildren"
              value={children}
              onChange={setChildren}
              label={
                <>
                  <FaChild /> {em?.filter.childrenSuitable}
                </>
              }
            />
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              {em?.filter.origin} <HintMark hint={em?.filter.originHint} />
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="eventsImported"
              value={
                imported === undefined ? ANY : imported ? 'imported' : 'own'
              }
              onChange={(next: string) =>
                setImported(next === ANY ? undefined : next === 'imported')
              }
              className="d-flex flex-wrap gap-2"
            >
              <ToggleButton
                id="events-imported-any"
                value={ANY}
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {em?.any}
              </ToggleButton>

              <ToggleButton
                id="events-imported-own"
                value="own"
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {em?.filter.own}
              </ToggleButton>

              <ToggleButton
                id="events-imported-yes"
                value="imported"
                variant="outline-primary"
                className="rounded flex-grow-0"
              >
                {em?.filter.imported}
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>

          <div className="d-flex flex-wrap gap-3">
            <RangeInput
              id="eventsDistance"
              label={
                <>
                  <FaRulerHorizontal /> {em?.form.length}
                </>
              }
              unit="km"
              value={distance}
              onChange={setDistance}
            />

            <RangeInput
              id="eventsDuration"
              label={
                <>
                  <FaRegClock /> {em?.form.duration}
                </>
              }
              unit="h"
              value={duration}
              onChange={setDuration}
            />

            <RangeInput
              id="eventsAscent"
              label={
                <>
                  <MdTrendingUp /> {em?.form.ascent}
                </>
              }
              unit="m"
              value={ascent}
              onChange={setAscent}
            />
          </div>

          <Form.Check
            id="eventsUnsaid"
            className="mt-3"
            checked={unsaid}
            onChange={(e) => setUnsaid(e.currentTarget.checked)}
            label={em?.filter.unsaid}
          />

          <Form.Text>{em?.filter.unsaidHint}</Form.Text>
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={!valid}
            icon={<FaCheck />}
            label={saving ? em?.savedFilters.saveAndApply : m?.general.apply}
          />

          {editing && (
            <FmFooterButton
              variant="danger"
              icon={<FaTrash />}
              label={em?.savedFilters.delete}
              onClick={deleteSaved}
            />
          )}

          <FmFooterButton
            variant="secondary"
            disabled={isFilterEmpty(filter) && !applied}
            icon={<FaEraser />}
            label={m?.general.clear}
            onClick={() => {
              dispatch(eventsSetFilter({}));

              dispatch(eventsSavedFilterPicked(null));

              close();
            }}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
