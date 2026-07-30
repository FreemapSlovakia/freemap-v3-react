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
- **Role** — the `layerPreview` role, so the feature can ship to production
  without being on for everyone. (There is no better-fitting role yet.) This one
  is a *selector*, because logging in or out changes it mid-session.

`ToolDefinition.available` therefore takes a `(state) => boolean` predicate
rather than a flag. `unavailableToolsSelector` folds the whole registry into the
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
`fields` header — as of versionCode 8 that is `["seq","ts","lat","lon","alt",
"acc","spd","brg","altMsl","altAcc","spdAcc","brgAcc","sat","src","seg"]`. `ts`
is epoch milliseconds; `seq` is the recorder-assigned monotonic id that doubles
as both the `/track?since=` cursor and the SSE event id. `decodePoints` reads
rows *by the declared column order*, so a recorder that reorders or adds columns
costs nothing here.

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

**So nothing polls `/status`.** The tool syncs when it mounts, when the page
returns to the foreground — a frozen page hears no events, so that catch-up is
what fills the gap — and when `stream.ts` revives a stream the browser gave up
on. A timer would only ask again for what the stream already said.

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
where this app says everything else of the kind: a `canRecord` failure is a
`danger` toast, an incomplete `setupComplete` a `warning` one listing what is
outstanding. Each carries the one action that resolves it, and each dismisses
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
3. `waitForStatus` then re-polls with a widening backoff — the service needs a
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
- **`unreachable`** — offer install/download.

`needs-foreground` is the fourth, and it is handled before the user sees it: the
start flow retries through the intent by itself, and the panel only reports it if
that did not end in a recording either.

## Track sync

`syncHandler` runs when the tool mounts, on `visibilitychange` back to `visible`,
after a stream the browser gave up on, and at the end of the start flow — never on
a timer, because the stream says when something changed. Its lifetime lives in
`GpsRecorderMenu`'s effect rather than in the stream module, so it keeps running
when there is no stream, which is exactly when it matters.

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

There is no Reconnect button: the above covers every case one used to.

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
`recorderSegmentsToFeatureCollection` to `trackViewerSetData`, after which the
recording is an ordinary loaded track — elevation, colorize, the elevation
chart, "more info", convert-to-drawing and every export target work on it
without knowing the recorder exists.

Two actions take that route, and the difference is ownership. **Save** copies:
the recording may still be running and the recorder keeps its own copy. **Finish**
moves: it suspends the recording, hands the track over, stores it, and then has
the recorder discard it.

### Storing the finished ride

Finishing deletes the recorder's copy, so before it does, the browser's copy has
to be worth trusting. `trackStore.ts` is that copy: a **single entry** in its own
`idb-keyval` database, validated on read like the my-maps working copy, holding
the geojson and when it was taken. One entry, because finishing means "take this
ride off the phone and give it to me" — a thing the user then exports, uploads or
discards before the next one. An archive of every ride needs a list to manage it
and a rule for reclaiming space, neither of which is worth inventing yet.

**The order in `stopHandler` is the whole design**, and it is deliberately
pessimistic:

1. `POST /stop`, so the track is not moving under us.
2. Hand it to the track viewer.
3. `navigator.storage.persist()` — and **stop here if it refuses**. Without that
   promise the browser may evict the copy under storage pressure, and deleting
   the recorder's copy would leave the ride nowhere. The recording stays where it
   is and a toast says why (`errors.notPersisted`), with the track still on screen
   to export.
4. Write the entry.
5. Only now `DELETE /track`.

**A reload is answered by the history entry, not by storage.** `trackStore`
`replaceState`s a `rec: true` flag onto the current entry when it stores the track
and takes it off when it deletes it; `urlProcessor` carries the flag onto the
entries it writes afterwards, and `handleLocationChange` dispatches
`gpsRecorderRestoreSaved` when it sees it. So reloading the page you were looking
at brings the ride back, while a fresh visit — or a shared link — is not ambushed
by a track from a previous session. The restore is a no-op when something else
already owns the viewer (a map named in the URL, a shared track), and it clears
the flag when the entry outlived the copy.

The trash button owns **both** copies: the recorder's, and the one held here. After
a finish the recorder has nothing left, so this is the only way to say "I don't
want this ride" — and its confirmation says so.

The feature therefore has **no `Exportable` and no `convertToDrawing` variant of
its own**. Both were duplicates of machinery the saved track already gets, and
keeping them meant a second, parallel GeoJSON encoder that could drift from the
one the importers produce.

Saving asks the same replace-or-append question a file import does, through the
shared `useTrackMergeMode` hook — so however geodata reaches the viewer, the
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

Note that **the track viewer's track is not persisted** — `persistence.ts`
carries only `trackViewerSettings`. A saved recording therefore dies on reload,
which is tolerable precisely because Stop is not destructive: the recorder is
the durable store and the viewer is the working copy. That is also why there is
no IndexedDB cache here; it only becomes necessary if something starts deleting
the recorder's copy automatically.

## Settings

`gpsRecorderSettings` is a persisted settings slice, split by who acts on each
value — which is also how the modal presents it:

- **`RecorderConfig`** (`intervalMs`, `minDistanceM`, `maxAccuracyM`,
  `priority`) travels with `POST /start` and decides what is recorded at all.
  Changing it cannot affect a recording already running.
- **The rest** (`splitGapS`, `feedLocation`, `keepScreenAwake`) never leaves the
  browser.

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

`feedLocation` is the escape hatch: off, the browser is always the source, which
tracks a sparse recording more smoothly at the cost of the second watch. The feed
lives with the tool rather than with the map layer, because fixes reach the page
only while the tool holds the stream open.

## Remaining work

The stage-2 list — a role of its own, an APK landing page, styling the live
track like a displayed GPX track, and unflagging the tool — is in
[`TODO.md`](../TODO.md).

`src/static/llms.txt` deliberately does not mention the tool: it reaches only
`layerPreview` holders on one platform, so it is not user-visible behavior yet.
That changes when the role gate comes off.
