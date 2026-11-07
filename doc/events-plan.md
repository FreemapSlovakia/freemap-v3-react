# Events: UX plan

Where the events feature (branch `events`, both repos) is heading, implemented
step by step. Tick a step when it lands; the description of what the code does
now lives in `src/static/llms-photos-maps.md`.

## Model

An event stands on its own: an id, an owner, a title, a description, a start
and optional end time, a start point (required — it places and filters the
event) and a visibility (public, or unlisted: reachable by link, not listed).

- **Linked map, optional.** An event may link one of its owner's own maps (not
  one they merely write). A map can be linked by any number of events — the
  same route on several dates. Deleting the map unlinks it and keeps the event.
  Maps are readable by their link as they always are; an event grants nothing.
- **Trip stats, a snapshot.** The transport kinds it suits (any number), length,
  duration, ascent and descent are the event's own fields, for showing and for
  filtering on the server. Choosing the linked map computes them in the browser
  from it — the saved route's chosen alternative and its transport's kind, or
  the drawn lines' length where there is no route — filling only what is still
  empty; the owner may type them by hand.
- **Who it suits.** Difficulty (easy / moderate / demanding / expert), dogs
  (welcome / not allowed) and children (suitable / not), each optional. Children
  rather than a minimum age: an age is a rule the organizer would have to
  enforce; a hard limit goes in the description.

## Flow

### 1. Discover — the Events layer

- Markers at start points, the title in a tooltip; clustered when zoomed out.
- Upcoming events by default (from today); the past only through the filter.
- Toolbar: _Events_ · **Filter** · **New event** · close; hidden while the
  selected event's map is loaded.
  - Filter dialog: date range, transport, difficulty, dogs, children, length,
    duration and ascent ranges; **Near** a place within a radius; later _Who_ —
    Everyone / People I follow / Mine.
- In the Map layers panel the layer's row lists the events shown; picking one
  selects it.

### 2. Select an event

Halo on the marker, and the event's panel (`DockPanel`, see
[UI conventions](./ui-conventions.md)): docked on the right, or at the bottom of
a phone; the title, the actions, then the details (cover, dates, organizer, trip
stats, attributes, linked map, description). Clicking another marker swaps its
content in place. Its actions:

- **Interested** and **Going** with their counts.
- **Open in new tab** — the linked map as a full app of its own: profile,
  colorizing, export, editing as a copy. The user's own map stays untouched in
  the first tab.
- **⋮ Load here** — loads the linked map into the user's own, asking to append
  or replace as My maps' Load does. The layer stays on and the event selected;
  **Back to events** disconnects and clears the map.
- **Edit** and **Delete** for the owner.
- Both open actions sit beside the linked map's name in the details, not
  among the actions; neither without a linked map.

### 3. Create and edit

An event form (dialog): title, description, start and end; the linked map (one
of the owner's maps), whose choosing fills the title, start, transports and
stats that are still empty; the start point — one coordinate field as the gallery's, with
**Set the location** picking it on the map while the dialog hides; the trip
stats; visibility. Reached from the events toolbar (**New event**), from a map's
menu in My maps (**New event**, the map linked and its stats filled), and
from the selection toolbar (**Edit**).

### 4. Participants, discussion, notifications

- **Interested** / **Going**, one of them per user, toggled from the event;
  both counted in its details, with the names of who is going and who is
  interested.
- Until there is a thread, the description carries a way to reach the
  organizer; the form asks for it.
- A discussion thread per event, for logged-in users, in the event's panel.
- Email to whoever is involved — the organizer and those interested or going —
  about what concerns them; opted out of in the account like the photo emails.
  The organizer may show their email on the event.
- Later: one-way follows, no approval; **Follow** on the organizer; the _People
  I follow_ filter; a _Followers only_ visibility.

## Steps

### Done

- [x] Standalone event model: API table and routes, the event form with stats
      from the linked map (or a new map from what is on screen) and **Set the
      location**, New event from the toolbar and My maps, Edit / Delete, **Open
      in new tab** with **Load here** behind its caret.
- [x] Cover image: one per event, uploaded on its own
      (`PUT`/`DELETE /events/{id}/cover`, after the event's own save); the API
      writes a 1600 px and a 480 px WebP under `EVENT_COVERS_DIRECTORY`, named
      by a fresh short UUID so `/events/covers/{name}` is cached immutably, and
      the event keeps the name. Not a gallery photo — those are public,
      CC-licensed and placed — and never inline base64.
- [x] Near a place: the filter's **Near** — a place (the coordinate field, or
      **Set the location** with **My location** and **Home position** behind
      its caret) within a radius of 10–1000 km, typed or set on a slider of
      round values in the picking toolbar while the circle is drawn. The API
      takes `near=lat,lon&radius=km`, narrowing by a bounding box on the start
      point's index before the exact distance; the panel's list shows and sorts
      by the distance.
- [x] `#event=<id>` deep link: the selection is in the URL, and a link selects
      the event with the layer on.
- [x] Upcoming by default: without a start date the list asks only for events
      not yet ended, unless the end date lies in the past; a past event still
      opens by its link.

### Release 1

- [x] 1. **Interested / Going.** API: an `eventParticipant` table (event, user,
      status), `PUT`/`DELETE /events/{id}/participation`, the counts and the
      caller's own status on every event. Web: the two toggles with their
      counts in the event's panel; pressing the active one withdraws it, and
      a logged-out user is offered to log in.
- [x] 2. **Contact hint**: until there is a discussion, the form's
      description asks for a way to reach the organizer (phone, email, a chat
      group).
- [x] 3. **Texts in English and Slovak**: the events texts into the
      translation files; the other languages fall back to English.
- [x] 4. **Review** of the whole branch against `main`, both repos.
- [x] 5. **Release**: `EVENT_COVERS_DIRECTORY` in the production config; the
      "Load here, then reload" check; an announcement-log entry; merge to
      `main`, API first.

### Release 2

- [x] **The event's panel** in place of the toast and the selection toolbar:
      the actions and the details, docked over the map.
- [x] **Who is going**, listed in the panel. API:
      `GET /events/{id}/participants`, going first, each by when they said so.
      Web: loaded whenever the selected event is set or refreshed; the going
      and the interested under the details, as user chips.
- [ ] **Discussion.** API: an `eventComment` table, list and post (and the
      author or a moderator deleting), as the photo comments. Web: the thread
      in the panel, newest last, posting for logged-in users.
- [ ] **Email notifications**: the organizer on a new comment or someone
      going; the interested and going on a change of time or place, on the
      event being deleted, and on new comments. One opt-out in the account, as
      for photo comments; every email links to the event (`#event=`).
- [ ] **Organizer's email on the event**, where the organizer agrees to it in
      the form — a contact beside the thread.
- [ ] Texts in the other languages (cs first).

### Later

- [ ] **Harvester** of club calendars (`freemap-v3-api/scripts/harvest-events.mjs`),
      on fm5 on a schedule. Per source one organizer account (KČT: one
      account for all its clubs, the club named in the description, until a
      club asks to manage its own); fetch only what robots.txt allows,
      politely, re-reading a page only when its list entry changes or it is
      two weeks old; one failing page is skipped, not the run. The
      description in the house style (bold labels, lists, **Zdroj:** last)
      but without the source's contacts — private people's names, phones and
      emails, also any sentence of a note giving one — linking the source
      page instead. Photon geocodes a place the source gives no coordinates
      for; an event without a usable place is skipped, and one matching a
      hand-entered event (within a day, within 10 km, half the title's words)
      too. A source without
      a start time gives a **date-only** event. `sourceKey`
      (`<source>:<id there>`) upserts through `POST /events`; the source is
      the master, so a re-harvest overwrites hand edits of what it supplies,
      keeping the owner, linked map, visibility and cover, and brings back
      one deleted here while the source still lists it. The source's
      upcoming events (`GET /events?source=`) gone from it are deleted.
      Sources needing extraction from prose or PDFs (KST's yearbook) through
      an LLM (Haiku). No social networks — their terms forbid it.
  - [x] KČT parser, dry run to JSON.
  - [x] API: `dateOnly` and `sourceKey`; web: date-only events shown and
        entered.
  - [ ] Web, before the first import — never limited silently by time, or a
        hidden event gets entered again:
    - [x] the layer loads all events matching the filter as summaries
          (`GET /events?summary=1`: no description, cover, organizer or
          counts; up to 10000), once per filter change, not per pan; the
          selected one is fetched in full;
    - [ ] the API's JSON compressed;
    - [ ] marker clustering, for thousands of markers zoomed out;
    - a filter set stays shown as the pressed **Filter** button, as the
      gallery's;
    - [ ] the form warns of a similar event — within a few km on the same
          day, whatever the filter — linking it.
  - [ ] The KČT account, posting and deleting, a full run, the fm5 timer.
        Deleting needs every upcoming event of the source, whatever its
        visibility: `GET /events?source=` lists 1000 at most, the caller's
        public or own ones.
- [x] **Colorize by** (`model/colorize.ts`): when (default — ended, happening,
      upcoming graded by how soon), mine and others, transport, length,
      duration, ascent, difficulty, dogs, children; a legend, the
      `eventsSettings` slice and `events-cb=`. Transport is also the marker's
      icon when an event names one.
- [ ] Marker clustering.
- [ ] **Copy link** on the event.
- [ ] Follows and the _Who_ filter.
- [ ] **Who sees the participants**: public to anyone who can open the event
      for now; once there are follows, narrow it to the people one follows,
      or as Facebook events do it.
- [x] Formatted description: Markdown, written with **Write / Preview** tabs
      and rendered by `shared/components/Markdown` from `marked`'s tokens into
      React elements — never HTML, so raw markup shows as text, images as
      links, and only http(s) links are links. Plain text reads as itself.
- [ ] Only if Markdown proves too hard for organizers: a WYSIWYG editor
      (Tiptap) reading and writing the same Markdown.
- [ ] If the new tab proves clumsy (phones): a read-only view drawing a linked
      map without loading it into the editors.

New texts go into `src/features/events/translations/`, in English and Slovak;
the other languages fall back to English until Release 2.
