import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { Markdown } from '@shared/components/Markdown.js';
import { UserChip } from '@shared/components/UserChip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useRelativeTimeFormat } from '@shared/hooks/useRelativeTimeFormat.js';
import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { ReactElement, ReactNode } from 'react';
import { Badge } from 'react-bootstrap';
import {
  FaChild,
  FaDog,
  FaRegCalendarAlt,
  FaRegClock,
  FaRegMap,
  FaRulerHorizontal,
} from 'react-icons/fa';
import { MdTrendingDown, MdTrendingUp } from 'react-icons/md';
import { coverUrl, type EventItem } from '../model/actions.js';
import { iconOfKind } from '../model/transports.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';
import { eventRelativeTime } from './relativeTime.js';
import { useEventDatesFormat } from './useEventDatesFormat.js';

/**
 * An event's details, as its panel shows them under its actions; `mapActions`
 * go beside the linked map's name.
 */
export function EventDetails({
  event,
  mapActions,
}: {
  event: EventItem;
  mapActions?: ReactNode;
}): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const em = useEventsMessages();

  const rpm = useRoutePlannerMessages();

  const formatDates = useEventDatesFormat({
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const nowMs = useNow();

  const now = new Date(nowMs);

  const relativeFormat = useRelativeTimeFormat({ numeric: 'auto' });

  const kmFormat = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const relative = eventRelativeTime(event, relativeFormat, now);

  const relativeNode = (
    <span className="text-body-secondary"> ({relative.text})</span>
  );

  // Bold key, plain value, as the description's `**Start:**` and the app's <dt>.
  const labelled = (label: string | undefined, value: string) =>
    label ? (
      <span>
        <strong>{label}:</strong> {value}
      </span>
    ) : (
      value
    );

  // One per line, each labelled: an icon alone can't say what it is, or "no".
  const details = [
    // The transports share a line, each with its own icon.
    event.transports.length > 0 && {
      id: 'transports',
      icon: null,
      text: (
        <span className="d-flex flex-wrap align-items-center column-gap-1">
          {event.transports.map((kind, i) => (
            <span key={kind} className="d-inline-flex align-items-center gap-1">
              {i > 0 && '· '}
              {iconOfKind(kind)}
              {rpm?.transportType[kind as TransportTypeMsgKey]}
            </span>
          ))}
        </span>
      ),
    },
    event.distance !== null && {
      id: 'distance',
      icon: <FaRulerHorizontal />,
      text: labelled(
        em?.form.length,
        `${kmFormat.format(event.distance / 1000)} km`,
      ),
    },
    event.duration !== null && {
      id: 'duration',
      icon: <FaRegClock />,
      text: labelled(
        em?.form.duration,
        formatDuration(event.duration, language),
      ),
    },
    event.ascent !== null && {
      id: 'ascent',
      icon: <MdTrendingUp />,
      text: labelled(em?.form.ascent, `${event.ascent} m`),
    },
    event.descent !== null && {
      id: 'descent',
      icon: <MdTrendingDown />,
      text: labelled(em?.form.descent, `${event.descent} m`),
    },
    event.difficulty && {
      id: 'difficulty',
      icon: DIFFICULTY_ICONS[event.difficulty],
      text: labelled(
        em?.form.difficulty,
        em?.difficulty[event.difficulty] ?? event.difficulty,
      ),
    },
    event.dogs !== null && {
      id: 'dogs',
      icon: <FaDog />,
      text: (event.dogs ? em?.card.dogsWelcome : em?.card.noDogs) ?? '',
    },
    event.children !== null && {
      id: 'children',
      icon: <FaChild />,
      text: (event.children ? em?.card.children : em?.card.noChildren) ?? '',
    },
  ].filter((d) => d !== false && d !== null);

  return (
    <div className="d-flex flex-column gap-1">
      {/* The panel's header names the kind, as for an object. */}
      <p className="lead d-flex flex-wrap gap-2 align-items-baseline mb-2">
        <span className="fw-semibold">{event.title}</span>

        {event.visibility === 'unlisted' && (
          <Badge bg="secondary" className="fs-6 fw-normal">
            {em?.card.unlisted}
          </Badge>
        )}
      </p>

      {event.cover && (
        <a
          href={coverUrl(event.cover, 'large')}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2"
        >
          <img
            src={coverUrl(event.cover, 'thumb')}
            // The 480 and 1600 px variants the API writes.
            srcSet={`${coverUrl(event.cover, 'thumb')} 480w, ${coverUrl(event.cover, 'large')} 1600w`}
            sizes="480px"
            alt=""
            className="rounded w-100"
            style={{ maxHeight: '180px', objectFit: 'cover' }}
          />
        </a>
      )}

      <div className="d-flex align-items-center gap-1">
        <FaRegCalendarAlt className="flex-shrink-0" />
        <span>
          {formatDates(event, { of: relative.anchor, node: relativeNode })}
        </span>
      </div>

      <div className="d-flex align-items-center">
        <UserChip user={event.user} />
      </div>

      {details.map(({ id, icon, text }) => (
        <div key={id} className="d-flex align-items-center gap-1">
          {icon && <span className="flex-shrink-0 d-inline-flex">{icon}</span>}
          {text}
        </div>
      ))}

      {event.mapId !== null && (
        <div className="d-flex flex-wrap align-items-center column-gap-2 row-gap-1">
          {event.mapName && (
            <span className="d-flex align-items-center gap-1">
              <FaRegMap /> {event.mapName}
            </span>
          )}

          {mapActions}
        </div>
      )}

      {/* The organizer's free text, apart from the fields above it. */}
      {event.description && (
        <>
          <hr className="my-2" />

          <div style={{ overflowWrap: 'anywhere' }}>
            <Markdown text={event.description} />
          </div>
        </>
      )}
    </div>
  );
}
