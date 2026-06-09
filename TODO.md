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
- [~] **Enable `noUncheckedIndexedAccess`.** Flag still off in `tsconfig.json`,
      but the array/coordinate-heavy hotspots are now cleaned up against it (error
      count 348 → ~180). Fixed two real `undefined` bugs it surfaced: a dead
      backward-compat branch in URL point parsing (`point[0][1]`), and a
      layer-parse loop in `urlMapUtils` that could throw / infinite-loop.
      Introduced `assertDef()` (`src/shared/assertDef.ts`) for must-exist lookups,
      preferred `for…of` + `.entries()` over index loops / `forEach`, and kept
      guards / `?? default` for genuine external input (never fabricate a
      valid-looking value). Remaining: flip the flag on globally and clear the
      long-tail errors across the other ~50 files.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
</content>
