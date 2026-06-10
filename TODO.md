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
  Toast/`errorKey` references that previously forced strings to stay global can be moved too: a processor dispatches the toast with a literal `message:` resolved via `load<Feature>Messages(language)` (as `wikimediaCommons` now does) instead of a global `messageKey:` — or, for the `errorKey` shortcut, an explicit try/catch (as the `myMaps` processors now do). Still global-bound: toast `messageKey`s/`errorKey`s whose value is a JSX-returning function dispatched from a non-component (e.g. `mapLayers.legacyMapWarning`), since toast `message` is typed `string`.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
      </content>
