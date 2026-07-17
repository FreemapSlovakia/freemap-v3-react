# TODO / improvement backlog

Project-review findings (2026-06-08). Roughly ordered by payoff. See
[`doc/architecture.md`](./doc/architecture.md) for the surrounding context.

## Committed work

- [~] **Add automated tests.** Vitest + jsdom now configured (`vitest.config.ts`,
  `pnpm test`). Starter characterization tests pin the persistence layer:
  `getInitialState()` legacy migrations + `parseWithFallback` + per-slice
  isolation + merge-over-initialState, the `Persisted*Schema` parsers, and
  the save side / round-trip (`statePersistingMiddleware`). Pure reducer tests
  now cover the `map`, `routePlanner`, `toasts`, `l10n`, `trackViewer`,
  `objects`, `search`, `gallery`, `tracking`, and drawing points/lines slices —
  the branchy slices with non-trivial logic. The `src/app/store/selectors.ts`
  selectors (picking-mode/cursor/gallery-visibility composition) are also
  covered. Still TODO: widening coverage to processors (side-effect
  middleware).
- [~] **Enable `noUncheckedIndexedAccess`.** Flag still off in `tsconfig.json`,
  but the array/coordinate-heavy hotspots are now cleaned up against it (error
  count 348 → ~180).

## Lint: re-enable Biome rules disabled during `recommended` adoption

`biome.json` now uses `"preset": "recommended"` with `--error-on-warnings`
(`lint`, `lint:fix`, lint-staged). Adopting the full recommended set lit up
rules the curated config never ran; the safely-autofixable ones were applied,
and the rest were switched `"off"` to keep the tree green. Re-enable and fix
these one at a time (counts are from first adoption):

- [ ] `suspicious/noImplicitAnyLet` (~23) — annotate bare `let x;` with a real type.
- [ ] `a11y/noSvgWithoutTitle` (8) — `<title>`/`aria-label` for meaningful, `aria-hidden` for decorative.
- [ ] `a11y/useHtmlLang` (3) — `lang` on `<html>` in `src/static/*.html`.
- [ ] `a11y/useButtonType`, `a11y/useValidAnchor`, `a11y/noStaticElementInteractions`,
      `suspicious/noConfusingLabels` (1 each).

Permanently off by decision (convention / tsconfig clash, **not** backlog):
`style/noNonNullAssertion`, `suspicious/noArrayIndexKey`,
`complexity/noImportantStyles`, `security/noDangerouslySetInnerHtml`,
`complexity/useLiteralKeys` (fights `noPropertyAccessFromIndexSignature`).

Still emitting at info level (non-blocking, optional cleanup):
`style/useTemplate` (145), `complexity/useIndexOf` (4), `correctness/useParseIntRadix` (1).

## Softer / design opinions

- [ ] **Remove the `*Settings` localStorage migration code (after ~2026-09).**
      The one-time migration from the old transient-slice keys can be dropped
      once active users have re-saved under the new keys (a couple of months
      from 2026-06; users who haven't opened the app by then aren't worth keeping
      it for). Delete `fallbackKey` (and `mergeFallback`) from the
      `routePlannerSettings`/`trackingSettings`/`gallerySettings`/
      `trackViewerSettings` PERSIST entries in `persistence.ts`; once nothing
      sets `mergeFallback`, simplify `parseWithFallback` back to primary-wins.
      The `fallbackKey: 'main'` migrations
      (`drawingSettings`/`homeLocation`/`cookieConsent`) are unrelated and stay.
- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
- [ ] **Reconcile toolbar Delete/Close buttons with their `kbd` shortcut.** A
      dedicated toolbar button can dispatch a feature-specific action while its
      `kbd` hint advertises a global key that resolves differently. The trackViewer
      trash button dispatches `trackViewerDelete()` but shows `kbd="Del"`, and the
      `Del` key (`keyboardHandler` → `deleteFeature()` → `deleteProcessor`) is
      selection-aware — so with a track loaded *and* a drawing selected, the button
      deletes the track while `Del` deletes the drawing. The same mismatch applies
      to Close buttons (`kbd="Esc"`) vs. the global `Esc` handling. A deeper fix
      would teach `deleteProcessor` / the Esc handler to prefer the active tool's
      own feature over an unrelated selection, so button and key always agree.
- [ ] **Toast auto-dismiss policy — do NOT centralize on `style`.** The
      convention is "errors (`danger`) persist + dedupe by `id`; transient
      notices auto-hide via `timeout`", enforced per call site. It's tempting to
      move this into `toastsAdd`'s `prepare` (`src/features/toasts/model/actions.ts`)
      as a style-keyed default (danger → no timeout, else 5000), but an audit of
      all ~100 `toastsAdd` calls shows `style` does **not** map to timeout policy:
      `info` is used for *persistent panels* (measurement results in
      `measurementProcessor`, feature/POI detail in `searchHighlightProcessor` /
      `ChangesetsResult` / `ObjectsResult`, `trackInfoToast`), and some
      `warning`/`info` intentionally stick (`awaitingBankPayment`, `moreResults`,
      `tooManyPoints`). Today an undefined `timeout` means "persist", so a
      non-danger default would silently auto-dismiss ~10 of those. Keep the
      per-site timeouts — they encode real intent, not boilerplate. The only
      style where the mapping holds is `success` (always transient); if any
      centralization is wanted, limit it to defaulting `success`-with-no-`actions`
      to 5000 (would also tidy a few success toasts that currently persist by
      omission: `copyOk`, `disconnectSuccess`, download success).
- [ ] **Adopt React 19 hooks codebase-wide** (own session — it's a cross-cutting
      decision, not a local cleanup). The app uses zero Suspense today; all async
      loading goes through `useLazy` (`src/app/hooks/useLazy.ts`) + effects
      (modal lazy-loading, `useLocalMessages`). Start at `useLazy` → `use` +
      `<Suspense>`; then `LazyToastMessage` in `Toasts.tsx` falls out for free.
      Gotcha: `use` needs a _stable_ promise, but the `load*Messages` loaders
      cache the resolved _value_, not the promise — so passing `loader(x)` inline
      is the suspend-forever anti-pattern; add a per-key promise cache. Also
      evaluate `useActionState`/`useFormStatus` for form submits, `useOptimistic`
      for manual pending state, and **React Compiler** eligibility (decide first —
      it would let many hand-written `useMemo`/`useCallback` be dropped, changing
      how much manual hook churn is worthwhile).

## Modal/overlay state unification

`state.main.activeModal` is a `Selection`-like discriminated union
`{ type; …args } | null` serialized through the packed `show=type/arg` codec
(`encodeActiveModal`/`decodeShow` in `src/app/store/actions.ts`); the gallery
viewer (own + Wikimedia Commons photos) and the Wikipedia
(`show=wiki/<lang>:<title>`) preview both route through the same `show=` param.
(Legacy `show=wmc/<pageId>` now decodes to the gallery viewer.)

Optional deeper cleanup (not required; `show=` is already the single param):

- [ ] **Fold `gallery-viewer`/`wiki` state into `activeModal`.** Replace
      `gallery.activeImageId` / `wiki.preview` with
      `activeModal.type === 'gallery-viewer' | 'wiki'` as the source of
      truth. Needs moving the `next`/`prev` resolution out of the
      `galleryRequestImage` reducer into a processor, and updating
      `showGalleryViewerSelector`, `GalleryViewerModal`, and the gallery
      delete/stars/comment processors. Higher churn, no user-visible change — only
      do it if the dual state becomes a problem.
- [ ] **Delete dead `src/features/documents/model/reducer.ts`.** Its `documentKey`
      slice is not wired into `rootReducer`; the document overlay now lives in
      `activeModal`.

## Premium / monetization

User-facing premium features are tracked as GitHub issues (label
`area: premium`): map/document export gating (#929), live-tracking limits (#930),
My Maps limits (#931), and removing the premium-photos perk (#932). The framing
constraints still hold and gate what's acceptable there: payment provider (Polar)
acceptable-use rules and content licensing mean safe premium = our own
compute/infra or power-user limits; avoid third-party data (license risk — see
Strava) and community content (CC-BY-SA can't be made exclusive + optics). Keep
the free/open core intact.

## Elevation / track chart

Feature requests are tracked as GitHub issues (label `area: elevation-chart`):
multi-property chart (#933), toggle waypoints (#934), label route midpoints
(#935), waypoint distance ticks (#936), waypoint elevation readout (#937), export
chart as SVG (#938), and further enrichments (#939). The remaining item here is an
engineering task, not a user-facing feature:

- [ ] **Attribute the elevation data source where it's used.** The elevation API
      now serves per-country high-res DTMs (SK/CZ/AT/CH/IT/SI/ES/SE) with a global
      GEDTM30 fallback, but the only place we credit them is the hand-maintained
      `llms.txt` and the outdoor-map layer attribution in `mapDefinitions.tsx`.
      Show the source next to where the value is consumed: the elevation chart,
      the point readout (`ElevationInfo.tsx`), and probably track colorization.
      Prefer having the **backend return the source** per point/response (which
      DTM answered) so we don't hand-sync the country→provider table on both
      sides — the mapping is currently inferred from `ELEVATION_SOURCES` and
      duplicated by hand.

## Track viewer: generic geodata vs. recorded tracks

The track viewer began as a GPX recording viewer and grew into a general geodata
viewer (GPX/KML/KMZ/TCX/GeoJSON, later maybe GPKG). Affordances written for a
single recorded GPS log now misfire on arbitrary imported geometry. The
through-line of the fixes below is **provenance, not heuristics**: tag each
feature at parse time with what it actually was in the source and key behavior
off that — never re-derive "is this a track?" from density/timestamps.

- [~] **Start/finish markers + distance labels only for tracks/routes.**
      `useStartFinishPoints` now emits a pair only for `fm:kind` track or route
      (`isTrackOrRoute`), so a KML/GeoJSON full of generic lines/polygons gets no
      flags — the original clutter complaint. (Route included too: GPX `<rte>` is
      a deliberate line where start/finish + distance helps; only generic
      `feature` geometry caused the clutter.) **Still TODO:** with several tracks
      the permanent distance tooltips can still stack — show them on
      hover/selection when there's more than one.
- [~] **Multi-segment stats & elevation profile.** Aggregate distance/time across
      segments with the inter-segment gap excluded (no phantom straight-line
      distance across a pause). Elevation profile lays segments end-to-end on the
      cumulative-distance axis with a visible discontinuity at the boundary, not
      a sloped bridge. **Done:** the elevation chart now charts a `MultiLineString`
      track — `elevationChartSetTrackGeojson` accepts it, the chart handler is
      segment-aware (gap break + climb-baseline reset between segments, no jump
      distance), `containsElevations`/`elevationCoverage`/`enrichElevations` are
      multi-segment-aware, and the suitability selector + toggle/resolve
      processors no longer drop `MultiLineString`. `densifyAlong` /
      `ensureRenderGeojson` densify a `MultiLineString` per segment (no inserts
      across the gap), so a server elevation override gets the same chart detail
      as a single-segment track. A new `trackViewerSetElevation` processor
      refreshes an already-open chart when elevation is refilled (it no longer
      goes stale until re-opened). The "more info" stats are now multi-segment
      aware (climb/descent measured per segment).
      **Still TODO:** start/finish markers' permanent distance tooltips can stack
      when several tracks are shown (hover-only when >1).
- [~] **Waypoints on the elevation profile.** Standalone points (GPX `<wpt>`)
      are pinned onto the chart with a stem, a dot on the line, and the name as
      a label. `elevationChartSetTrackGeojson` takes a `waypoints` arg (the
      trackViewer passes its Point features via `trackWaypoints`, including each
      `<wpt>`'s optional time). A waypoint is pinned only where the profile
      passes within `WAYPOINT_SNAP_METERS` (100 m); among those candidates it
      picks the one closest in **time** when both the waypoint and the track
      carry timestamps (disambiguating a self-crossing track), else the nearest
      in space. The local resolver carries each profile point's recorded time;
      the API-sampled path has none and uses spatial pairing. **Refinement:** a
      very sparse line could still miss a mid-segment waypoint — could project
      onto the nearest segment rather than the nearest vertex.
- [ ] **Rename the feature away from "track viewer".** It's now a general geodata
      viewer (GPX/KML/KMZ/TCX/GeoJSON, points/lines/polygons, multi-file), so the
      `trackViewer` name is misleading. Rename the directory
      (`src/features/trackViewer/`) and all its symbols — components
      (`TrackViewer*`), the redux slice + state/actions/processors
      (`trackViewer*`, `trackGeojson`, `TRACK_VIEWER_*`), hooks/utils
      (`useStartFinishPoints`, `trackSelection`, `trackEndpoints`,
      `parseTrackFile(s)`, `trackWaypoints`, …), the per-feature `translations/`
      bundle and its message keys, and the doc references (`doc/architecture.md`,
      `doc/elevation-and-colorizers.md`, `CLAUDE.md`, `llms.txt`). Candidate
      names: `geodataViewer` / `fileViewer` / `mapDataViewer` (decide first).
      **Keep serialized identifiers stable for back-compat** — the persisted
      slice key (`trackViewer` in the saved state / `Persisted*Schema`) and the
      URL tokens (`tools=import-file`, the legacy `track-viewer` /
      `#show=upload-track` / `gpx-url=` / `load=` aliases) must keep working, so
      either keep those literal strings or add migrations/aliases. Mostly a
      mechanical symbol rename; do it in its own PR to keep the diff reviewable.

## Live tracking

- [ ] **Convert-to-drawing for live tracking** (`src/features/tracking/`). The
      tracking feature has no "convert to drawing" yet; add one so a recorded
      live track can be turned into an editable drawing. Unlike the track viewer,
      tracking should **keep** the original (the live feed continues), so it's a
      lossy *copy* not a replace — no rich-data warning needed, just the
      simplify prompt for the dense recording. Likely a new `convertToDrawing`
      payload variant (e.g. `{ type: 'tracking'; id }`) handled in
      `convertToDrawingProcessor`, plus a menu action in the tracking UI.

## Photo layer: gallery + Wikimedia Commons merge

Merge of the separate Wikimedia Commons layer (`M`) into the gallery photo layer
(`I`): the API server imports the monthly Commons `geo_tags` dump (filtered to
`gt_type='camera'`) into a `wikimediaPicture` table of just `(pageId, location)`,
exposed through the same `/gallery/pictures` bbox + detail endpoints with a
`source` discriminator. The client fetches everything else — title, image URL,
author, license, description — lazily from the Commons API by pageId on viewer
open (it must call the API for CC attribution anyway, and that response also
carries the title and image URL, so the 6.7 GB `page` dump is *not* imported).
The `M` layer is retired;
`source` becomes a filter + colorize dimension. Ratings/comments for wikimedia
photos live in standalone `wikimediaRating`/`wikimediaComment` tables (keyed on
the stable `pageId`, untouched by the monthly reimport).

**Client PR (freemap-v3-react) — DONE.** The gallery layer (`I`) now renders own
+ Wikimedia Commons photos in one canvas layer, tinted by source (and a `source`
colorize mode); the `M` layer and the whole `src/features/wikimediaCommons/`
feature are removed. Commons photos ride the shared id space as negative ids
(`-pageId`) via `pictureIdToPath`, open in the gallery viewer (image +
author/license/description fetched straight from Commons via `wikimediaMeta.ts`),
and support rating/comments but not edit/delete. Legacy `#show=wmc/<pageId>` and
`#wmc=<pageId>` links remap to the merged viewer. Filter gains `sources`
(gallery/wikimedia; Commons gated to zoom ≥ 11).

**Server PR (freemap-v3-api) — DONE.** `wikimediaPicture`/`wikimediaRating`/
`wikimediaComment` schema in `initDatabase()`; streaming dump importer
(`src/wikimedia/importWikimedia.ts` + `sqlDumpParser.ts`, tested; `pnpm
import:wikimedia` — geo_tags-only stream into a heap staging table, then a
sorted `INSERT IGNORE … SELECT` into the final table + spatial index, atomic
swap); bbox/radius gain `source`; detail/rating/comment accept `w<pageId>`;
comment mail extracted to `commentMail.ts`.

Importer perf notes (learned running it live): the load is disk-bound, not
network — insert via one connection with big transactions (commit every ~200k
rows, `unique_checks` off) and keep the staging table a **heap** (no PK) so the
tag-id-ordered rows don't thrash a random-order `pageId` clustered index; bump
`innodb_buffer_pool_size` (was 128 MiB default) for the join/index tail. There
are **>16.7M** camera pageIds, so an in-memory `Set` of ids overflows V8's Set
cap — another reason the page-dump join was dropped.

**Wire contract the client PR must match:**
- protobuf `Picture.source` (field 18): `0` = gallery (omitted), `1` = wikimedia;
  `id` carries the Commons `pageId` for wikimedia rows.
- `GET /gallery/pictures?by=bbox&sources=gallery,wikimedia` (default both); any
  gallery-only filter (`userId`/`tag`/rating/date/`pano`/`premium`/`license`)
  drops the wikimedia arm.
- `by=radius` now returns `[{ id, source }]` (was `[{ id }]`) — merged, sorted by
  distance; `sources` param honored the same way.
- Detail `GET /gallery/pictures/w<pageId>` returns `{ id:<pageId>, source:
  'wikimedia', title:null, lat, lon, tags:[], comments, rating, myStars }`;
  gallery detail now also carries `source:'gallery'`. Client fetches title, image
  URL, author, license and description from the Commons API by pageId.
- Rating/comment `POST /gallery/pictures/w<pageId>/{rating,comments}` supported
  (no premium gating); `PUT`/`DELETE`/`/image`/upload are gallery-only.

Remaining server niceties (not blocking the client PR): explicit
`w<pageId>` rejection in the `PUT`/`DELETE`/`/image` handlers (they already 404
via int coercion today), and mid-download resume in the importer.

Deferred sub-items:

- [ ] **Use `gt_type` as a filterable tag.** v1 only stores `gt_type` in a column
      (filtered to `camera` at import). Wiring it into the shared `tag` filter
      (so "mountain"/"church"/… filter uniformly across gallery user-tags and
      wikimedia types) needs the wikimedia side of the bbox `UNION ALL` to match
      its single `gt_type` against the tag-filter set + `tagMode`, plus surfacing
      the fixed enum as selectable tags client-side. Not simple — defer.
- [x] **Ingest the Commons `image` table for date + stable author.** The importer
      now streams the ~17 GB `image` dump (title-keyed, pre-filtered by a hashed
      title bitset to the kept subset, joined back on title) and stores
      `capturedAt` (EXIF `DateTimeOriginal` from the JSON `img_metadata`),
      `uploadedAt` (`img_timestamp`) and `authorId` (numeric `img_actor`) on
      `wikimediaPicture`. The bbox arm surfaces them under `takenAt`/`createdAt`/
      `userId`, so date/season/author **colorizing** works for wikimedia photos.
      Notes: the actor *name* isn't in any public dump (`actor` dump is empty), so
      it stays API-only in the viewer.
- [x] **Add the SDC (mediainfo) dump for capturedAt + license.** The `image` dump
      externalizes rich EXIF (`{"data":[],"blobs":{…}}`) out of reach, so
      `capturedAt`/`azimuth` from it are sparse (~36% / ~8%) — exactly the dated,
      directional photos. The importer now also streams the ~75 GB SDC
      `latest-mediainfo.json.gz` (JSON-lines; pageId cheap-matched at line start,
      only kept entities JSON-parsed) and stores `P571` (inception →
      `COALESCE(EXIF, SDC)` capturedAt) and `P275` (license → our buckets via
      `licenseQMap.ts`). `license` is a first-class column now, colorized like own
      photos; `WIKIMEDIA_NO_DATA_MODES` is empty. Azimuth has no SDC source (stays
      best-effort EXIF). License *filtering* for wikimedia is still gallery-only
      (the `wikimediaExcludedByFilter` set) — could be enabled now that the column
      exists.
- [x] **Include wikimedia in list *ordering* and *filtering*.** All three handlers
      (`byBbox`/`byRadius`/`byOrder`) now include wikimedia unless a filter it can't
      satisfy is set (tag/author/license, or pano=true/premium=true). The wikimedia
      arms apply the date-range (`capturedAt`/`uploadedAt`, indexed) and rating-range
      (effective Bayesian rating) filters and every ordering; the Filter modal shows
      an "excludes Wikimedia" note only under tag/author/license.

## SEO prerender (`sitemap-generator/`, see [`doc/seo-prerender.md`](./doc/seo-prerender.md))

- [ ] **Link `oz.freemap.sk` from the prerender footer.** The association site is
      currently only reachable to crawlers via the GitHub README and the
      `document=freemap` prerender; the in-app AboutModal link is SPA-only (bot
      invisible). Add a small `<footer>` to `renderHome`/`renderHub` in `seo.ts`
      linking `oz.freemap.sk` (and maybe GitHub) so every prerendered page carries
      the inbound link.
- [ ] **Hub landing pages in all 9 languages.** `HUB_LANGS` is still `sk + en`;
      expanding to every UI language needs the `Hub.title`/`description` records in
      `seo.ts` translated (~19 hubs × title+description per new language), phased by
      market priority (IT → PL → HU → DE → SL → FR → CS).
- [ ] **More countries for per-feature POI pages.** `objects.ts` `COUNTRIES` covers
      SK (full) + CZ/HU/PL/IT (outdoor-only); add AT/DE/SI next (each = area id +
      `COPY` entry), one at a time, watching GSC indexing before scaling.
- [ ] **Native review of the generated foreign copy** — the CZ/HU/PL/IT `COPY`
      strings in `objects.ts` and the `sl`/`fr` `openMapLabel`/`featuresLabel` in
      `seo.ts` are machine-drafted.

