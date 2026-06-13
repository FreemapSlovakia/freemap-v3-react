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
- [~] Separate feature-related messages from `src/translations/messagesInterface.ts` to feature directory. Done so far: `supportUsModal`, `routePlanner`, `legend`, `wikimediaCommons`,
  `offlineMapExport`, `mapArea` (the area-selection toggle/menu labels, which
  also absorbed the duplicate `mapToDocumentExport.areas` strings), and the
  `offline` block → `cachedMaps` (its `offlineMaps` launcher label moved to the
  global `mapLayers` namespace; the processor toast/action resolve via
  `loadCachedMapsMessages`), and `mapToDocumentExport` (the modal's error toast
  resolves via `loadMapToDocumentExportMessages`; the menu label stays in the
  global `mainMenu`). Removing it also dropped the last `ExportableLayer` /
  `CustomLayerOrder` / `ReactElement` imports from `messagesInterface.ts`. Also
  `myMaps` → its own bundle: the 4 maps load/save/delete processors drop their
  `errorKey` for an explicit try/catch that skips `AbortError` and resolves the
  message via `loadMyMapsMessages`, so even the error strings left the global
  blob. Its two layer-concern keys (`legacy` tooltip + the JSX `legacyMapWarning`
  processor toast) moved to the global `mapLayers` namespace. And `tracking` →
  its own bundle, leaving only the two JSX websocket-toast keys
  (`subscribeNotFound`/`subscribeError`) in a minimal global `tracking` block;
  `useHtmlMeta` resolves the two tracking modal titles from the bundle instead of
  the global key-map. And `exportMapFeatures` → its own `mapFeaturesExport/`
  bundle: the export processor drops its `errorKey` for a try/catch that resolves
  via `loadMapFeaturesExportMessages`, and the Dropbox/Google-Drive/Garmin-revoked
  processor toasts switch from `messageKey` to a literal `message:` resolved the
  same way — nothing left global. And `objects` → its own bundle: the fetch
  processor drops its `errorKey` for a try/catch and switches its low-zoom and
  too-many-points toasts (plus the low-zoom toast action's `nameKey`→`name`) to
  literal `message:`/`name:` via `loadObjectsMessages`; the cross-feature
  `convertToDrawingProcessor` (global `src/processors/`) does the same for its
  `objects.fetchingError` errorKey. The `objects.icon` marker-shape labels stay
  in the objects bundle (the `MarkerType` they label is owned by objects) and the
  drawing `MarkerTypeSelect` consumes them cross-feature via `useObjectsMessages`.
  And `changesets` → its own bundle: the fetch processor drops its `errorKey` for
  a try/catch and switches its `tooBig`/`notFound` toasts to literal `message:`
  via `loadChangesetsMessages`. Only `changesets.detail` stays in a minimal global
  `changesets` block — it's a JSX-returning function dispatched as a toast
  `messageKey` and rendered by the global `Toasts` component (which resolves keys
  only against global Messages). The locale templates keep just that one
  locale-independent `detail` line (so generated files carry the `ChangesetDetails`
  import); everything else now falls back through the bundle. And `trackViewer`
  → its own bundle, leaving only the JSX `info` toast key in a minimal global
  block (same global-Toasts-renderer constraint as `changesets.detail`); the
  three track download/load/upload processors (which live under `tracking/` — see
  relocation note) drop their `errorKey`s for try/catch and switch their
  `tooBig`/`shareToast` toasts to literal `message:` via `loadTrackViewerMessages`;
  `useTextFileDropHandler` now takes `TrackViewerMessages` instead of global
  `Messages`; `useHtmlMeta` resolves the `file-import` modal title from the bundle.
  And `gallery` → its own bundle, leaving nothing in the global blob: the nine
  fetch/save/delete/comment/rating/tag-load processors drop their `errorKey`s for
  try/catch resolving the error functions via `loadGalleryMessages`, the
  by-radius `noPicturesFound` and the upload `uploadModal.success` toasts switch
  from `messageKey:` to literal `message:` the same way, and the GPX
  `addPictures` exporter takes a `GalleryMessages` arg loaded via
  `loadGalleryMessages(language)` instead of reading `getMessages().gallery`. The
  three `getErrors` validation keys move to bare keys (`missingPositionError`
  etc.) resolved against the bundle in `GalleryEditForm` (so `getMessageByKey`
  drops its last gallery caller). Cross-feature consumers `DrawingPointSelection`,
  `GalleryColorizeBySubmenu`, and `WikimediaCommonsLayer` read the bundle via
  `useGalleryMessages`.
  Toast/`errorKey` references that previously forced strings to stay global can be moved too: a processor dispatches the toast with a literal `message:` resolved via `load<Feature>Messages(language)` (as `wikimediaCommons` now does) instead of a global `messageKey:` — or, for the `errorKey` shortcut, an explicit try/catch (as the `myMaps` processors now do). Still global-bound: toast `messageKey`s/`errorKey`s whose value is a JSX-returning function dispatched from a non-component (e.g. `mapLayers.legacyMapWarning`), since toast `message` is typed `string`.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.

## Premium / monetization

Context: payment provider (Polar) acceptable-use rules and content licensing
constrain what can be gated. Safe premium = our own compute/infra or power-user
limits; avoid third-party data (license risk — see Strava) and community content
(CC-BY-SA can't be made exclusive + optics). Keep the free/open core intact.

- [ ] **Remove the "premium photos" perk.** Decision: drop it. Photos are
      CC-BY-SA 4.0 (can't be exclusive — any premium user may redistribute), and
      contributors have no intent to flag their own photos premium-only.
      Action: remove the "premium photos" bullet from the premium modal copy in
      all 7 locales (`en.messages.tsx` + `sk/cs/de/pl/hu/it.template.tsx`),
      regenerate locale files. (Strava heatmap already removed.)
- [ ] **Premium feature — Map → image/document export** (Tier 1). Gate high
      resolution, large format, PDF/vector output, and no-watermark behind
      premium (or credits). Print-quality rendering is our own compute, clearly
      worth paying for, and rights-clean.
- [ ] **Premium feature — Live tracking limits** (Tier 2). Gate number of
      tracked devices, history retention, and update frequency. Convenience
      limit, rights-clean.
- [ ] **Premium feature — My Maps limits** (Tier 2). Free tier gets a limited
      number of saved maps; premium unlimited + sharing. Convenience limit.
- [ ] **Audit existing premium third-party layers** (same risk class as Strava):
      confirm licenses permit gating/charging for NLC forestry WMS
      (`gis.nlcsk.org`), ŠGÚDŠ geology WMS (`ags.geology.sk`), and ÚGKK ortho/DMR
      (LLS DMR). Own renders (Outdoor map, parametric hillshade SK/CZ) are fine.
      </content>
