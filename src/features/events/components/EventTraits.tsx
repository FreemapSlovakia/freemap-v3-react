import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { ReactElement, ReactNode } from 'react';
import {
  FaBan,
  FaChild,
  FaDog,
  FaLocationArrow,
  FaRegClock,
} from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import type { EventSummary } from '../model/actions.js';
import type { EventsListTrait, EventsNearSort } from '../model/listSort.js';
import { iconOfKind } from '../model/transports.js';
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

type Mark = { key: string; hint?: ReactNode; glyph?: ReactNode; text?: string };

/**
 * What an event says of itself, as a row of glyphs and figures — those of
 * `traits` it states — led by its distance from a distance sort's origin.
 */
export function EventTraits({
  event,
  traits,
  near,
}: {
  event: Pick<
    EventSummary,
    | 'transports'
    | 'difficulty'
    | 'dogs'
    | 'children'
    | 'distance'
    | 'duration'
    | 'ascent'
  >;
  traits: ReadonlySet<EventsListTrait>;
  near?: { sort: EventsNearSort; km: number };
}): ReactElement | null {
  const em = useEventsMessages();

  const rpm = useRoutePlannerMessages();

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

  if (marks.length === 0) {
    return null;
  }

  return (
    // Wraps onto further lines rather than widen a narrow row.
    <span className="d-inline-flex flex-wrap justify-content-end align-items-center column-gap-2">
      {marks.map(({ key, hint, glyph, text }) =>
        glyph ? (
          <span
            key={key}
            className="d-inline-flex align-items-center gap-1 text-nowrap"
          >
            {/* The row opens the event on a tap; a long press names the mark. */}
            <GlyphMarker
              hint={hint}
              color={null}
              size="inherit"
              cursor="pointer"
            >
              {glyph}
            </GlyphMarker>
            {text}
          </span>
        ) : (
          // A bare figure, named by its tooltip.
          <LongPressTooltip key={key} label={hint}>
            {({ props }) => (
              <span className="text-nowrap" {...props}>
                {text}
              </span>
            )}
          </LongPressTooltip>
        ),
      )}
    </span>
  );
}
