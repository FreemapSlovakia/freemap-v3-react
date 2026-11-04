import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ANY, fromAnyValue, withAnyValue } from '@shared/anyToggle.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import { getCurrentPosition, latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import {
  Button,
  Dropdown,
  Form,
  InputGroup,
  Modal,
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
} from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  eventsSetFilter,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsSetPickRadius,
  eventsStartPicked,
} from '../model/actions.js';
import {
  isFilterEmpty,
  MAX_RADIUS,
  MIN_RADIUS,
  RADIUS_STOPS,
  type Range,
} from '../model/filter.js';
import { TRANSPORT_KINDS } from '../model/transports.js';
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
  return (
    <Form.Group controlId={id}>
      <Form.Label>{label}</Form.Label>

      <InputGroup>
        <Form.Control
          type="number"
          min={0}
          step="any"
          placeholder="from"
          style={NARROW}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.currentTarget.value })}
        />

        <InputGroup.Text>–</InputGroup.Text>

        <Form.Control
          type="number"
          min={0}
          step="any"
          placeholder="to"
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

  const filter = useAppSelector((state) => state.events.filter);

  const [from, setFrom] = useState('');

  const [to, setTo] = useState('');

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

  const [distance, setDistance] = useState(toRangeDraft(undefined));

  const [duration, setDuration] = useState(toRangeDraft(undefined));

  const [ascent, setAscent] = useState(toRangeDraft(undefined));

  // Seeded from what applies on each open; edits wait for Apply.
  useEffect(() => {
    if (show) {
      setFrom(toDateInput(filter.from));

      setTo(toDateInput(filter.to));

      setPlace(filter.near ? latLonToString(filter.near, language) : '');

      setRadius(String(filter.near?.radius ?? DEFAULT_RADIUS));

      setTransport(filter.transport ?? []);

      setDifficulty(filter.difficulty ?? []);

      setDogs(filter.dogs);

      setChildren(filter.children);

      setDistance(toRangeDraft(filter.distance));

      setDuration(toRangeDraft(filter.duration));

      setAscent(toRangeDraft(filter.ascent));
    }
  }, [show, filter, language]);

  useEffect(() => {
    if (show && picked) {
      setPlace(latLonToString(picked, language));

      if (pickedRadius !== null) {
        setRadius(String(pickedRadius));
      }

      dispatch(eventsStartPicked(null));
    }
  }, [show, picked, pickedRadius, dispatch, language]);

  useDocumentTitle(show ? 'Events filter' : undefined);

  const close = () => dispatch(setActiveModal(null));

  const point = parsePlace(place);

  const radiusKm = Number(radius);

  const radiusValid =
    radius.trim() !== '' && radiusKm >= MIN_RADIUS && radiusKm <= MAX_RADIUS;

  const valid = place.trim() === '' || (point !== null && radiusValid);

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

    dispatch(
      eventsSetFilter({
        from: fromDateInput(from),
        to: fromDateInput(to),
        near: point ? { ...point, radius: radiusKm } : undefined,
        transport: transport.length ? transport : undefined,
        difficulty: difficulty.length ? difficulty : undefined,
        dogs,
        children,
        distance: fromRangeDraft(distance),
        duration: fromRangeDraft(duration),
        ascent: fromRangeDraft(ascent),
      }),
    );

    close();
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
          <FaFilter /> Events filter
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Body>
          <Form.Group controlId="eventsDate" className="mb-3">
            <Form.Label>Date</Form.Label>

            <InputGroup>
              <Form.Control
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.currentTarget.value)}
              />

              <InputGroup.Text>–</InputGroup.Text>

              <Form.Control
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.currentTarget.value)}
              />
            </InputGroup>

            <Form.Text>
              Without a start date, only events that haven’t ended yet; set one
              for past events.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="eventsNear" className="mb-3">
            <Form.Label>
              <FaSearchLocation /> Near
            </Form.Label>

            <InputGroup>
              <Form.Control
                placeholder="Anywhere"
                value={place}
                isInvalid={place.trim() !== '' && point === null}
                onChange={(e) => setPlace(e.currentTarget.value)}
              />

              <InputGroup.Text>within</InputGroup.Text>

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

              <Button
                onClick={() => {
                  dispatch(eventsSetPickPosition(point));

                  dispatch(
                    eventsSetPickRadius(
                      radiusValid ? radiusKm : DEFAULT_RADIUS,
                    ),
                  );

                  dispatch(eventsSetPickingStart(true));
                }}
              >
                <FaMapMarkerAlt /> Set the location
              </Button>

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
                <Dropdown.Toggle split variant="primary" />

                <FmDropdownMenu>
                  <Dropdown.Item as="button" type="button" eventKey="current">
                    <FaRegDotCircle />
                    <MenuLabel>My location</MenuLabel>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
                    type="button"
                    eventKey="home"
                    disabled={!home}
                  >
                    <FaHome />
                    <MenuLabel>Home position</MenuLabel>
                  </Dropdown.Item>
                </FmDropdownMenu>
              </Dropdown>
            </InputGroup>

            <datalist id="eventsRadii">
              {RADIUS_STOPS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="d-block">Transport</Form.Label>

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
                Any
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
              {DIFFICULTY_ICON} Difficulty
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
                Any
              </ToggleButton>

              {DIFFICULTIES.map((d) => (
                <ToggleButton
                  key={d}
                  id={`events-difficulty-${d}`}
                  value={d}
                  variant="outline-primary"
                  className="rounded flex-grow-0"
                >
                  {DIFFICULTY_ICONS[d]} {DIFFICULTY_LABELS[d]}
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
                  <FaDog /> Dogs welcome
                </>
              }
            />

            <TriCheck
              id="eventsChildren"
              value={children}
              onChange={setChildren}
              label={
                <>
                  <FaChild /> Suitable for children
                </>
              }
            />
          </div>

          <div className="d-flex flex-wrap gap-3">
            <RangeInput
              id="eventsDistance"
              label={
                <>
                  <FaRulerHorizontal /> Length
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
                  <FaRegClock /> Duration
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
                  <MdTrendingUp /> Ascent
                </>
              }
              unit="m"
              value={ascent}
              onChange={setAscent}
            />
          </div>
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={!valid}
            icon={<FaCheck />}
            label={m?.general.apply}
          />

          <FmFooterButton
            variant="secondary"
            disabled={isFilterEmpty(filter)}
            icon={<FaEraser />}
            label={m?.general.clear}
            onClick={() => {
              dispatch(eventsSetFilter({}));

              close();
            }}
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
