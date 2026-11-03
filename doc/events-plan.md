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

Halo on the marker, details in a toast (title, dates, description, trip stats,
linked map), and the selection toolbar:

- **Open in new tab** — the linked map as a full app of its own: profile,
  colorizing, export, editing as a copy. The user's own map stays untouched in
  the first tab.
- **⋮ Load here** — loads the linked map into the user's own, asking to append
  or replace as My maps' Load does. The layer stays on and the event selected;
  **Back to events** disconnects and clears the map.
- **Edit** and **Delete** for the owner.
- Neither open action without a linked map.

### 3. Create and edit

An event form (dialog): title, description, start and end; the linked map (one
of the owner's maps), whose choosing fills the title, start, transports and
stats that are still empty; the start point — one coordinate field as the gallery's, with
**Set the location** picking it on the map while the dialog hides; the trip
stats; visibility. Reached from the events toolbar (**New event**), from a map's
menu in My maps (**New event**, the map linked and its stats filled), and
from the selection toolbar (**Edit**).

### 4. Participants, follows, discussion

- Going / maybe, shown in the details and counted on the marker's card.
- One-way follows, no approval; **Follow** on the organizer; the _People I
  follow_ filter; a _Followers only_ visibility later.
- A discussion thread per event.
- Notifications last.

## Steps

- [ ] 1. Standalone event model: API table and routes, the event form with
      stats from the linked map and **Set the location**, New event from the toolbar and My
      maps, Edit / Delete, **Open in new tab** and **Load here**.
- [x] 2. Cover image: one per event, uploaded on its own
      (`PUT`/`DELETE /events/{id}/cover`, after the event's own save); the API
      writes a 1600 px and a 480 px WebP under `EVENT_COVERS_DIRECTORY`, named
      by a fresh short UUID so `/events/covers/{name}` is cached immutably, and
      the event keeps the name. Not a gallery photo — those are public,
      CC-licensed and placed — and never inline base64.
- [ ] 3. _Deferred — plain text serves until it doesn't._ Rich description:
      Tiptap in the form, loaded only there; text marks,
      lists, links and headings, no images. Stored as Tiptap JSON of those
      node types, so it can't carry markup, and rendered by a small renderer
      of our own without Tiptap. The listing drops the description; it is
      fetched when an event is selected.
- [x] 4. Near a place: the filter's **Near** — a place (the coordinate field
      with **My location** and **Set the location**) and a radius (10 / 25 / 50
      / 100 km suggested, or typed, up to 1000). The API takes
      `near=lat,lon&radius=km`, narrowing by a bounding box on the start point's
      index before the exact distance; the panel's list shows and sorts by the
      distance.
- [ ] 5. Details panel replacing the toast, once participants and discussion
      need the room; `#event=<id>` deep link.
- [ ] 6. Upcoming-by-default, marker clustering.
- [ ] 7. Participants.
- [ ] 8. Follows and the _Who_ filter.
- [ ] 9. Discussion.
- [ ] 10. Notifications.
- [ ] Later, if the new tab proves clumsy (phones): a read-only view drawing a
      linked map without loading it into the editors.

New texts stay English-only and may be hardcoded in components while the
feature is iterated on; they move into the translation files once it settles.
