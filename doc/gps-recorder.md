# GPS recorder integration

How the PWA drives the standalone **Freemap GPS recorder** — a native Android
app (Kotlin, self-hosted APK) that records a track to its own storage and
exposes a loopback HTTP API. The recorder owns the track; the PWA is a viewer
and remote control that holds no authoritative copy and never asks the recorder
to discard points.

Feature folder: `src/features/gpsRecorder/`.

## Availability

Android + Chromium only, and behind a stage-1 flag. Both gates are collapsed
into the single `gpsRecorderAvailable` constant in
[`support.ts`](../src/features/gpsRecorder/support.ts), evaluated once at load
because neither can change within a page lifetime:

- **Platform** — `navigator.userAgentData` exists only in Chromium, so its
  presence plus `mobile` and `platform === 'Android'` covers both halves.
- **Flag** — `?gps-recorder=1` turns the tool on and is remembered in
  `localStorage` under `fm.gpsRecorder.enabled`; `?gps-recorder=0` turns it off.
  The query string is used rather than the hash because the hash belongs to the
  URL processor.

`ToolDefinition.available` carries the gate into the tool registry, so the main
menu hides the entry; `Main.tsx` re-checks it because `#tools=gps-recorder` can
name the tool on a device that cannot run it.

## Wire contract

Everything the recorder's HTTP API is assumed to provide lives in
[`protocol.ts`](../src/features/gpsRecorder/protocol.ts) — origin, intent URL,
minimum version, and the zod schemas. **Change it there and nowhere else.** The
schemas are `looseObject`, so the recorder may add fields freely.

| | |
| --- | --- |
| `GET /status` | `{ versionCode, recording, pointCount, missingPermissions[], batteryExempt?, startedAt? }` |
| `POST /start` | begin recording |
| `POST /stop` | end recording |
| `GET /track?since=<seq>` | `{ points: [...] }` — everything above the cursor |
| `GET /stream` | SSE; `id:` is the point's `seq`, `data:` a point or a batch |

A point is `{ seq, lat, lon, ts, ele?, accuracy?, speed?, bearing? }`, with `ts`
in epoch milliseconds and `seq` the recorder-assigned monotonic id that doubles
as both the `/track?since=` cursor and the SSE event id.

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
2. Only an `unreachable` failure navigates to `RECORDER_INTENT_URL`. An installed
   app handles the `freemap-recorder://` scheme and hands focus back; a missing
   one follows `S.browser_fallback_url` to the download page.
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

## Stage 1 vs. stage 2

Stage 1 (built) is a viability proof: Start/Stop/Reconnect, recording state and
point count, a plain red polyline that grows live, and raw English error text.
The stage-2 list — elapsed time, distance, accuracy, GPX-consistent styling,
designed error states, the permission/battery banner, the `versionCode` update
prompt, and saving the finished track into the existing track handling — is in
[`TODO.md`](../TODO.md).

`src/static/llms.txt` deliberately does not mention the tool: it is hidden
behind a dev flag on one platform, so it is not user-visible behavior yet. That
changes with stage 2.
