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
array would. `#tools=gps-recorder` can name the tool on a device or account that
can't use it, so `locationChangeHandler` filters the URL's tools through the gate
— an unavailable tool brings no toolbar, and nothing would be left to close it
again — and `Main.tsx` re-checks it independently for a tool that becomes
unavailable while open.

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
while a mid-track switch between the two sources would invent one. The readout's
elevation is a figure the user reads off a map rather than a sum, so it takes
`altMsl ?? alt` like the export does.

**`sat` is best-effort and often absent.** A fused fix carries no satellite count
of its own, so the recorder reads one off the GNSS receiver running alongside and
matches it to the fix by time; it is null whenever the receiver has not reported
recently enough to speak for that fix — a network fix, or one taken while the
receiver was duty-cycled off between widely spaced fixes. So the readout's
satellite row is dropped rather than shown as zero.

The list is **append-only**, and a reader is meant to ignore what it doesn't
know — so a cell is typed as `unknown` and read as the number its column should
hold, or as absent. Typing cells as numbers is what breaks on the day a column
like `src` (a provider name) is appended: zod then rejects the whole page, every
point of it, and the live view stops on a column nothing here even reads.

`/stream` sends bare rows with **no `fields` header** of their own, so the column
order comes from the `status` frame the stream opens with — which the contract
puts before any point on every connection, so the order is always known by the
first row. The stream that decodes the rows owns the order: a sync settling late
cannot install a stale one over the live stream's own. A sync only ever *seeds*
it (`seedRecorderFields`), and only while no stream has named one — a connect
frame this app could not read would otherwise leave every row undecodable, under
a toolbar that reads `Live`, with no sync armed to repair it.

**The stream carries state, not just points.** A named `status` event arrives on
connect and thereafter whenever the recorder's state genuinely changed — start,
stop, `DELETE /track`, and a permission or battery change the next time the
recorder's own screen resumes. `connection.ts` reconciles it through the
same `applyStatus` a polled status goes through, so a cleared `generation` or a
stopped recording lands the moment it happens.

**So nothing polls `/status`.** A sync runs at boot, when the page returns to the
foreground — a frozen page hears no events, so that catch-up is what fills the gap
— when the tool is opened, and when a failed connection's retry comes due. A timer
would only ask again for what the stream already said.

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
- **Every request carries a deadline on the *answer*** (`recorderClient.ts`: 3 s
  for `/status`, 8 s for a transport command, 20 s for a track, which the
  recorder composes whole before sending a byte of it). Nothing here crosses a
  network, so a recorder that has not begun answering is not slow but gone — and
  a fetch the browser froze along with the page can otherwise stay pending for
  the rest of that page's life, with every later sync coalescing onto it and the
  live view reading as `connecting` until a reload. The clock is disarmed the
  moment a response arrives, so it can never cut a body short.
- **A body that has begun arriving is given a stall deadline instead**
  (`BODY_STALL_MS`, 10 s), restarted on every chunk. How long a track takes
  belongs to the length of the ride, not to the recorder's health: a fixed
  transfer budget fails at the same point on every retry, and since nothing was
  merged each retry starts from `since=0` again — a download that can never
  finish, reported as a recorder that is not there. What is not survivable is a
  body that *stopped* coming, so that is what is measured.
- An expired deadline of either kind is reported as `unreachable`: a Local
  Network Access block is refused at once, so it can never be what ran out the
  clock.
- **The stream carries one too** (`STREAM_OPEN_MS`, 5 s), because `EventSource`
  has none of its own. A socket the kernel accepted for a recorder that never got
  to answer on it reports neither open nor error, and a handle in hand is what
  disarms the backoff — so a silent stream would park the connection on
  `connecting` until the page went away. It is dropped like one that failed.
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
  is both wrong and no help. A recorder killed *mid-body* counts as silence too:
  the connection drops and the body read reports a `TypeError`, told apart from
  the `SyntaxError` of an answer that arrived whole and made no sense (which is
  `protocol`, and says the recorder is there and talking).
  The toast leads with **Open the recorder**
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

### One owner, reconciling a desired state

[`connectionCore.ts`](../src/features/gpsRecorder/connectionCore.ts) holds the
stream, the sync in flight, the retry and the follow flag, and nothing else holds
any of them. Everything that could change the answer — the page coming and going,
the tool opening or closing, a stream that broke, a sync that failed, a retry
coming due — calls its **`reconcile`**, which compares what should be connected
against what is and fixes the difference. So there is one place that decides
whether to connect, one backoff, and one answer for what the toolbar says.

The core is a state machine over injected effects — storage, the stream, timers,
the dispatches — with no browser globals of its own.
[`connection.ts`](../src/features/gpsRecorder/connection.ts) is the shell that
supplies the real `EventSource`, `localStorage`, store and point batching; the
fake-timer tests in
[`connectionCore.test.ts`](../src/features/gpsRecorder/connectionCore.test.ts)
supply fakes and drive the clock. Every retry/give-up/coalescing rule below is
pinned by a test there — change the rule, change its test.

**Nothing else may hold a handle, a timer or a flag of its own.** Each one is a
second opinion on whether there is a connection, and separate opinions drift: a
stream believed open, a retry believed pending and a sync believed in flight are
three answers to one question, and only one of them can be what the toolbar shows.

**Wanted** is: the platform supports the recorder, the page is visible, and either
the follow flag is set or the tool is open. `applyStatus` sets that flag from the
recorder's own answer — recording, or holding points — which is why *every* status
goes through it and none is dispatched raw: a Finish or a Delete that stored its
status directly would leave the page following a recorder it had just emptied, this
session and on the next load. Changing the flag calls the reconcile itself, being
an input to the desired state like any other — a finished ride ends the following
this way, and the stream then closes with the tool (which stays open through the
finish: `openTool('import-file')` only adds a panel). It lives in storage rather
than the store, because the question outlives the page: a recording carries on in
the phone's own app while the browser is closed, and on the next load nothing else
would know to go looking. Through the app's own `local-storage-fallback`, so a
browser refusing `localStorage` still follows the ride, and written on every set
rather than only on a change, so a value another tab cleared is repaired by the
next status.

**Hidden means disconnected**, which is the rule that removes a whole class of
trouble. A page that is hidden may be frozen the next moment, and an `EventSource`
frozen with it comes back reporting `OPEN` while nothing arrives on it — loopback
delivers no reset for the browser to notice, so it believes in the socket for tens
of seconds, then replays every fix above its last event id in one burst: a
screenful of dispatches and a page that locks up. Until then the live view is dead
while reading as `Live`. So going away closes the stream *and aborts the sync in
flight*; coming back opens a fresh one, which carries no `Last-Event-ID` and
therefore replays nothing, and the `/track?since=` catch-up fills the gap. Nothing
is lost either way: the recorder owns the track.

Aborting on the way out is also what keeps a returning page from waiting on a
request that was frozen with it — the failure such a request eventually reports
describes the page being away, not the recorder being gone, and on a quiet sync
that would read as a recorder to stop following.

**Concurrent asks share one run.** Returning to the page with the tool open raises
both the reconcile's sync and the menu's own, which on a stale cursor would be two
full `/track?since=0` downloads for the same answer, so `runRecorderSync` coalesces
onto the sync already in flight. A joiner's `quiet` is folded into it — one caller
who asked out loud is enough for a failure to be reported out loud. The exception
is the caller a run already in flight cannot answer, which asks for `restart` —
abandoning the run and beginning one of its own, with the abandoned run's loudness
folded in. Every command flow is one — start, pause and clear all need a status
newer than the `POST` they just made, and the start flow's return from the launch
intent raises a `visibilitychange`, so there is routinely a run in flight that
predates the recording it is meant to report. Routing the command flows through
the run also means a reconcile they provoke mid-flow joins them instead of racing
them.

**An abandoned run's caller is answered by the replacement** — in loudness, in
when it is told, and in *what* it is told. A restart is not a failure and must
not read as one: the replacement's status is the newer of the two, so it answers
the question at least as well, and a caller that acts on the answer (the
take-the-track flow) would otherwise give up whenever a doorbell it rang itself
landed mid-sync. Awaiting a sync therefore yields the outcome it settled on
whoever ended up settling it, and `null` only for a run nothing ever settled —
a teardown, which is the page going away rather than the recorder saying
anything.

**A pushed status is a doorbell, not a payload.** The action carries nothing and
its handler re-reads `/status`, rather than applying the pushed frame: a frame is
composed at the recorder's own moment and can be older than what a sync in flight
has already read, and applying it blind would move `recording`, `count` and
`lastSeq` backwards with nothing to correct them until the next push. It takes
the same route through `runRecorderSync` — aborted by a teardown like anything
else, quiet about failures nobody asked for — and it is the other `restart`
caller: a run already in flight read its status before the push arrived, and
joining it would drop the very change — a stop, a clear — the push exists to
deliver. The re-read costs one loopback round trip, and pushes are rare, discrete
events.

**A frame rings only if it says something this page does not know.** One rule
for every frame, the one a connection opens with included: the frame is compared
against the status held here on everything but `count` and `lastSeq`, which move
on with every fix and are news the stream is already delivering. Ringing is not
free — it re-reads `/status` and restarts the run in flight, so a frame with
nothing to say costs a round trip and can abandon a catch-up that would then
start over from the beginning.

The connect frame is the one that usually says nothing: the sync that attached
the stream read the same status moments earlier. *Usually*, though — that sync
catches up **before** it attaches anything, so a stop or a clear during a
download that took seconds arrives in the connect frame first, with nothing else
coming to notice it, because a stream in hand is what disarms the retries. What
the connect frame is always for is the other two things it carries: the column
order, and the news that this stream works. A frame that does not parse rings —
it could be saying anything — and still counts as that news.

The comparison is made on the serialized status rather than field by field: a
field forgotten in a hand-written comparison swallows a doorbell, while a field
order that happens to differ only rings one that had nothing to say.

Syncs nobody asked for are **quiet**, with one exception: a live view that was
working and stopped. A recorder killed or uninstalled while the page was away must
not greet the user with an error they did nothing to provoke — but a ride whose
distance and clock have just stopped advancing is news, so a reconnect after a
stream that was carrying fixes reports out loud. Either way, whether it is the end
of following is decided by the retries below rather than by one failure.

**The connection does not belong to the toolbar.** `attachRecorderConnection` is
installed at boot next to the app's other attach helpers, and closing the tool only
asks for a reconcile — which, mid-recording, changes nothing, because the follow
flag still says there is something to follow.

Two more things follow the recording rather than the toolbar, and so live in
`GpsRecorderResult` — which `Results` mounts whenever there are fixes **or** a
recording in progress: the position feed (`useRecorderLocationFeed`) and the
screen wake lock (`useRecorderWakeLock`). The second half of that gate is the
wake lock's: it belongs to the ride, and a screen that blanks between pressing
Record and the first fix is the case it exists for. In the menu, closing it would hand "Locate
me" back to the browser's own GPS watch mid-ride, which is the second watch the
feed exists to avoid. What stays in the menu is what belongs to the tool: its
buttons.

**The toolbar follows the recording as well, collapsed.** `Main` mounts
`GpsRecorderMenu` outside the chain that renders the open tools, on the recorder
being open **or** a recording in progress, so a closed toolbar still leaves a
strip for as long as the phone is recording — the only thing on the screen that
says it is. The tool being open is then no longer what mounts the toolbar but
what gives it its controls: `ToolMenu` renders the strip — the tool's icon,
blinking red through the `iconClassName` the menu hands it, its name, and the
`stripChildren` readout — whenever its tool is closed, and turns the button into
one that opens it again. (Being merely put away by the user's collapse button
looks the same, but that state is the toolbar's own.)

Two consequences worth knowing. The sync that opening the tool raises is keyed on
the tool being open rather than on the component mounting, because a recording
mounts it on its own — and it is only the *loud ask* that lives in the menu.
Whether there should be a connection at all is the store's answer:
`gpsRecorderToolProcessor` watches `isToolOpen` and calls the reconcile, so a
tool opened or closed while the menu is unmounted (the map is in a pick mode, or
the Back button drops `tool=` from the hash) still reaches the connection. And
the failure and setup toasts live in their own
null-rendering `GpsRecorderNotices`, which `Main` mounts while there is anything
to announce — the tool, a recording, **or the failure itself**. The last part is
what keeps the announcer alive for the very failure it exists for: a recorder
that stops answering nulls the status, which unmounts the menu in the same
commit, so a hook living there would be destroyed before its toast ever showed.

A sync itself is three steps:

1. `GET /status` — always, because it is what carries `recording`, `generation`
   and the setup flags.
2. `GET /track?since=<cursor>` **only when the recorder says there is something
   to fetch**: `lastSeq > cursor`, or nothing is held here yet. One comparison
   against a status that had to be read anyway.
3. Report the outcome through the run's own `settle` — success, or a failure and
   whether waiting could fix it. Success attaches `/stream` if nothing is
   attached, so a resync never drops a working stream; failure goes to the
   backoff. The settle is bound to its run: one from a run that has been
   restarted or torn down is ignored, so an abandoned run can never attach a
   stream or arm a retry on the connection's behalf. A run that breaks *without*
   settling — a handler that threw outside its own `try` — is settled as a
   failure by the core, because an unsettled run arms nothing and is exactly
   where a chain would end silently.

Clearing the error is deliberately not gated on the run still being current: the
recorder answered, so a failure still on screen is describing something that is
no longer true. This is the one thing a self-abandoning run must still do —
`applyStatus` unfollowing an emptied recorder tears its own connection down, and
that is precisely when nothing else is coming to clear it.

**One backoff covers everything that can drop the connection.** Any error on the
stream drops the handle and starts the retry — deliberately not left to the
browser's own reconnection, which retries a dead loopback forever with the state
reading `connecting` and never gives up. A sync that failed feeds the same retry,
which matters more than it sounds: reviving through a sync that could not reach
the recorder either is exactly where a chain ends silently, with the connection
reading `idle` and nothing left that would ever ask again. Each attempt re-runs
the whole sync rather than just reopening the socket, because whatever killed the
stream may equally have stopped the recording or cleared the track — and the
catch-up is what notices.

The wait widens 1 s → 30 s over five attempts, and two things rewind it.

**A stream that keeps running** — proof has to be a *duration*, not an event.
Every instant a stream can reach is one a recorder dying immediately afterwards
also reaches: `onopen` fires on response headers, and the connect `status` frame
fires on the first thing the server writes, so rewinding on either lets a
recorder that accepts and then dies be retried at the shortest delay forever.
The frame therefore only marks the view live enough that losing it is worth
saying out loud; the rewind waits `STREAM_PROVEN_MS` (the longest delay) of the
stream still being there. A sync succeeding rewinds nothing at all — it proves
only `/status`, and rewinding on it held the wait at its first step whenever
`/stream` alone was broken.

**The wanted-configuration changing**, because a user opening the tool or a page
coming back is a fresh look: it deserves the fast delays rather than a widened
wait inherited from a configuration nobody is in any more, and it cancels the
pending wait so the look happens now rather than up to 30 s later.

**Giving up — unfollowing — has a budget of its own: a run of failures where
the recorder was the thing that failed, with nobody watching.** It is counted
rather than read off the retry ladder, because the ladder is spent by anything
that drops the connection: a recorder whose `/stream` will not stay up while
`/status` answers perfectly empties it in a couple of minutes, and one timeout
after that would otherwise end a ride the recorder is still recording. Delays
that ran out while syncs succeed mean the recorder is reachable and still
reporting a ride — the cadence just holds at 30 s until the recorder's own
status ends the following. **With the tool open it never gives up either**:
somebody is looking at a panel that would otherwise stay dead until it was
closed and opened again. And an ask this app never managed to make does not
count: a sync whose lazily loaded handler never claimed it (a hashed chunk a
deploy has moved) widens the wait and keeps asking, but must never cost a ride
that is still being recorded. Neither does a failure the recorder answered,
which takes both halves of the question and is what the sync reports as
`recorderFailed` beside `hopeless`: **when** it failed, since everything after
the status — the catch-up, a page this app could not read — went wrong with the
recorder demonstrably there; and **how**, since an error status or an
unreadable body is the recorder talking, and only silence — `unreachable`,
`lna-denied`, classified by `isSilentFailure` beside the failures themselves —
says it is not there. What remains — the recorder not answering, over and over,
tool closed — is the only thing that drops the follow flag. A configuration
change starts that budget over with the ladder, since a fresh look is entitled
to find out for itself. Two failures skip
the retries entirely, because waiting cannot fix them: `lna-denied` and
`outdated`, classified by `isHopelessFailure` next to it.

**A stream in hand disarms the backoff.** A `/status` that failed beside a working
stream says nothing about the live view — the stream is what carries the fixes —
so the attempts are not spent on a connection that is not broken. The stream's own
`onerror` is what drops it and starts the chain.

There is no Reconnect button: the above covers every case one would answer, and
the failure toast carries one for the case it doesn't.

**The connection state is derived, never assigned.** `connectionState()` reads the
handles — a catch-up downloading is `syncing`, an open stream is `live`, an attempt
under way (a sync in flight, or a stream not open yet) is `connecting`, the wait
before the next attempt is `reconnecting`, and nothing at all is `idle` — and every
transition publishes it. A
catch-up is *bracketed* by `whileCatchingUp` rather than announcing itself on the
way in, so no early return can leave the toolbar spinning on a wait that has
finished — which is otherwise a line of undo in every handler that catches up, and
one forgotten line away from a Record button that spins for good.

**Anything but `live` or `idle` is said with a spinner**, in both places the
toolbar has to say it: the readout's status dot becomes one, and the Record
button shows one over its own icon. The two settled states keep the dot —
green for a live view, grey for none — because they are states rather than
waits. The point is the numbers beside it: distance, duration and the rest stop
advancing whenever the live view is down, and a still green dot over frozen
figures reads as a recording that has merely stood still. The spinner does not
disable the transport; only a command the user gave (`pending`) does.

Catch-up and the stream overlap by design, so batches arrive duplicated and
briefly out of order. `mergePoints` in the reducer merges by `seq` — appending
when the batch simply follows the track, and filling gaps below the cursor
otherwise.

**Fixes that arrive together are dispatched together.** Every
`gpsRecorderAddPoints` costs a pass over the whole track — the merge, the segment
split, the polyline Leaflet reprojects, the statistics fold, and the elevation
profile when its chart is open — so one dispatch per SSE event is fine at a fix a
second and a visible stall when a burst arrives (a recorder that had been
buffering, a phone whose screen has just come back on). `connection.ts` therefore
collects incoming rows for 250 ms and dispatches the batch. Nothing is at risk in
the queue: those points have not been merged, so the cursor does not claim them
and the next sync fetches them again.

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
   does** — `cursor === lastSeq` after the sync. What this page holds is only
   what reached it, and a tab that was frozen in the background or whose stream
   died is routinely behind. Handing over a truncated ride and then deleting the
   complete one is the exact mistake this flow exists to prevent, so a short page
   ends it here (`errors.incomplete`) with nothing taken and nothing deleted. The
   catch-up goes **through `requestSync` with `restart`**, like pause and clear:
   the `POST /stop` above provokes a pushed status of its own, and that run must
   not be left racing this flow — its `/track` page would otherwise land after
   the delete, as fixes on an emptied track that no later sync clears (`count`
   is 0 by then, so nothing catches up, and the generation already matches).
   `requestSyncStrictly` is that sync, and it answers whether it worked: a run
   that failed — or one a teardown abandoned, which reports nothing at all —
   ends the flow where it stands, because everything below reads the status the
   sync left behind, and that may be the one this page already had. The `POST
   /stop` above rings a doorbell of its own, which routinely lands mid-sync and
   restarts it; that is not a failure and does not end the flow, because an
   abandoned run is answered by its replacement.
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

### The one thing drawn before the hand-over: the elevation profile

A ride's climb is worth watching while it is being ridden, so the elevation
chart takes `{ type: 'gps-recorder' }` as a target of its own, resolved by
[`resolveElevationChart.ts`](../src/features/gpsRecorder/resolveElevationChart.ts).
This is not a second route out of the feature: nothing leaves the recorder, and
once the ride is finished the profile is the track viewer's, whose own chart the
hand-over opens the way to.

`recorderSegmentsToProfileFeature` gives the chart **one `Feature<MultiLineString>`**
where the hand-over gives a feature per segment. The reason the exported form is
split — a colorizer needs a per-point array as long as the line's own
coordinates — does not apply to a chart that draws one profile, and the chart is
segment-aware in the way that matters: it breaks the line at each pause, resets
the climb baseline, and counts no distance across it.

The altitude is shown as recorded (`keepRecorded`, credited `recorded`): nothing
is sampled, densified or smoothed. Those passes correct a terrain model, and this
is a measurement — which is also why `source` defaults to the GNSS receiver (see
*Settings*).

The button appears once two fixes carry an altitude (`selectRecorderHasProfile`);
below that there is a chart of gaps rather than a profile. A recording that has
none *yet* resolves as `pending`, so the chart stays aimed and fills in when the
altitudes start arriving — and so does a recorder that hasn't answered yet, since
a reload restores this target from the URL while the whole track is still being
refetched. `gone` is only for a track the recorder has reported on and that holds
nothing, which covers a delete and the hand-over alike, and for a platform the
recorder cannot run on. Closing the tool closes the chart, as it
does for every other target — the strip a recording leaves behind carries the
readout, not the controls.

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
