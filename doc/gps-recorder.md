# GPS recorder integration

How the PWA drives the standalone **Freemap GPS recorder** — a native Android
app (Kotlin, self-hosted APK) that records a track to its own storage and
exposes a loopback HTTP API. The recorder owns the track; the PWA is a viewer
and remote control that holds no authoritative copy and never asks the recorder
to discard points.

Feature folder: `src/features/gpsRecorder/`.

> **The API's own `API.md`, in the recorder repo, is the source of truth** — its
> `./gradlew checkApiDocs` fails the build when it drifts from `TrackerApi.kt`,
> and a release cannot be cut with it out of date. What follows is only how this
> app consumes it; check there first when something disagrees.

## Availability

Two gates, both in [`support.ts`](../src/features/gpsRecorder/support.ts):

- **Platform** — Android, because the recorder is an Android APK. Deliberately
  *not* narrowed to Chromium: the Chromium-specific pieces (`targetAddressSpace`,
  the Local Network Access permission) degrade to no-ops elsewhere. Tested
  against the userAgent string, not `navigator.userAgentData` — that one is both
  Chromium-only and secure-context-only, so over plain http on a dev host it is
  `undefined` and would hide the tool exactly where it is being developed. A
  module constant: it cannot change within a page lifetime.
- **Nothing else.** It was behind the `layerPreview` role while it was being
  proven; it is now marked `experimental: true` in `toolDefinitions` instead, which
  puts `ExperimentalFunction`'s flask on the menu item and on the tool's own title.
  The people who would find the rough edges are the people who would use it, and a
  role gate kept them out.

`ToolDefinition.available` takes a `(state) => boolean` predicate rather than a
flag, because other tools' gates do depend on state. `unavailableToolsSelector` folds the whole registry into the
`|a|b|`-delimited string the menus filter against — a stable string, so
`useAppSelector` doesn't re-render on every unrelated action the way a fresh
array would. `Main.tsx` re-checks the gate independently, because
`#tools=gps-recorder` can name the tool on a device or account that can't use it.

## Wire contract

Everything the recorder's HTTP API is assumed to provide lives in
[`protocol.ts`](../src/features/gpsRecorder/protocol.ts) — origin, intent URL,
minimum version, and the zod schemas. **Change it there and nowhere else.** The
schemas are `looseObject`, so the recorder may add fields freely.

**There is one recorder version and no backward compatibility.** The APK has never
been released to anyone but its developers, so `MIN_RECORDER_VERSION_CODE` names
the current build and everything is written against it: every field the recorder
always sends is required, nothing is feature-detected, and there are no fallbacks.
When the recorder changes, raise that constant and *delete* whatever the new
contract makes unnecessary rather than keeping a branch for the version before it.
An older APK fails the schema outright — `getStatus` probes the body for a
`version` first, so it is reported as outdated with the download link rather than
as an answer that makes no sense.

| | |
| --- | --- |
| `GET /status` | `{ recording, config, count, lastSeq, generation, fields, version: { code, name }, permissions: { fine, background, notifications }, batteryExempt, oem: { vendor, needed, acknowledged }, canRecord, setupComplete, port, portEcho }` |
| `POST /start` | begin recording; body is the `RecorderConfig` |
| `POST /stop` | end recording |
| `GET /track?since=<seq>` | `{ fields: [...], points: [[...], ...] }` — everything **above** the cursor (`since` is exclusive) |
| `DELETE /track` | discard the whole track |
| `GET /stream` | SSE; an unnamed event is a point (`id:` its `seq`, `data:` one bare row or a batch), a named `status` event is the whole status object |

**Points travel columnar**, not as objects: a row per fix, ordered by the
`fields` header — as of versionCode 11 that is `["seq","ts","lat","lon","alt",
"acc","spd","brg","altMsl","altAcc","spdAcc","brgAcc","sat","src","seg"]`. `ts`
is epoch milliseconds; `seq` is the recorder-assigned monotonic id that doubles
as both the `/track?since=` cursor and the SSE event id. `decodePoints` reads
rows *by the declared column order*, so a recorder that reorders or adds columns
costs nothing here.

**Two altitudes, and the exported one is `altMsl`.** GPX `<ele>` means metres
above mean sea level, `alt` is metres above the WGS84 ellipsoid, and over
Slovakia the ellipsoid sits some 42 m higher — so `trackGeojson.ts` puts
`altMsl ?? alt` into the coordinate. The fallback is not optional: `altMsl` is
null below Android 14 and until a GNSS fix has been seen, so the opening fixes of
a recording can carry only `alt`. The statistics keep reading `alt` instead,
because ascent is a sum of differences that a constant offset cannot change,
while a mid-track switch between the two sources would invent one.

The list is **append-only**, and a reader is meant to ignore what it doesn't
know — so a cell is typed as `unknown` and read as the number its column should
hold, or as absent. Typing cells as numbers is what breaks on the day a column
like `src` (a provider name) is appended: zod then rejects the whole page, every
point of it, and the live view stops on a column nothing here even reads.

`/stream` sends bare rows with **no `fields` header** of their own, so the column
order comes from `/status`, from the status frame the stream opens with, or from
the last `/track` page. The sync reads a status before it ever opens a stream, so
the order is always known by then and `openRecorderStream` takes it as a required
argument.

**The stream carries state, not just points.** A named `status` event arrives on
connect and thereafter whenever the recorder's state genuinely changed — start,
stop, `DELETE /track`, and a permission or battery change the next time the
recorder's own screen resumes. `stream.ts` reconciles it through the
same `applyStatus` a polled status goes through, so a cleared `generation` or a
stopped recording lands the moment it happens.

**So nothing polls `/status`.** A sync runs at boot, when the page returns to the
foreground — a frozen page hears no events, so that catch-up is what fills the gap
— when the tool is opened, and when `stream.ts` revives a stream the browser gave
up on. A timer would only ask again for what the stream already said.

**`POST /stop` is a pause, so that is what the button says.** The recorder keeps
its track across a stop and opens a new segment on the next start, so stopping it
interrupts a ride rather than ending one — the transport is therefore Record ↔
Pause. The recorder has no `/pause` endpoint of its own and needs none.

**Ending a ride is Finish**, and it is about ownership rather than recording:
suspend, hand the track to the track viewer, keep a copy in this browser, and only
then let the recorder discard its own. That last step is what stops the same ride
living on the phone and in the app at once — see below for why the copy has to be
durable before it happens.

Two flags decide readiness, and they are not the same thing: **`canRecord`** is
the recorder's own verdict and the only gate that blocks a start;
**`setupComplete`** covers recommended-but-optional steps — a vendor autostart
or battery policy (`oem`), say — and belongs in a warning, not a refusal.
`useRecorderNotices` renders exactly that split, and renders it as **toasts** —
where this app says everything else of the kind. Both are `warning`s: a recorder
that isn't running, a permission not granted, a refusal that protected the
recording are states to act on rather than failures of the app. Only `http`,
`protocol` and `unknown` — the ones that mean something is genuinely broken — are
`danger`.

**A status nobody could reach is dropped.** `unreachable` and `lna-denied` clear
`gpsRecorder.status`, because everything read from it is otherwise a claim about
the past: the readout would go on saying `Stopped` for an app that has been
killed, and the setup warning would keep advising about a recording that cannot
start. Whether the recorder is set up is its own news to give, and it is not
giving any. Each carries the one action that resolves it, and each dismisses
itself through a `statePredicate` once the condition is gone, so nothing has to
be closed by hand. The technical detail stays in `gpsRecorder.error` for the
devtools instead of being printed over the map.

### What the recorder owns

- **The sampling config** travels with `POST /start`, and the recorder reports
  back what it clamped it to. `maxAccuracyM` is applied *there*, so this app runs
  no filter of its own — a second one could only disagree with the file on disk.
- **`seg`**, the segment ordinal, which it bumps on every start. That makes it the
  authority on where a recording was interrupted, so this app keeps no break list
  of its own: `splitPointsIntoSegments` splits on `seg` and, as a display
  preference, on a silence longer than `splitGapS`.
- **The track itself**, including whether it exists at all. `generation` is the
  only signal that the copy held here is gone.

### CORS

The recorder reflects the caller's `Origin` when it is on its allowlist — `https://freemap.sk`, `https://www.freemap.sk`,
`https://www.freemap.eu`, plus **`local.freemap.sk` on any port over http or
https** for development. An origin is scheme + host + port, so `www` and
non-`www` are different origins and both must be listed.

Point a dev server's hostname at `local.freemap.sk` (it resolves to loopback and
is a freemap.sk subdomain, so it is no weaker than controlling the site's DNS) —
`localhost:8080` is *not* allowed and will be blocked.

versionCode 2 answered with a single hardcoded `https://freemap.sk` regardless
of the request. Since `freemap.sk` 301-redirects to `www.freemap.sk`, the
production page origin could never match it, and every request failed as an
indistinguishable `TypeError: Failed to fetch`. That is what
`MIN_RECORDER_VERSION_CODE` rules out — though the check cannot report it,
because `/status` is itself blocked on such a build.

The preflight (`OPTIONS`, needed for `POST /start` and `/stop`) returns
`Access-Control-Allow-Private-Network: true` for Chrome's older Private Network
Access model; the newer Local Network Access model ignores it.

### Errors from `POST /start`

The recorder refuses with the **full status plus an `error` string** rather than
a bare code: `403` when its own `canRecord` gate fails, `409` when Android
refuses a backgrounded foreground-service start (which the battery-optimisation
exemption fixes). `recorderFetch` reads that body and maps both to
`setup-needed`, since both are things the user fixes in the app.

### Connection rules

- **Always the IP literal `127.0.0.1`, never `localhost`.** The name lookup makes
  Chrome classify the request differently, and the loopback opt-in stops applying.
- **Every `fetch` passes `{ targetAddressSpace: 'loopback' }`** so the Local
  Network Access check resolves. Declared in `typings/global.d.ts`; not in
  lib.dom yet. `recorderFetch` is the only place that calls `fetch`, so this
  cannot be forgotten at a call site.
- **`EventSource` cannot pass it.** The stream therefore only works once an
  earlier gestured fetch has been granted the permission — which is why the
  start flow calls `/status` first.
- **A Local Network Access *prompt* needs a real user gesture.** Once the
  permission is granted, nothing else does — so the tool syncs on mount and on a
  timer, and only offers a gestured "Connect" button (on the failure toast)
  after a failure, which is the one case a fresh prompt could help. The Record
  button likewise dispatches straight from `onClick`, since it may need the
  launch intent.

## Start flow

`startHandler` in
[`recorderHandlers.ts`](../src/features/gpsRecorder/model/recorderHandlers.ts):

1. `GET /status`. Success means the recorder is installed and running.
2. Only an `unreachable` failure navigates to `RECORDER_INTENT_URL`. The
   **`start` authority matters** — `freemap-gps-recorder://start` begins recording
   and hands focus straight back, while any other authority merely opens the
   app. A missing app follows `S.browser_fallback_url` to the download page.
   The `?port=` is echoed back as `portEcho` in `/status`.
3. `waitForStatus` then retries with a widening backoff — the service needs a
   moment to bind, and the browser throttles timers while backgrounded, so the
   steps are generous (~15 s total).
4. Version and permission checks, `POST /start`, then the sync below.
5. A `409` naming a `ForegroundService…` exception sends the user through the
   same intent, and `waitForRecording` then waits for `recording` rather than
   merely for an answer — see below.

### A start from the page is a background start

`RecorderApp` brings the recorder's HTTP server up **with the process**, not with
the recording, so `/status` answers while nothing is recording and no foreground
service is up. In that state `POST /start` makes the recorder call
`startForegroundService` while it is itself in the background — which it always is
when the page is what the user is looking at — and Android 12+ refuses that unless
the app is exempt from battery optimisation. `Setup.kt` deliberately keeps
`batteryExempt` out of `canRecord` (it is in `complete`), so a device that skipped
it can record but cannot be started from here.

The state is ordinary rather than exotic: stop a recording, stay in the browser,
press Record again. The recovery is the launch intent, where the recorder's own
visible activity makes the call and Android allows it. `POST /start` saves the
config *before* trying to start, so the recording the intent begins is the one
that was asked for — the fallback loses nothing.

It is also why a `/resume` cannot fail the same way, on a recorder that has one:
plain `startService` against a service already running and already foreground has
no foreground-service start for the platform to refuse. That, and the notification
action, is the whole of what a pause adds — which is why it is the recorder's
business and not this app's.

### Telling the failures apart

`RecorderFailure` in `protocol.ts`. The three the user can act on:

- **`lna-denied`** — the live view is gone, recording is not. Never send the user
  to the download page for this. Chrome reports a blocked Local Network Access
  request with the same opaque `TypeError` as an unreachable host, so
  `recorderClient` disambiguates via
  `navigator.permissions.query({ name: 'local-network-access' })`.
- **`setup-needed`** — reachable but reporting `missingPermissions`; link back
  into the app via the intent.
- **`unreachable`** — nothing answered, which does *not* mean nothing is
  installed: a recorder that was killed or swiped off the task list answers
  exactly the same way, and telling that user to install what they already have
  is both wrong and no help. The toast leads with **Open the recorder**
  (`RECORDER_OPEN_INTENT_URL` — the `open` authority launches the app, and its
  process is what serves the API, without deciding that a recording should begin)
  and offers the download second. The intent carries `browser_fallback_url`, so it
  lands on the download page anyway when the app really isn't there.

`needs-foreground` is the fourth, and it is handled before the user sees it: the
start flow retries through the intent by itself, and the panel only reports it if
that did not end in a recording either.

**Which intent a link uses is not a detail.** `RECORDER_INTENT_URL` (`start`) is
for the cases that came from the user asking to record — `setup-needed` and
`needs-foreground` — where the recorder resolves what is in the way and then
begins the recording that was wanted. Everything else uses
`RECORDER_OPEN_INTENT_URL` (`open`): an unreachable recorder, and the setup
checklist, which the user opened to *read*. A `start` link there finds
`canRecord` already true — none of the `setupComplete` items block recording —
starts a recording nobody asked for, and hands focus back before the screen has
been seen, which shows up as the page flickering and nothing else.

## Track sync

`syncHandler` runs at boot, on `visibilitychange` back to `visible`, when the tool
is opened, after a stream the browser gave up on, and at the end of the start flow
— never on a timer, because the stream says when something changed.

**Concurrent asks share one run.** Returning to the page with the tool open raises
both the `visibilitychange` sync and the menu's own, which on a stale cursor would
be two full `/track?since=0` downloads for the same answer, so `syncHandler`
coalesces onto the sync already in flight. A joiner's `quiet` is folded into it —
one caller who asked out loud is enough for a failure to be reported out loud. The
start flow is the exception and calls `runSync` directly: it needs a status newer
than its own `POST /start`, which a run already in flight might predate.

**The connection does not belong to the toolbar.** A recording carries on whichever
toolbar the user has open, and on the phone even while the browser is closed — so
[`follow.ts`](../src/features/gpsRecorder/follow.ts) owns it instead:
`attachRecorderFollow` is installed at boot next to the app's other attach helpers,
and syncs whenever `isRecorderFollowed()` (or the tool being open) says there is
something to follow. `applyStatus` sets that flag from the recorder's own answer —
recording, or holding points — and it lives in `localStorage` rather than the store,
because the question outlives the page. Nothing detaches the stream on the way out:
closing the toolbar says nothing about whether the phone is still recording, and the
follow flag going false is what ends the following.

Syncs from the follow path are **quiet**: nobody asked for them, so a recorder that
has since been killed or uninstalled must not greet the user with an error. The
failure is swallowed, following stops, and opening the tool is what tries again.

Two more things follow the recording rather than the toolbar, and so live in
`GpsRecorderResult` — which `Results` mounts whenever there are fixes **or** a
recording in progress: the position feed (`useRecorderLocationFeed`) and the
screen wake lock (`useRecorderWakeLock`). The second half of that gate is the
wake lock's: it belongs to the ride, and a screen that blanks between pressing
Record and the first fix is the case it exists for. In the menu, closing it would hand "Locate
me" back to the browser's own GPS watch mid-ride, which is the second watch the
feed exists to avoid. What stays in the menu is what belongs to the tool: its
buttons, and the failure and setup toasts.

1. `GET /status` — always, because it is what carries `recording`, `generation`
   and the setup flags.
2. `GET /track?since=<cursor>` **only when the recorder says there is something
   to fetch**: `lastSeq > cursor`, or nothing is held here yet. One comparison
   against a status that had to be read anyway.
3. Attach `/stream` — only if not already attached, so a resync never drops a
   working stream. **Reconnection is the browser's job** (`Last-Event-ID`) while
   it still believes in the connection; once it reports `CLOSED`, `stream.ts`
   drops the handle and re-dispatches `gpsRecorderSync` on a widening backoff
   (1 s → 30 s). It re-runs the whole sync rather than just reopening the
   socket, because whatever killed the stream may equally have stopped the
   recording or cleared the track.

There is no Reconnect button: the above covers every case one would answer.

Catch-up and the stream overlap by design, so batches arrive duplicated and
briefly out of order. `mergePoints` in the reducer merges by `seq` — appending
when the batch simply follows the track, and filling gaps below the cursor
otherwise.

**The cursor is not persisted.** `statePersistingMiddleware` re-serializes the
whole persisted subset on every action, so a persisted cursor would cost a full
`JSON.stringify` per incoming fix. A cold start holds no points and refetches
the track from `since=0` regardless — the recorder owns it.

## Segments

A recording that was stopped and restarted, or simply left alone for an hour, is
one track with breaks in it — drawing it as a single line lies about where the user
went. `splitPointsIntoSegments` in
[`segments.ts`](../src/features/gpsRecorder/segments.ts) splits on two signals:
the recorder's own `seg` ordinal, which it bumps on every start, and a `ts` gap
over the configured threshold.

The two are not the same kind of claim. `seg` is a fact about the recording, so it
always splits; the gap is a display preference — a long stop inside one segment
becomes a break because a straight line across it would be a lie — so `splitGapS`
can turn it off.

**Segments are derived, never stored.** `points` stays flat because the merge is
by `seq`, and a cold reload refetches the whole track anyway — but the ordinals
and timestamps still carry the breaks, so the same split falls out again with
nothing persisted, and changing the threshold re-splits an existing track for
free.

`selectRecorderSegments` memoizes the split, so the map and the save path share
one result per fix rather than recomputing per consumer.

**The statistics are folded, not recomputed.** Every figure is a sum or a property
of the newest point, so `foldRecorderStats` advances over the points that arrived
since the last read and `selectRecorderStats` carries the fold between fixes. The
alternative is what it replaced: a full pass per fix, which is quadratic over a
session and calls a haversine per pair per second — on an eight-hour ride at 1 Hz
that is 28 800 of them a second by the end. The fold checks that the track still
starts with what it has already counted, so a cleared or back-filled track (and a
changed `splitGapS`) is refolded from scratch instead of trusted.

## Deleting the track

`DELETE /track` is the one call that destroys data the recorder owns, so it is
gated behind a confirm and applied in this order: delete first, drop the local
copy only once the recorder acknowledges. A failed delete therefore leaves the
screen showing what the recorder still holds instead of pretending it is gone —
which is why `gpsRecorderClear` (the intent) and `gpsRecorderTrackCleared` (the
acknowledgement) are separate actions, with the reducer reacting only to the
latter.

It is **refused with `409 "recording"` while recording** — the recording thread
is appending as the request runs — so the button is disabled until the recording
is stopped, and that 409 maps to its own `recording` failure rather than being
mistaken for the setup-related one.

`seq` does **not** restart after a delete: the next fix carries on above the
highest id ever handed out, so a client asking `?since=` an old cursor is never
served different points under ids it already believes it has. That is exactly
why `generation` — the count of how many times the track has been thrown away —
is the *only* reliable signal that what we hold is gone, and why `syncHandler`
compares it on every status rather than watching `lastSeq`. (A `lastSeq` test
looks right and isn't: it drops to 0 on a clear, then climbs back past the old
cursor within a couple of fixes, so any sync after that would silently keep the
deleted points.) The same check covers a wipe from outside the app entirely —
Android's "clear storage", or a delete from another page.

## Handing the track to the rest of the app

**One route: it becomes the track viewer's track.** `handOverTrack` gives
`recorderSegmentsToFeatureCollection` to `dataViewerSetData`, after which the
recording is an ordinary loaded track — elevation, colorize, the elevation
chart, "more info", convert-to-drawing and every export target work on it
without knowing the recorder exists.

Two actions take that route, and the difference is ownership. **Save** copies:
the recording may still be running and the recorder keeps its own copy. **Finish**
moves: it suspends the recording, hands the track over, stores it, and then has
the recorder discard it.

### Storing the finished ride

Finishing deletes the recorder's copy, so before it does, the browser's copy has to
be worth trusting. That copy is **not the recorder's business**: it is
[`dataViewer/trackStore.ts`](../src/features/dataViewer/trackStore.ts), which
keeps whatever track the viewer holds — a file import, a conversion, a finished
ride alike. The recorder is only a caller.

**The order in `stopHandler` is the whole design**, and it is deliberately
pessimistic:

1. `POST /stop`, so the track is not moving under us.
2. **Catch up, and refuse to go on unless the page holds every fix the recorder
   does** — `cursor === lastSeq` after `applyStatus`. What this page holds is only
   what reached it, and a tab that was frozen in the background or whose stream
   died is routinely behind. Handing over a truncated ride and then deleting the
   complete one is the exact mistake this flow exists to prevent, so a short page
   ends it here (`errors.incomplete`) with nothing taken and nothing deleted.
3. Hand it to the track viewer.
4. `storeTrackDurably` — which requests `navigator.storage.persist()` — and **stop
   here unless it answers `durable`**. `evictable` means the browser may reclaim
   the copy under storage pressure; `unreadable` means it was refused because it
   would not have parsed back on read, which is checked on write precisely so a
   caller cannot believe it holds something already lost. Either way the recording
   stays where it is and a toast says which (`errors.notPersisted` /
   `errors.notStored`), with the track still on screen to export.
5. Only now `DELETE /track`.

The store writes on `dataViewerSetData` anyway, so step 4 is the same write —
awaited, reading the answer, and asking for persistence, because what follows it
cannot be undone. `storeTrack` skips a re-write of the object it stored last, so
the two paths cost one write.

**Clearing the map leaves the recording alone.** The points here are a live view of
what the recorder owns, not something the user put on the map — and dropping them
would only flicker, since the next status event refetches the whole track from
`since=0`. Only `gpsRecorderTrackCleared`, once the recorder has acknowledged a
delete, empties them.

Once finished, the ride belongs to the track viewer: **the recorder's trash only
ever deletes the recorder's own copy**, and deleting the track in the viewer is
what throws the ride away.

The feature therefore has **no `Exportable` and no `convertToDrawing` variant of
its own**. Both were duplicates of machinery the saved track already gets, and
keeping them meant a second, parallel GeoJSON encoder that could drift from the
one the importers produce.

Saving asks the same replace-or-append question a file import does, through the
shared `useDataMergeMode` hook — so however geodata reaches the viewer, the
question, its wording and its defaults are identical.

`trackGeojson.ts` emits **one `Feature<LineString>` per segment**, not a single
`MultiLineString`. The colorizers require a per-point array exactly as long as
the line's own coordinates (`readNumericArray`), so the nested arrays a Multi
geometry carries would silently make every value-based colorize mode
unavailable. The per-point series use togeojson's names — `times`, `speeds`,
`courses`, `accuracies` — because that is the shape an imported GPX arrives in:
`gpxFromGeojson` reads exactly those back out into `<time>` and the trackpoint
extensions, so a recording exports at the same fidelity as a preserved raw GPX.
`accuracy` has no GPX-native home (`<hdop>` is a dimensionless dilution of
precision, not metres), so it rides in `CUSTOM_POINT_PROPS` as a plain
`<accuracy>` extension, which our own reader gets back.

The viewer's track is not in `persistence.ts` — that carries only
`trackViewerSettings` — but it is not lost on a reload either:
[`dataViewer/trackStore.ts`](../src/features/dataViewer/trackStore.ts) keeps it
in IndexedDB, which is what makes Finish's delete defensible in the first place.
See "Storing the finished ride" above.

## Settings

`gpsRecorderSettings` is a persisted settings slice, split by who acts on each
value — which is also how the modal presents it:

- **`RecorderConfig`** (`intervalMs`, `minDistanceM`, `maxAccuracyM`,
  `priority`, `source`) travels with `POST /start` and decides what is recorded
  at all. Changing it cannot affect a recording already running.
- **The rest** (`splitGapS`, `feedLocation`, `keepScreenAwake`) never leaves the
  browser.

`source` picks the provider, and this app defaults it to `gps` where the recorder
itself defaults to `fused`. The fused position is the better one — GNSS blended
with wifi, cell and the phone's sensors — but its altitude is modelled rather
than measured per fix and repeats verbatim for seconds at a time, which is a flat
tread and a sharp riser in every profile drawn from it. A recording here is kept
for its elevation as much as its line, so the receiver wins the default and
`priority`, which only the fused provider has modes for, is disabled in the modal
under it.

### Who supplies the position

While recording, the recorder is the app's location provider:
`useRecorderLocationFeed` publishes each fix with `setLocation`, so the map's own
marker — dot, accuracy circle, heading beam (`brg`), fading as the fix ages —
draws the recording. The recorder's map layer therefore draws only the track.

**Only one source runs at a time.** The browser's watch asks for continuous high
accuracy, and Android merges concurrent requests at the highest rate anyone asked
for — so leaving it running alongside would quietly cancel whatever the
recording's `intervalMs`/`priority` was configured to save, and would need the
browser's own location permission on top of the recorder's. The feed claims the
source with `locationSetExternalSource(true)`, and `locateProcessor` runs the
watch only while `locate && !externalSource`. It reconciles against that pair
rather than reacting to the toggle, which is what makes the handover automatic:
the watch starts by itself when a recording ends.

**The claim waits for a fix**, though — `feedLocation && recording && latest`.
Taking the source at the moment Record is pressed would stop the browser's watch
while the recorder still has nothing to say, leaving the marker on the last
position anyone reported until the first fix arrives, which on a cold GNSS start
is a while. So the browser feeds the marker across the warm-up and the recorder
takes over the moment it can.

**The feed never turns locating on and never moves the map.** The locate button
is how the user asks to be shown and followed; starting a recording is a
different request, and answering it by grabbing the map would fight a user who
had panned somewhere deliberately. Following, when it is asked for, is
`followLocationProcessor`: it reacts to `setLocation` rather than living inside
the browser watch, so a recorder-fed fix moves the map exactly as a browser one
does.

**A pause releases the source.** No fixes are coming, so holding it would pin the
marker to wherever the last one was taken while the browser's watch stayed
blocked from saying otherwise. Releasing hands back mid-pause and reclaims on
resume.

Where the recording has *reached* is a separate claim from where the user is, so
`GpsRecorderResult` marks the newest fix as the track's head regardless of
locating — and the track and its head open the tool when clicked, as a loaded
track opens the import tool.

`feedLocation` is the escape hatch, and it is named after what the user sees: it
decides what answers **Locate me** while recording. Off, the browser is always the
source, which follows a sparse recording more smoothly at the cost of the second
watch. The feed
lives with the tool rather than with the map layer, because fixes reach the page
only while the tool holds the stream open.

## Remaining work

The stage-2 list — a role of its own, an APK landing page, styling the live
track like a displayed GPX track, and unflagging the tool — is in
[`TODO.md`](../TODO.md).

`src/static/llms.txt` documents the tool under **GPS recorder**, as user-visible
behavior now that only the platform gates it. Keep it in step with the toolbar —
it names each button and what Finish does with the track.
