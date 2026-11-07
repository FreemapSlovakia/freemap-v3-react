import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { Markdown } from '@shared/components/Markdown.js';
import { UserChip } from '@shared/components/UserChip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { ReactElement, ReactNode } from 'react';
import { Badge } from 'react-bootstrap';
import { FaChild, FaDog, FaRegCalendarAlt, FaRegMap } from 'react-icons/fa';
import { coverUrl, type EventItem } from '../model/actions.js';
import { iconOfKind } from '../model/transports.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';
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

  const stats = [
    event.distance !== null &&
      `${new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(event.distance / 1000)} km`,
    event.duration !== null && formatDuration(event.duration, language),
    event.ascent !== null && `↗ ${event.ascent} m`,
    event.descent !== null && `↘ ${event.descent} m`,
  ].filter(Boolean);

  // Named where no stats follow, or an icon alone wouldn't say what it is.
  const icons = event.transports.map((kind) => (
    <span key={kind} className="d-inline-flex align-items-center gap-1">
      {iconOfKind(kind)}
      {stats.length === 0 && rpm?.transportType[kind as TransportTypeMsgKey]}
    </span>
  ));

  // Icon and words: an icon alone can't say "no".
  const attributes = [
    event.difficulty && {
      id: 'difficulty',
      icon: DIFFICULTY_ICONS[event.difficulty],
      text: em?.difficulty[event.difficulty] ?? event.difficulty,
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
  ].filter((a) => a !== false && a !== null);

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
        {formatDates(event)}
      </div>

      <div className="d-flex align-items-center">
        <UserChip user={event.user} />
      </div>

      {(icons.length > 0 || stats.length > 0) && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {icons}
          {stats.join(' · ')}
        </div>
      )}

      {attributes.length > 0 && (
        <div className="d-flex flex-wrap align-items-center column-gap-1">
          {attributes.map(({ id, icon, text }, i) => (
            <span key={id} className="d-inline-flex align-items-center gap-1">
              {i > 0 && '· '}
              {icon}
              {text}
            </span>
          ))}
        </div>
      )}

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

      {event.description && (
        <div className="mt-1" style={{ overflowWrap: 'anywhere' }}>
          <Markdown text={event.description} />
        </div>
      )}
    </div>
  );
}
