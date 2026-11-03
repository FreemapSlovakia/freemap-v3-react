import { UserChip } from '@shared/components/UserChip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
import { FaChild, FaDog, FaRegCalendarAlt, FaRegMap } from 'react-icons/fa';
import { DIFFICULTY_LABELS, type EventItem } from '../model/actions.js';
import { iconOfKind } from '../model/transports.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';

/** An event's details, as its toast shows them. */
export function EventDetails({ event }: { event: EventItem }): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const dateFormat = useDateTimeFormat({
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const icons = event.transports.map((kind) => (
    <span key={kind}>{iconOfKind(kind)}</span>
  ));

  const stats = [
    event.distance !== null && `${(event.distance / 1000).toFixed(1)} km`,
    event.duration !== null && formatDuration(event.duration, language),
    event.ascent !== null && `↗ ${event.ascent} m`,
    event.descent !== null && `↘ ${event.descent} m`,
  ].filter(Boolean);

  // Icon and words: an icon alone can't say "no".
  const attributes = [
    event.difficulty && {
      icon: DIFFICULTY_ICONS[event.difficulty],
      text: DIFFICULTY_LABELS[event.difficulty],
    },
    event.dogs !== null && {
      icon: <FaDog />,
      text: event.dogs ? 'Dogs welcome' : 'No dogs',
    },
    event.children !== null && {
      icon: <FaChild />,
      text: event.children ? 'Suitable for children' : 'Not for children',
    },
  ].filter((a) => a !== false && a !== null);

  return (
    <div className="d-flex flex-column gap-1">
      <div className="fw-bold">
        {event.title}{' '}
        {event.visibility === 'unlisted' && (
          <Badge bg="secondary">Unlisted</Badge>
        )}
      </div>

      <div className="d-flex align-items-center gap-1">
        <FaRegCalendarAlt className="flex-shrink-0" />
        {dateFormat.format(event.startAt)}
        {event.endAt && ` – ${dateFormat.format(event.endAt)}`}
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
          {attributes.map(({ icon, text }, i) => (
            <span key={text} className="d-inline-flex align-items-center gap-1">
              {i > 0 && '· '}
              {icon}
              {text}
            </span>
          ))}
        </div>
      )}

      {event.mapName && (
        <div className="d-flex align-items-center gap-1">
          <FaRegMap /> {event.mapName}
        </div>
      )}

      {event.description && (
        <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
          {event.description}
        </div>
      )}
    </div>
  );
}
