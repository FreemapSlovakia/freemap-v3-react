import { Markdown } from '@shared/components/Markdown.js';
import { UserChip } from '@shared/components/UserChip.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement, ReactNode } from 'react';
import { AlertLink, Badge } from 'react-bootstrap';
import { FaChild, FaDog, FaRegCalendarAlt, FaRegMap } from 'react-icons/fa';
import { coverUrl, type EventItem } from '../model/actions.js';
import { iconOfKind } from '../model/transports.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { DIFFICULTY_ICONS } from './difficultyIcons.js';

const alertLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <AlertLink href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </AlertLink>
);

/** An event's details, as its toast shows them. */
export function EventDetails({ event }: { event: EventItem }): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const em = useEventsMessages();

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
    event.distance !== null &&
      `${new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(event.distance / 1000)} km`,
    event.duration !== null && formatDuration(event.duration, language),
    event.ascent !== null && `↗ ${event.ascent} m`,
    event.descent !== null && `↘ ${event.descent} m`,
  ].filter(Boolean);

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
      {event.cover && (
        <a
          href={coverUrl(event.cover, 'large')}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1"
          data-toast-cover
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

      <div className="fw-bold">
        {event.title}{' '}
        {event.visibility === 'unlisted' && (
          <Badge bg="secondary">{em?.card.unlisted}</Badge>
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
          {attributes.map(({ id, icon, text }, i) => (
            <span key={id} className="d-inline-flex align-items-center gap-1">
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
        <div className="mt-1" style={{ overflowWrap: 'anywhere' }}>
          <Markdown text={event.description} link={alertLink} />
        </div>
      )}
    </div>
  );
}
