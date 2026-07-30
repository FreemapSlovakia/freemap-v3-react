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

| | |
| --- | --- |
| `GET /status` | `{ recording, paused?, config?, count, lastSeq, generation, fields?, version: { code, name }, permissions: { fine, background, notifications }, batteryExempt, oem: { vendor, needed, acknowledged }, canRecord, setupComplete, port }` |
| `POST /start` | begin recording; body is the `RecorderConfig` |
| `POST /stop` | end recording |
| `POST /pause` / `/resume` | suspend and continue a session |
| `GET /track?since=<seq>` | `{ fields: [...], points: [[...], ...] }` — everything **above** the cursor (`since` is exclusive) |
| `DELETE /track` | discard the whole track |
| `GET /stream` | SSE; an unnamed event is a point (`id:` its `seq`, `data:` one bare row or a batch), a named `status` event is the whole status object |

**Points travel columnar**, not as objects: a row per fix, ordered by the
`fields` header — as of versionCode 7 that is `["seq","ts","lat","lon","alt",
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
order comes from the status frame the stream opens with, from `/status`, or from
the last `/track` page — in that order of freshness. `DEFAULT_POINT_FIELDS` is
the last resort, for a stream attached before any of the three has been read; it
names all fifteen columns, which is safe against an older recorder too, since a
name mapping past the end of a row reads as absent.

**The stream carries state, not just points.** A named `status` event arrives on
connect and thereafter whenever the recorder's state genuinely changed — start,
stop, pause, resume, `DELETE /track`, and a permission or battery change the next
time the recorder's own screen resumes. `stream.ts` reconciles it through the
same `applyStatus` a polled status goes through, so a cleared `generation` or a
stopped recording lands the moment it happens.

That makes the `/status` poll a fallback rather than the mechanism:
`isRecorderStatusPushed()` is true once a status frame has arrived on an open
stream, and `POLL_INTERVAL_MS` in `GpsRecorderMenu` stands down to a no-op while
it is. A recorder that pushes nothing keeps the timer, and the catch-up on
`visibilitychange` runs either way — a frozen page runs neither timer nor stream.

Support is *learned*, not inferred from a version: a named event is invisible to
a client that doesn't listen for it, so a recorder without them simply never sets
the flag.

**A pause is not a stop, and `recording` does not say so.** The recorder keeps
`recording` true while paused — the session and its foreground service are still
up — and reports `paused` alongside it. The three transport states are therefore
`!recording`, `recording && paused` and `recording && !paused`, which is what the
buttons and the readout label are driven off. The store's own `paused` takes the
recorder's answer whenever there is one, and only falls back to the local flag on
a recorder that fakes a pause with a stop.

Two flags decide readiness, and they are not the same thing: **`canRecord`** is
the recorder's own verdict and the only gate that blocks a start;
**`setupComplete`** covers recommended-but-optional steps — a vendor autostart
or battery policy (`oem`), say — and belongs in a warning, not a refusal.
`GpsRecorderNotices` renders exactly that split: `canRecord` failures are the
error panel, `setupComplete` ones the warning panel above the map.

### Feature detection, not version gates

`paused`, `config`, `POST /pause`, `POST /resume` and the `seg` column ship in
versionCode 6, and `fields` in `/status` plus the `status` stream event in 7 —
but the minimum this app accepts is 4, so an installed recorder may have none of
them, and every one is detected rather than inferred from a version. That also
means a recorder can gain them in any order without this app being changed:

- **`POST /pause` / `/resume`** fall back to `/stop` and `/start` on a `404`,
  which `classifyHttpFailure` maps to its own `unsupported` failure. The only
  difference the user sees is a GPS re-acquisition on resume — the segment break
  is tracked here regardless.
- **The `POST /start` config body** is sent unconditionally; a recorder that
  ignores it reports no `config` in `/status`, and *that absence* is the feature
  detection. There is no version gate, because a recorder could gain the fields
  in any order. The settings modal says so, and `maxAccuracyM` is then applied
  client-side instead — to the geometry, the statistics *and* the saved track
  alike, so nothing ends up filtered on screen but present in the file.
- **`seg`** is decoded when the `fields` header declares it and null otherwise,
  which is why `splitPointsIntoSegments` splits on a time gap and on locally
  recorded breaks too.
- **The `status` stream event** sets `isRecorderStatusPushed()` on arrival, and
  that flag is what silences the poll. A recorder without the event never sets
  it, so the poll simply keeps running as it always did.
- **`fields` in `/status`** is used when it is there and skipped when it is not;
  the `/track` page's own header covers the older recorder.

### CORS

From versionCode 3 the recorder reflects the caller's `Origin` when it is on its
allowlist — `https://freemap.sk`, `https://www.freemap.sk`,
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
  timer, and only offers a gestured "Connect" button (in `GpsRecorderNotices`)
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

## Track sync

`syncHandler` runs when the tool mounts, every 15 s while it is open and the
page visible, on `visibilitychange` back to `visible`, after a stream the
browser gave up on, and at the end of the start flow. All of that lifetime lives
in `GpsRecorderMenu`'s effect rather than in the stream module, so it keeps
running when there is no stream — which is exactly when it matters.

1. `GET /status` — always, because it is what carries `recording`, `paused`,
   `generation` and the setup flags.
2. `GET /track?since=<cursor>` **only when the recorder says there is something
   to fetch**: `lastSeq > cursor`, or nothing is held here yet. One comparison
   against a status that had to be read anyway, which is what makes a 15-second
   poll cheap enough to leave running.
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

A recording that was paused, stopped and restarted, or simply left alone for an
hour is one track with breaks in it — drawing it as a single line lies about
where the user went. `splitPointsIntoSegments` in
[`segments.ts`](../src/features/gpsRecorder/segments.ts) splits on any of three
signals: the recorder's own `seg` ordinal, a `breaks` entry this app recorded
when *it* paused or stopped, and a `ts` gap over the configured threshold.

**Segments are derived, never stored.** `points` stays flat because the merge is
by `seq`, and a cold reload refetches the whole track anyway — but the
timestamps still carry the gaps, so the same split falls out again with nothing
persisted, and changing the threshold re-splits an existing track for free. The
`breaks` list exists only for the case the other two rules cannot see: a pause
shorter than the gap threshold, on a recorder with no `seg`. It records the
recorder's `lastSeq` rather than this page's cursor, because a fix taken while
the page was frozen has not arrived here yet and breaking after the cursor would
cut the track mid-segment.

`selectRecorderSegments` memoizes filter-then-split, so the whole chain — map,
statistics, save — recomputes once per fix rather than once per consumer.

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

**One route: save it to the track viewer.** `saveHandler` hands
`recorderSegmentsToFeatureCollection` to `trackViewerSetData`, after which the
recording is an ordinary loaded track — elevation, colorize, the elevation
chart, "more info", convert-to-drawing and every export target work on it
without knowing the recorder exists. It is a copy: the recording may still be
running, and the recorder stays the owner of its data until the user deletes it
explicitly.

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
- **The rest** (`splitGapS`, `showAccuracyCircle`, `followPosition`,
  `keepScreenAwake`) never leaves the browser.

`followPosition` dispatches `mapRefocus({ …, gpsTracked: true })` from the
recorder's own newest fix rather than starting the browser's geolocation — one
GPS consumer instead of two, and grabbing the map ends the following through the
same path the locate button uses.

## Remaining work

The stage-2 list — a role of its own, an APK landing page, styling the live
track like a displayed GPX track, and unflagging the tool — is in
[`TODO.md`](../TODO.md).

`src/static/llms.txt` deliberately does not mention the tool: it reaches only
`layerPreview` holders on one platform, so it is not user-visible behavior yet.
That changes when the role gate comes off.
