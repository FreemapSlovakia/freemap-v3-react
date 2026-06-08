# TODO / improvement backlog

Project-review findings (2026-06-08). Roughly ordered by payoff. See
[`doc/architecture.md`](./doc/architecture.md) for the surrounding context.

## Committed work

- [ ] **Add automated tests.** No test runner is configured. Highest-value,
      lowest-friction targets are pure and deterministic:
      `getInitialState()` legacy migrations, the `Persisted*Schema` parsers, and
      reducers. A regression in localStorage rehydration silently wipes user
      settings. Suggest Vitest + a starter set of schema/reducer tests.
- [ ] **Reduce the manual central registries.**
      `src/app/store/processors.ts` is a ~190-line hand-maintained array (merge
      magnet) and `getInitialState()` repeats the same safeParse-then-merge block
      ~15×. Make the persistence blocks table-driven (`[{ key, schema, initial }]`
      looped) to remove the "forgot the rehydration block" footgun. Keep processor
      *order* explicit (it's significant), but consider per-feature `processors`
      exports collected centrally to cut conflicts.
- [ ] **Enable `noUncheckedIndexedAccess`.** Currently `// TODO one day` in
      `tsconfig.json`. Heavy array/record indexing (layers, tiles, coordinates)
      means it would catch real `undefined` bugs. Sizable one-time cleanup.

## Softer / design opinions

- [ ] **Derive `Messages` from `en.tsx`.** `src/translations/messagesInterface.ts`
      is hand-maintained against the master and can drift. Explore deriving the
      type from `typeof en` (or a codegen step) so `en.tsx` is the single source.
- [ ] **Rework `useMessages()` global.** It reads a mutable `window.translations`
      with reactivity faked via an l10n counter selector. Works, but fragile and
      untyped at the boundary; a context/store-backed source would be cleaner.
- [ ] **Minor processor-middleware cleanups.** Internal `any` casts;
      `Math.random()` for fallback toast IDs; duplicated transform/handle predicate
      logic. Low priority.
</content>
