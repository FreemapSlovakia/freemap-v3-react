# Events: UX plan

Where the events feature (branch `events`, both repos) is heading, implemented
step by step. Tick a step when it lands; the description of what the code does
now lives in `src/static/llms-photos-maps.md`.

## Model

An event is a saved map published as a shared trip: at most one per map, keyed
by the map's id (`mapEvent` in the API), titled by the map's name and managed
by whoever can write the map. A map that is an event is readable by its link.

## The principle

An event is **viewed**, never loaded into the user's own map. Loading it into
the editors is what made opening one ask about replacing the user's work and
left its features editable. The only path into the editors is the explicit
**Copy to my maps**.

## Flow

### 1. Discover — the Events layer

- Markers at start points, clustered when zoomed out, the name in a tooltip.
- Upcoming events by default (from today); the past only through the filter.
- Toolbar: _Events_ · **Filter** · **Create event** · close.
  - Filter dialog: date range, current map area, and _Who_ — Everyone / People I
    follow / Mine (organizing or going).
  - Create event: My maps' form with **Event** ticked.

### 2. Click a marker — preview

The marker gets the selection halo and a preview card shows in the toast slot:
name, date ("Sat 15 Nov, 9:00 · in 3 days"), organizer, route length and
ascent, how many are going, and one action: **View event**. Another marker
swaps the card.

### 3. View event — event mode

On the map:

- The event's content (route, markers, photos) is drawn read-only in a pane of
  its own, in the event's color; the view fits to it; other events' markers
  fade.
- The user's own content — planned route, drawing, data — and the tools'
  toolbars are hidden while in event mode, as a picking mode hides the chrome.
  They stay in the store and the URL untouched, and come back exactly as they
  were on leaving. **⋮ → Show my map too** shows them underneath, faded, for
  comparing.
- The events toolbar is replaced by the event's: **← Events** · name ·
  **Going ✓** · **Share** · **⋮** (Copy to my maps, Navigate to start, Export
  GPX; the organizer's Edit).
- **← Events** or Esc goes back to browsing at the view it left.

In a details panel (right-hand drawer on desktop, bottom sheet with snap points
on phones):

- Header: name, date and time, organizer with **Follow**.
- Description.
- Meeting point: pans there; navigate to it.
- Route: length, ascent, elevation chart.
- Going: participants' avatars, going / maybe.
- Photos: the map's own, and gallery photos taken along the route.
- Discussion: a comment thread, newest last, composer at the bottom.

Deep link `#event=<mapId>` opens event mode directly; **Share** copies it, and
it is how an unlisted event is reached.

### 4. Editing

- A participant gets the content into the editors only by **Copy to my maps**,
  which asks to append or replace as My maps' Load does.
- The organizer's **Edit** opens the map in My maps, whose form holds the event
  fields.

### 5. Following

- One-way follow, no approval: events are public or reachable by link anyway.
- **Follow** on the organizer in the panel and the preview card; a _Following_
  list in the account.
- Feeds the _People I follow_ filter now, notifications later (a followed user
  publishes an event nearby, a reply in a discussion).
- A _Followers only_ visibility later — the point where one-way versus mutual
  matters, decided then.

## Steps

- [ ] 1. Read-only rendering of a map document: draws a `MapData` without
      dispatching it into the editing slices. Everything below rests on it.
- [ ] 2. Event mode and its details panel; hiding and restoring the user's own
      content; the `#event=` link; **← Events** back to the browsing view;
      **Copy to my maps** replacing today's Open.
- [ ] 3. Preview card on marker click; upcoming-by-default; marker clustering.
- [ ] 4. Participants (going / maybe): API table, the panel's list, **Going ✓**.
- [ ] 5. Follows: API table, **Follow**, the _Who_ filter.
- [ ] 6. Discussion: API table, the thread in the panel.
- [ ] 7. Notifications.

New texts stay English-only and may be hardcoded in components while the
feature is iterated on; they move into the translation files once it settles.
