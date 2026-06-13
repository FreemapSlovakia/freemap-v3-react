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
  its own bundle: the two JSX websocket-toast keys
  (`subscribeNotFound`/`subscribeError`) now resolve via `loadTrackingMessages`
  in `trackingMiddleware`, so nothing is left in the global blob;
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
  via `loadChangesetsMessages`. The JSX `changesets.detail` toast also moved to the
  bundle: `ChangesetsResult` dispatches it with `messageKey: 'detail'` +
  `messageLoader: loadChangesetsMessages`, and the bundle's locale templates carry
  the one locale-independent `detail` line plus the `ChangesetDetails` import. And
  `trackViewer`
  → its own bundle, including the JSX `info` toast key (dispatched from
  `TrackViewerMenu` via `messageLoader: loadTrackViewerMessages`); the
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
  `useGalleryMessages`. And the global `external` block → its own
  `openInExternalApp` bundle (label-only, no toasts): the owning
  `OpenInExternalAppMenuItems`/`OpenInExternalAppMenuButton` plus the
  cross-feature consumers `MainMenu`, `MainMenuButton`, and the app-level
  `MapContextMenu` read it via `useOpenInExternalAppMessages`. The shared
  `openInExternal` launcher label moved into the bundle too (consumed
  cross-feature rather than kept in a global namespace). And the global
  `credits` block → its own `credits` bundle: `BuyCreditsModal`/`CreditsAlert`
  read it via `useCreditsMessages`, and the cross-feature `credits.purchase.success`
  toast in `auth`'s `purchaseProcessor` resolves via `loadCreditsMessages`. The
  locale-specific `nf00` formatter and the `CreditsText` import (both used only
  by `credits.purchase.success`/`youHaveCredits`) moved into the bundle and left
  the global locale files. The neighbouring `purchases.premium`/`purchases.credits`
  keys are purchase-listing item-type labels, so they stay with `purchases` (the
  account/`auth` area), not the `credits`/`premium` bundles. And the global
  `auth` block → its own `auth` bundle: `LoginModal`/`AuthProvidersSection` read
  it via `useAuthMessages`; the login/logout/disconnect processors resolve their
  toasts via `loadAuthMessages` (the seven `auth-with-*` processors and
  `authInit`/`authLogout` drop their `errorKey`s for a try/catch + `toastError`,
  passing the old `'lcd'` toast id to preserve dedup). The keys were flattened
  (`connectLabel`, `logInWith`, `logInError`, `logOutError`, …) because
  `toastError`'s `ErrMessageKey` only matches top-level error-function keys, so
  the previous `logIn.*`/`logOut.*` nesting couldn't carry the error toasts. The
  `auth` error strings still call `addError(getMessages()!, …)` for the global
  `errorStatus`/`general.*` fallbacks. And the global `drawing` block → its own
  `drawing` bundle (label-only, no toasts/errorKeys): the eight `drawing/`
  components plus the app-level `PredefinedDrawingPropertiesModal` read it via
  `useDrawingMessages`. The nested `edit`/`defProps`/`projection` sub-objects are
  kept as-is (no `toastError` involvement, so no flattening needed). And three
  small leaf blocks → their own bundles: `osm` (the three node/way/relation load
  processors drop their `errorKey` for a try/catch + `toastError` via
  `loadOsmMessages`; no React consumer, so loader-only), `ad`
  (`Ad` reads `self`/`rovas` JSX via `useAdMessages`; the `RovasAd` import left
  the global locale files with the block), and `documents` (`DocumentModal`'s
  `errorLoading` via `useDocumentsMessages`). And the global `purchases` block →
  its own `purchases` bundle: `AccountModal`/`PurchasesSection` read it via
  `usePurchasesMessages`, and the `awaitingBankPayment` pending-bank-transfer
  toast in `auth`'s `purchaseProcessor` resolves via `loadPurchasesMessages`.
  Deliberately a separate bundle rather than folded into `auth`: a production
  rspack build confirmed each `<feature>-translation-<lang>` is its own async
  chunk (string-only ones are a few hundred bytes), so keeping `purchases` apart
  means the login modal (`auth`) doesn't download the bank-intent-status strings
  it never shows — the chunk boundary follows the load moment, not the feature
  folder. The always-loaded global `Messages` chunk (~17.5 kB en) is what further
  feature extractions keep shrinking. And the global `measurement` block → its
  own `features/measurement/translations` bundle (loader-only): the
  `measurementProcessor` (which lives under `drawing/model`) drops its `errorKey`
  for a try/catch + `toastError` via `loadMeasurementMessages`, and its three
  result toasts (`elevationInfo`/`areaInfo`/`distanceInfo`) switch to
  `messageLoader`. Kept separate from `drawing` rather than merged, by the same
  load-moment rule: the bundle drags the `ElevationInfo`/`AreaInfo`/`DistanceInfo`
  result renderers (used essentially nowhere else), so folding them into the
  `drawing` bundle would load them for every plain draw session; as a separate
  bundle they load only when a measurement toast renders. The dead
  `distance`/`elevation`/`area` label keys (no consumer) were dropped, and the
  now-unused `ElevationInfoBaseProps` + the three component imports left
  `messagesInterface.ts` / the global locale files with the block. To avoid
  translations-only feature folders, the relevant code was co-located into the
  new feature dirs: `measurement` gained `model/measurementProcessor.ts` (from
  `drawing/model`) and `components/{AreaInfo,DistanceInfo}.tsx` (from
  `app/components`, used only here); `purchases` gained
  `components/PurchasesSection.tsx` (from `auth/components/AccountModal`, still
  composed by `AccountModal`) and `model/processors/purchaseProcessor.ts` (from
  `auth/model/processors`). Both still depend on their parent feature (drawing's
  `drawingMeasure` action, auth's `authInit`/`purchaseOnLogin`), which is a fine
  dependency direction; the separate lazy chunks are unaffected (chunk names come
  from the `webpackChunkName` comments, not the folder). Finally the grab-bag
  global `settings` block was **split by consumer** (not moved as a unit), so a
  component needing one settings string no longer pulls the whole blob:
  `account.*` → the `auth` bundle (`AccountModal`/`PersonalInfoSection`;
  `deleteWarning`/`pictureTooLarge` toasts via `loadAuthMessages`);
  `account.sendGalleryEmails` → the `gallery` bundle (only `GalleryMenu` uses it);
  the layer prefs (`overlayOpacity`/`showInMenu`/`showInToolbar`) plus the shared
  save toasts (`saveSuccess`/`savingError`) → a new `mapSettings` bundle
  (`MapLayersSettings`/`LayerVisibilityFields` via `useMapSettingsMessages`; the
  `saveSettingsProcessor`/`l10n`/`homeLocation` save toasts via
  `loadMapSettingsMessages`, the two processors dropping `errorKey` for
  try/catch + `toastError`); `map.homeLocation.select` → the `routePlanner`
  bundle as `selectHomeLocation` (its only consumer). Six dead keys were dropped
  in the process (`general.tips`, `layer`, `customLayersDef`,
  `customLayersDefError`, `map.homeLocation.{label,undefined}`). And the
  cross-cutting global `premium` block → a new `premium` feature: its 12
  consumers across app/auth/gallery/purchases/routePlanner/supportUsModal/shared
  read it via `usePremiumMessages`, and the `success`/`alreadyPremium` toasts
  (`purchaseProcessor`/`loginResponseHandler`) via `loadPremiumMessages`. To make
  it a real feature rather than translations-only, the premium-specific code was
  co-located in: `PremiumActivationModal` (from `app/components`, still lazy-
  loaded from `Main`), `useBecomePremium` (from `shared/hooks`), and `isPremium`
  (`premium.ts`, from `shared/`). The wide fan-in (~14 import sites) is the
  correct direction — features depend on the premium feature.
  Toast/`errorKey` references that previously forced strings to stay global can be moved too: a processor dispatches the toast with a literal `message:` resolved via `load<Feature>Messages(language)` (as `wikimediaCommons` now does) instead of a global `messageKey:` — or, for the `errorKey` shortcut, an explicit try/catch (as the `myMaps` processors now do). Since toasts gained `messageKey` + optional `messageLoader` (resolved against a per-feature bundle at render), even JSX-returning toast keys can leave the global blob — that's how `changesets.detail`, `trackViewer.info`, and the two `tracking.subscribe*` keys moved out. Still global-bound: `mapLayers.legacyMapWarning` (a JSX toast still dispatched with a global `messageKey`, not yet migrated to a `messageLoader`).

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
- [ ] **Adopt React 19 hooks codebase-wide** (own session — it's a cross-cutting
      decision, not a local cleanup). The app uses zero Suspense today; all async
      loading goes through `useLazy` (`src/app/hooks/useLazy.ts`) + effects
      (modal lazy-loading, `useLocalMessages`). Start at `useLazy` → `use` +
      `<Suspense>`; then `LazyToastMessage` in `Toasts.tsx` falls out for free.
      Gotcha: `use` needs a *stable* promise, but the `load*Messages` loaders
      cache the resolved *value*, not the promise — so passing `loader(x)` inline
      is the suspend-forever anti-pattern; add a per-key promise cache. Also
      evaluate `useActionState`/`useFormStatus` for form submits, `useOptimistic`
      for manual pending state, and **React Compiler** eligibility (decide first —
      it would let many hand-written `useMemo`/`useCallback` be dropped, changing
      how much manual hook churn is worthwhile).

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
