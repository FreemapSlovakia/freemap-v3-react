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
viewer, Wikimedia Commons (`show=wmc/<pageId>`) and Wikipedia
(`show=wiki/<lang>:<title>`) previews all route through the same `show=` param.

Optional deeper cleanup (not required; `show=` is already the single param):

- [ ] **Fold `gallery-viewer`/`wmc`/`wiki` state into `activeModal`.** Replace
      `gallery.activeImageId` / `wikimediaCommons.preview` / `wiki.preview` with
      `activeModal.type === 'gallery-viewer' | 'wmc' | 'wiki'` as the source of
      truth. Needs moving the `next`/`prev` resolution out of the
      `galleryRequestImage` reducer into a processor, and updating
      `showGalleryViewerSelector`, `GalleryViewerModal`, and the gallery
      delete/stars/comment processors. Higher churn, no user-visible change — only
      do it if the dual state becomes a problem.
- [ ] **Delete dead `src/features/documents/model/reducer.ts`.** Its `documentKey`
      slice is not wired into `rootReducer`; the document overlay now lives in
      `activeModal`.

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
      regenerate locale files.
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

## Idea for later — multi-property track chart

Generalize the elevation chart into a multi-property chart: X axis = time **or**
distance; Y axis selectable among elevation, speed, orientation/heading, GSM
signal, battery level, distance, time, … Applies to trackViewer and tracking
(and, where data exists, the planned route). The colorizer data adapters already
expose most of these series, so the chart and the colorizers could share one
per-track "series" extraction layer.
</content>
</invoke>
