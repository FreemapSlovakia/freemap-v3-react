import type { EventItem } from './actions.js';

const apiUrl = () => process.env['API_URL'] ?? '';

const utc = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

const day = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '');

/** The event as an `.ics` file, for Apple, Outlook and other calendars. */
export const icsUrl = (id: string) =>
  `${apiUrl()}/events/${encodeURIComponent(id)}/calendar.ics`;

/** Google Calendar's form to add the event, filled in. */
export function googleCalendarUrl(
  event: Pick<
    EventItem,
    'id' | 'title' | 'startAt' | 'endAt' | 'dateOnly' | 'startPoint'
  >,
) {
  const { startAt, endAt, dateOnly, startPoint } = event;

  // A date-only event's bounds are UTC midnights; the end is exclusive.
  const dates = dateOnly
    ? `${day(startAt)}/${day(new Date((endAt ?? startAt).getTime() + 86_400_000))}`
    : `${utc(startAt)}/${utc(endAt ?? startAt)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: `${location.origin}/#panel=event/${event.id}`,
    location: `${startPoint.lat.toFixed(6)}, ${startPoint.lon.toFixed(6)}`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

/** A feed of the token user's events, or of their saved filter's. */
export function feedUrl(token: string, filterId: number | null, name: string) {
  const params = new URLSearchParams({
    authToken: token,
    ...(filterId === null ? { name } : { filter: String(filterId) }),
  });

  return `${apiUrl()}/events/calendar.ics?${params}`;
}

/** The feed as calendar apps subscribe to it. */
export const webcalUrl = (url: string) => url.replace(/^https?:/, 'webcal:');

/** Google Calendar's page subscribing to the feed. */
export const googleSubscribeUrl = (url: string) =>
  `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl(url))}`;
