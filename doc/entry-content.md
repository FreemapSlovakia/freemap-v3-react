# What a history entry shows

How the map's features — drawings and imported data in `trackViewer.trackGeojson`
— come back when a history entry is opened. One coordinator decides it:
`src/app/url/entryContent.ts`, called by `handleLocationChange` with what the
entry names; `entryContent.test.ts` holds a test per behaviour below.

| Source | Where the entry names it | Read |
|---|---|---|
| Link features | `point=` / `line=` / `polygon=` (in `sq` for a map entry) | synchronously, from the params |
| Snapshot | `history.state.tr` (a key; `true` for an older build's entry) | `getSnapshot`, IndexedDB |
| Remote track | `track-uid=` / `import-url=` | `fetchRemoteTrack`, network |
| Saved map | `id=` | `mapsRestoreProcessor` (working copy, then the document) |

## Rules

1. **The entry decides.** `openEntry` bumps the entry number; every read is
   tagged with the entry that requested it and applied only while that entry is
   shown. Nothing a previous entry had in flight lands on the next one.
2. **A read under way is joined.** Re-opening an entry whose snapshot or
   download is still being read waits for that same read (`inFlight`, by key).
3. **The entry's own content wins.** Link features or a snapshot are the newest
   edit; a saved map's features stand in only where the entry has none
   (`ownContent` on `mapsRestore`).
4. **A remote track is a one-shot import.** Only a link with no map names one
   (`track-uid=` / `import-url=`, read-only: never written back); a map's track
   is its features, and an older document or working copy naming a source
   instead downloads it the same way (`mapsLoadProcessor`,
   `mapsRestoreProcessor`). While it downloads, `trackUID` / `gpxUrl` mark it in
   state only. Once it ends — either way — the mark is cleared and the result
   replaces the entry (`replacingEntry`), so the link becomes the features or a
   snapshot. A download still under way for the entry is joined, not repeated.
5. **A missing snapshot falls through.** Its key is taken off the entry and a
   toast says it is gone; for a map entry the saved map is loaded in its place
   (`mapsLoad` with `replaceEntry`) rather than leaving an empty map that a Save
   would write over it. An older build's entry (`tr: true`) keeps the drawings
   its params gave, without a toast.
6. **The user's act wins.** A map opened from My Maps while a snapshot is read
   (`myMaps.loadMeta`) drops the snapshot. A download applies only while its
   source is still named and the data is as it was when it started, so opening a
   map, importing, editing or clearing meanwhile drops it. Opening another entry
   withdraws a map load standing in for a lost snapshot (`replaceEntry`).
7. **Nothing is written while a snapshot is read.** `entryLoading()` holds back
   the URL (`urlProcessor`), snapshots (`dataViewerStoreProcessor`) and the map
   working copy, so a half-restored state never becomes a history step or a
   copy; `mapsRestore` waits for it (`entrySettled`) before judging whether the
   map is unsaved. A download doesn't hold them: it can take long, and what the
   user does meanwhile is a step of its own.

## Large data

Data too large for the link is stored under a per-page key (`latest-<random>`),
overwritten on each edit, so two tabs don't overwrite each other. A restored
snapshot of that kind is adopted as the page's key (`continueSnapshot`) only once
applied. Its records are sized by `estimatedSize` so the storage bound evicts
leftovers. A duplicated tab shares its original's key until it is reloaded.

## Scenarios

### Without a map

| Entry carries | Situation | Shows |
|---|---|---|
| nothing | | empty map |
| link features | | the link features |
| `tr` | record present | the snapshot |
| `tr` | record evicted | empty, "no longer kept" toast; `tr` taken off |
| `tr: true` + link features | record present | the link features and the record's track |
| `tr: true` + link features | record gone | the link features alone |
| `track-uid=` / `import-url=` | download succeeds | the track; the entry is replaced by its features or snapshot |
| `track-uid=` / `import-url=` | download fails | empty, error toast; the entry is replaced without the source |
| any | user moves to another entry first | that entry's content only |
| `tr=k` | Back/Forward to another entry naming `k` while it is read | `k`, from the same read |

### With a map (`id=M`)

| Entry carries | Situation | Shows |
|---|---|---|
| nothing (fresh tab, shared link) | | the saved map (`mapsLoad`) |
| link features or `tr` | working copy comparable | the entry's content; unsaved iff it differs from the saved map |
| link features or `tr` | no comparable copy | the entry's content; compared with the document |
| `tr` | record evicted | the saved map in the entry's view and layers, "no longer kept" toast |
| `track-uid=` beside `id=` | | ignored: the map's features are its track |
| nothing (all features deleted) | reload | empty — the deletion is the newest edit |
| any | offline, document unreadable | the entry's content; with none, the working copy; with neither, empty and disconnected |
| any | auth validated later (restore re-runs) | as without the delay: the re-run acts for the entry that asked |
| a document naming a remote track and no features | | the track, downloaded into features; the map then reads unsaved until saved |
