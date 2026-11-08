import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import {
  FaBan,
  FaCheck,
  FaChild,
  FaDog,
  FaLocationArrow,
  FaRegClock,
  FaStar,
  FaUser,
} from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import type { EventSummary } from '../model/actions.js';
import type { EventsListTrait, EventsNearSort } from '../model/listSort.js';
import { iconOfKind } from '../model/transports.js';
import type { EventsMessages } from '../translations/EventsMessages.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';

/** A glyph under a red prohibition sign, as "no dogs". */
function Not({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="position-relative d-inline-block">
      {children}
      <FaBan className="position-absolute top-0 start-0 text-danger" />
    </span>
  );
}

/** A glyph that says it all (an indicator), or a figure with its unit or glyph (a value). */
type Mark = {
  key: string;
  hint?: ReactNode;
  glyph?: ReactNode;
  text?: string;
  /** Cut short, the whole of it in the hint. */
  truncate?: boolean;
};

/** A trait's name, as the menu of what rows show lists it. */
export function traitLabel(
  em: EventsMessages | undefined,
  trait: EventsListTrait,
): string | undefined {
  switch (trait) {
    case 'interested':
      return em?.list.interestedCount;
    case 'going':
      return em?.list.goingCount;
    default:
      return em?.form[trait];
  }
}

type Props = {
  event: Pick<
    EventSummary,
    | 'transports'
    | 'difficulty'
    | 'dogs'
    | 'children'
    | 'distance'
    | 'duration'
    | 'ascent'
    | 'user'
    | 'interestedCount'
    | 'goingCount'
  >;
  traits: ReadonlySet<EventsListTrait>;
  /** A distance sort's origin, the event's distance from it leading the values. */
  near?: { sort: EventsNearSort; km: number };
  /** The stat the list is sorted by, shown even where it is zero. */
  sorted?: EventsListTrait;
};

/** Transports, difficulty, dogs and children, those of `traits` the event states. */
function useIndicators({ event, traits }: Props): Mark[] {
  const em = useEventsMessages();

  const rpm = useRoutePlannerMessages();

  const marks: Mark[] = [];

  if (traits.has('transport')) {
    for (const kind of event.transports) {
      const glyph = iconOfKind(kind);

      // A kind this client doesn't know has no glyph to show.
      if (glyph) {
        marks.push({
          key: `t-${kind}`,
          hint: rpm?.transportType[kind as TransportTypeMsgKey],
          glyph,
        });
      }
    }
  }

  if (traits.has('difficulty') && event.difficulty) {
    marks.push({
      key: 'difficulty',
      hint: em?.difficulty[event.difficulty],
      glyph: DIFFICULTY_ICONS[event.difficulty],
    });
  }

  if (traits.has('dogs') && event.dogs !== null) {
    marks.push({
      key: 'dogs',
      hint: event.dogs ? em?.card.dogsWelcome : em?.card.noDogs,
      glyph: event.dogs ? (
        <FaDog />
      ) : (
        <Not>
          <FaDog />
        </Not>
      ),
    });
  }

  if (traits.has('children') && event.children !== null) {
    marks.push({
      key: 'children',
      hint: event.children ? em?.card.children : em?.card.noChildren,
      glyph: event.children ? (
        <FaChild />
      ) : (
        <Not>
          <FaChild />
        </Not>
      ),
    });
  }

  return marks;
}

/** The figures and the organizer, those of `traits` the event states. */
function useValues({ event, traits, near, sorted }: Props): Mark[] {
  const em = useEventsMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const kmFormat = useNumberFormat({ maximumFractionDigits: 1 });

  const mFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const marks: Mark[] = [];

  if (near) {
    marks.push({
      key: 'near',
      hint: em?.list.distanceFrom[near.sort],
      glyph: <FaLocationArrow />,
      text: `${kmFormat.format(near.km)} km`,
    });
  }

  if (traits.has('length') && event.distance !== null) {
    marks.push({
      key: 'length',
      hint: em?.form.length,
      text: `${kmFormat.format(event.distance / 1000)} km`,
    });
  }

  if (traits.has('duration') && event.duration !== null) {
    marks.push({
      key: 'duration',
      hint: em?.form.duration,
      glyph: <FaRegClock />,
      text: formatDuration(event.duration, language),
    });
  }

  if (traits.has('ascent') && event.ascent !== null) {
    marks.push({
      key: 'ascent',
      hint: em?.form.ascent,
      glyph: <MdTrendingUp />,
      text: `${mFormat.format(event.ascent)} m`,
    });
  }

  if (traits.has('organizer') && event.user) {
    const { name } = event.user;

    marks.push({
      key: 'organizer',
      hint: em ? `${em.form.organizer}: ${name}` : name,
      glyph: <FaUser />,
      text: name,
      truncate: true,
    });
  }

  // A count of nobody says nothing, unless the list is sorted by it.
  if (
    traits.has('interested') &&
    (event.interestedCount > 0 || sorted === 'interested')
  ) {
    marks.push({
      key: 'interested',
      hint: traitLabel(em, 'interested'),
      glyph: <FaStar />,
      text: mFormat.format(event.interestedCount),
    });
  }

  if (traits.has('going') && (event.goingCount > 0 || sorted === 'going')) {
    marks.push({
      key: 'going',
      hint: traitLabel(em, 'going'),
      glyph: <FaCheck />,
      text: mFormat.format(event.goingCount),
    });
  }

  return marks;
}

function Glyph({ hint, glyph }: Pick<Mark, 'hint' | 'glyph'>): ReactElement {
  return (
    // The row opens the event on a tap; a long press names the mark.
    <GlyphMarker hint={hint} color={null} size="inherit" cursor="pointer">
      {glyph}
    </GlyphMarker>
  );
}

/** The event's indicators as one tight group, as beside its title. */
export function EventIndicators(props: Props): ReactElement | null {
  const marks = useIndicators(props);

  return marks.length === 0 ? null : (
    <span className="d-inline-flex align-items-center flex-shrink-0">
      {marks.map(({ key, hint, glyph }) => (
        <Glyph key={key} hint={hint} glyph={glyph} />
      ))}
    </span>
  );
}

// Its first space is a no-break one (U+00A0), binding the dot to the value
// before it, so a line never starts with one.
const SEPARATOR = ' · ';

/**
 * The event's values as running text, each one whole, separated by middle
 * dots; `afterText` puts a dot before the first too.
 */
export function EventValues({
  afterText,
  ...props
}: Props & { afterText?: boolean }): ReactElement {
  const marks = useValues(props);

  return (
    <>
      {marks.map(({ key, hint, glyph, text, truncate }, i) => (
        <Fragment key={key}>
          {(i > 0 || afterText) && SEPARATOR}

          {glyph ? (
            <span
              className="d-inline-flex align-items-center gap-1 text-nowrap align-bottom"
              style={{ maxWidth: truncate ? 'min(12em, 100%)' : '100%' }}
            >
              <Glyph hint={hint} glyph={glyph} />

              {truncate ? <span className="text-truncate">{text}</span> : text}
            </span>
          ) : (
            // A bare figure, named by its tooltip.
            <LongPressTooltip label={hint}>
              {({ props: target }) => (
                <span className="text-nowrap" {...target}>
                  {text}
                </span>
              )}
            </LongPressTooltip>
          )}
        </Fragment>
      ))}
    </>
  );
}
