# Browser recording backend — work in progress

Handoff notes for continuing this feature in a fresh session. The **design** is
documented in [`doc/gps-recorder.md`](../../../../doc/gps-recorder.md) —
"Recording in the browser" and the rewritten "Availability" section. This file is
only about the *state of the work*: what is done, what has never been run, and
what to do next.

## Status

**Written, type-checks, unit tests pass — and has never been executed in a
browser.** Not on Android, not on iOS, not in devtools emulation. Nothing below
should be assumed to work until someone opens it on a phone. The existing 530
tests pass, but none of them touch this code.

Done:

- `src/shared/geolocationWatch.ts` — one ref-counted `watchPosition` for the
  whole app. **Intended for the live-tracking work too**; subscribe to it rather
  than opening a second watch (Android merges concurrent requests at the highest
  rate anyone asked for). `locateProcessor` is migrated onto it; its phase-1
  coarse `getCurrentPosition` stays where it was, since that is a one-shot and
  not a watch.
- `backend.ts` — the `RecorderBackend` seam, with `app` (the APK, including the
  launch-intent and `needs-foreground` retry that used to live in `startHandler`)
  and `browser` implementations.
- `browser/engine.ts`, `browser/trackStore.ts` — the recording engine and its
  IndexedDB store.
- `gpsRecorderSettings.backend`, persisted; `recorderBackendKind(state)` is the
  single place that resolves it (and forces `browser` off Android).
- UI: backend radio in the recorder's settings modal, "Record in this browser" on
  the `unreachable` toast (`gpsRecorderUseBrowser` — switches the setting and
  starts in one gesture), a once-per-ride `warning` toast, a readout badge.
- English strings + `GpsRecorderMessages`. Other locales fall back to English;
  **the `*.template.tsx` files have not been touched**, so `pnpm sync-language-files`
  emits `TODO translate` blocks for the new keys. The `/translate-missing` skill
  handles them.

## What to do next, roughly in order

1. **Run it.** Chrome devtools device emulation reports the coarse pointer, so
   the availability gate passes on a desktop with emulation on. Then a real
   phone: the interesting paths are a reload mid-recording (should resume from
   IndexedDB), locking the screen (should end up as a `seg` break, not a straight
   line), and Finish (should hand over and store durably without the APK's
   completeness check being reachable).
2. **Elevation.** `altMsl` is always null here and the W3C `altitude` is above the
   WGS84 ellipsoid, so `trackGeojson` currently writes an ellipsoidal `<ele>` —
   ~42 m out over Slovakia. The intended fix is to give browser-sourced tracks
   the **imported-GPX elevation prompt** rather than `keepRecorded`: see
   `resolveElevationChart.ts` here and
   `dataViewerResolveElevationPromptProcessor.ts`, plus
   [`doc/elevation-and-colorizers.md`](../../../../doc/elevation-and-colorizers.md).
   This is the largest remaining correctness gap.
3. **Test the fix filter.** The interval tolerance, the starvation → `seg` bump
   and the min-distance test all live inside `acceptFix`, which is
   module-stateful and IDB-backed, so none of it is reachable from a test.
   Extract the decision into a pure function (`shouldKeepFix(lastKept, candidate,
   config)` returning keep/drop/new-segment) and test it beside
   `segments.test.ts`. Worth doing before trusting any of the thresholds. The
   same goes for `loadBrowserTrack`'s `nextSeq` floor, which is the recovery a
   code review had to catch rather than a test.
4. **`positionSource` in Map preferences.** Agreed in design, not built: a
   `locationSettings.positionSource` of `automatic | browser | recorder`, shown
   beside `headingSource` in `MapPreferencesModal`, **replacing**
   `gpsRecorderSettings.feedLocation` (which answers the same question in a
   narrower form — two settings for one question is the thing to avoid). Only
   worth doing together with (5).
5. **Recorder-app fixes for "Locate me" outside recording.** Deliberately
   deferred. Real benefits — no cold-GNSS re-acquire when returning to the tab,
   one permission instead of two, `sat`/`altMsl` in the readout — but the APK has
   no fixes to give when it is not recording, so it needs a new endpoint (a live
   fix stream independent of recording) and a `MIN_RECORDER_VERSION_CODE` bump.
   Lower value than everything above.
6. **Translations** for the new keys (see Status).

## Decisions already made — don't relitigate

- **Off Android the APK is never mentioned.** No disabled radio, no explanation,
  no install link. `recorderBackendKind` forces `browser` there regardless of the
  stored setting.
- **The backend choice is not the first contact.** It is a setting for changing
  later; the moment it is actually offered is the `unreachable` toast, because
  that is when the user has just asked to record and got nothing. No upfront
  "two sources, pros and cons" explainer.
- **The synthesized `RecorderStatus` fills the Android-only fields with their
  nothing-outstanding values** (`permissions` true, `batteryExempt`, `oem`
  clear, `setupComplete`). That is what they truthfully say here — there is no
  such setup step — and it is what keeps `useRecorderNotices` from raising an
  Android checklist. The browser's own hazard is said separately.
- **The wake lock is not a preference under this backend.** A blanked screen ends
  a browser recording rather than hiding it, so it is held unconditionally and
  the checkbox is hidden.
- **A starved watch bumps `seg`.** Silent truncation is the reputational risk of
  browser recording; a visibly broken track is recoverable, a plausible-looking
  wrong one is not. This is a fact about the recording, distinct from `splitGapS`,
  which stays a display preference.
- **`seq` never restarts, not even after a delete** — same rationale as the APK's,
  and `generation` is what marks the break.
- **Storage is best-effort, and its failure is said rather than fatal.** An
  unreadable or unwritable IndexedDB (private browsing, quota, a denied origin)
  leaves the ride recording in memory — it is still on the screen and can still
  be finished into the track viewer — and `isBrowserStorageUsable()` swaps the
  start-of-ride toast for one that says a reload will lose it. Refusing to record
  was considered and rejected; so was staying quiet about it.
- **The backend cannot be switched mid-recording.** Every other setting is merely
  ineffective until the next start; this one would leave the running engine's
  watch alive and appending while the handlers address the other engine, so the
  control (and Reset to defaults) is locked for the duration.

## Gotchas

- `idb-keyval`'s `createStore(db, store)` opens each database at version 1 and
  creates exactly that store, so two calls naming the same database fail on the
  second store. Hence two databases (`fm-gpsRecorder-points`,
  `fm-gpsRecorder-meta`).
- `browser/engine.ts` holds module state. `resetBrowserRecorder()` exists as the
  test seam; hydration is `ensureHydrated`, awaited by every entry point. It
  **handles** its own rejection rather than letting one through — the promise is
  memoized, so a cached rejection would refuse every later call for the life of
  the page.
- `appendBrowserPoints` writes the points first and the meta **regardless**. The
  asymmetry is deliberate: a `nextSeq` ahead of the stored points only leaves
  gaps, while a meta behind them reissues live ids, and a `recording: true` that
  never got cleared has the next load resume a stopped ride.
- The browser backend does **not** claim `locationSetExternalSource` — its fixes
  come from the very watch that would be displaced.
- Only `PERMISSION_DENIED` ends a browser recording. `POSITION_UNAVAILABLE` and
  `TIMEOUT` are signal loss that the watch recovers from, and the segment split
  already draws the gap honestly.
- `stream.ts` (`suspectRecorderStream` and friends) is app-backend only. `follow.ts`
  still calls it unconditionally; harmless, because it only touches state the
  browser backend never reads, but worth knowing before changing either.
