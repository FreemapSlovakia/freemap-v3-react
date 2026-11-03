import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { ANY, fromAnyValue, withAnyValue } from '@shared/anyToggle.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import {
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
  FaRegClock,
  FaRulerHorizontal,
} from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  eventsSetFilter,
} from '../model/actions.js';
import { isFilterEmpty, type Range } from '../model/filter.js';
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

  const [inMapArea, setInMapArea] = useState(false);

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

      setInMapArea(Boolean(filter.inMapArea));

      setTransport(filter.transport ?? []);

      setDifficulty(filter.difficulty ?? []);

      setDogs(filter.dogs);

      setChildren(filter.children);

      setDistance(toRangeDraft(filter.distance));

      setDuration(toRangeDraft(filter.duration));

      setAscent(toRangeDraft(filter.ascent));
    }
  }, [show, filter]);

  useDocumentTitle(show ? 'Events filter' : undefined);

  const close = () => dispatch(setActiveModal(null));

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(
      eventsSetFilter({
        from: fromDateInput(from),
        to: fromDateInput(to),
        inMapArea: inMapArea || undefined,
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
    <Modal show={show} onHide={close} size="lg">
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
          </Form.Group>

          <Form.Check
            id="eventsInMapArea"
            className="mb-3"
            checked={inMapArea}
            onChange={(e) => setInMapArea(e.currentTarget.checked)}
            label="Only in the current map area"
          />

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
