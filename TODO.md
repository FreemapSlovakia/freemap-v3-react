# TODO / improvement backlog

Project-review findings (2026-06-08). Roughly ordered by payoff. See
[`doc/architecture.md`](./doc/architecture.md) for the surrounding context.

## Committed work

- [~] **Add automated tests.** Vitest + jsdom now configured (`vitest.config.ts`,
      `pnpm test`). Starter characterization tests pin the persistence layer:
      `getInitialState()` legacy migrations + `parseWithFallback` + per-slice
      isolation + merge-over-initialState, the `Persisted*Schema` parsers, and
      the save side / round-trip (`statePersistingMiddleware`). Still TODO: pure
      reducer tests, and widening coverage beyond persistence.
- [ ] **Enable `noUncheckedIndexedAccess`.** Currently `// TODO one day` in
      `tsconfig.json`. Heavy array/record indexing (layers, tiles, coordinates)
      means it would catch real `undefined` bugs. Sizable one-time cleanup.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
</content>
