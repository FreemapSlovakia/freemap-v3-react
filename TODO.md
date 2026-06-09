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
  also absorbed the duplicate `mapToDocumentExport.areas` strings). Toast/`errorKey` references that previously forced strings to stay global can be moved too: a processor dispatches the toast with a literal `message:` resolved via `load<Feature>Messages(language)` (as `wikimediaCommons` now does) instead of a global `messageKey:`. Still global-bound: toast `messageKey`s/`errorKey`s whose value is a JSX-returning function dispatched from a place that can't resolve local messages (toast `message` is typed `string`).

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
      </content>
