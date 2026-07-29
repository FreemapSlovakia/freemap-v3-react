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
| `GET /status` | `{ recording, count, lastSeq, version: { code, name }, permissions: { fine, background, notifications }, batteryExempt, oem: { vendor, needed, acknowledged }, canRecord, setupComplete, port }` |
| `POST /start` | begin recording |
| `POST /stop` | end recording |
| `GET /track?since=<seq>` | `{ fields: [...], points: [[...], ...] }` — everything **above** the cursor (`since` is exclusive) |
| `DELETE /track` | discard the whole track |
| `GET /stream` | SSE; `id:` is the point's `seq`, `data:` one bare row (or a batch of them) |

**Points travel columnar**, not as objects: a row of numbers per fix, ordered by
the `fields` header — `["seq","ts","lat","lon","alt","acc","spd","brg"]` as of
versionCode 2. `ts` is epoch milliseconds; `seq` is the recorder-assigned
monotonic id that doubles as both the `/track?since=` cursor and the SSE event
id. `decodePoints` reads rows *by the declared column order*, so a recorder that
reorders or adds columns costs nothing here.

`/stream` sends bare rows with **no `fields` header**, so the column order comes
from the last `/track` page (`DEFAULT_POINT_FIELDS` covers a stream somehow
opened before any page was read). Since `syncHandler` always reads a page before
attaching the stream, the order is known by then.

Two flags decide readiness, and they are not the same thing: **`canRecord`** is
the recorder's own verdict and the only gate that blocks a start;
**`setupComplete`** covers recommended-but-optional steps — a vendor autostart
or battery policy (`oem`), say — and belongs in a warning, not a refusal.

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
- **The first call must come from a real user gesture**, so the permission
  prompt lands at a moment the user understands. The Start button dispatches
  straight from `onClick`; nothing auto-connects on mount.

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

`syncHandler` runs on open, on resume, and at the end of the start flow:

1. `GET /track?since=<cursor>`, merge, update the cursor.
2. Attach `/stream` — only if not already attached, so a resume never drops a
   working stream. **Reconnection is the browser's job** (`Last-Event-ID`); the
   stream module reports an interruption and otherwise stays out of the way.
3. `visibilitychange` back to `visible` re-runs step 1 before the stream is
   trusted again: a backgrounded page is frozen, so fixes recorded meanwhile
   arrive only this way. The listener's lifetime is tied to the stream's, in
   [`stream.ts`](../src/features/gpsRecorder/stream.ts).

Catch-up and the stream overlap by design, so batches arrive duplicated and
briefly out of order. `mergePoints` in the reducer merges by `seq` — appending
when the batch simply follows the track, and filling gaps below the cursor
otherwise.

**The cursor is not persisted.** `statePersistingMiddleware` re-serializes the
whole persisted subset on every action, so a persisted cursor would cost a full
`JSON.stringify` per incoming fix. A cold start holds no points and refetches
the track from `since=0` regardless — the recorder owns it.

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

Both routes copy; neither stops the recording or touches the recorder's data.

- **Convert to drawing** — `convertToDrawing({ type: 'gps-recorder', tolerance })`.
  Unlike the track viewer's equivalent there is no `trackViewerDelete`
  counterpart, because the recording continues and the recorder remains the
  owner. The simplify prompt is offered (a 1 Hz recording is dense) but carries
  no data-loss warning, since nothing is lost.
- **Export** — the `gpsRecorder` `Exportable`, emitting one line plus a Point
  per fix (time, altitude, accuracy, speed, bearing) for a data export.
  `elevationCapabilities` marks it `recorded`: fixes may carry GPS altitude.

`trackGeojson.ts` adapts the points to the `Feature<LineString>` (with
`coordTimes` and `coordinateProperties`) that the colorizers, the elevation
chart and the exporters all consume — the same shape the tracking feature uses.

## Stage 1 vs. stage 2

Stage 1 (built) is a viability proof: Start/Stop/Reconnect/Delete, convert to
drawing, export, recording state and point count, a plain red polyline that
grows live, and raw English error text. The stage-2 list — elapsed time,
distance, accuracy, GPX-consistent styling, designed error states, the
permission/battery banner, the `versionCode` update prompt, and saving the
finished track into the existing track handling — is in [`TODO.md`](../TODO.md).

`src/static/llms.txt` deliberately does not mention the tool: it reaches only
`layerPreview` holders on one platform, so it is not user-visible behavior yet.
That changes when the role gate comes off.
