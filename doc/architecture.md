# Architecture & code-layout reference

A map of how this app is wired, so a change in one feature doesn't require
re-reading the whole tree. Read this before adding a feature, a side-effect, a
piece of persisted state, or a new menu/tool/modal.

## Big picture

React 19 SPA. **All application state lives in a single Redux store**; the store
is the source of truth and is reflected into the URL hash. Side effects do
**not** live in components or thunks — they live in *processors* (a custom
middleware, see below). The whole thing is bundled by **rspack** and split into
many lazy chunks.

```
src/
  app/            app shell, store wiring, routing-via-hash, top-level components
    store/        store.ts, rootReducer.ts, processors.ts, actions.ts, selectors.ts, middleware/
    url/          state <-> URL-hash synchronization
    components/   Main.tsx (the shell), Layers, Tools, Results, modals host
    hooks/
  features/<name>/   one self-contained feature per folder (see "Feature anatomy")
  shared/         cross-feature utilities, components, hooks, and the two registries
                  (mapDefinitions.tsx = layers, toolDefinitions.tsx = tools)
  translations/   global i18n master (en.tsx) + per-language files + Messages type
  processors/     a handful of cross-cutting processors not owned by one feature
  osm/, sw/, processors/, pica-gpu/, documents/, images/, static/
```

### Path aliases

Defined in **both** `tsconfig.json` and `rspack.config.ts` (keep them in sync):

| alias        | resolves to     |
| ------------ | --------------- |
| `@/*`        | `src/*`         |
| `@app/*`     | `src/app/*`     |
| `@shared/*`  | `src/shared/*`  |
| `@features/*`| `src/features/*`|
| `@osm/*`     | `src/osm/*`     |

Imports use the `.js` extension (NodeNext module resolution) even for `.ts`/`.tsx`
sources. `noPropertyAccessFromIndexSignature`, `noUnusedLocals/Parameters`, and
full `strict` are on. `noUncheckedIndexedAccess` is intentionally still off
(`// TODO one day` in `tsconfig.json`).

## Feature anatomy

A feature folder is the unit of organization. Typical shape:

```
features/<name>/
  components/        React components (menus, results, modals, toolbar buttons)
  model/
    actions.ts       createAction(...) creators (+ Zod schemas for persisted bits)
    reducer.ts       createReducer(...) + initialState + the slice's State type
    processors/      side effects keyed off this feature's (or others') actions
  translations/      OPTIONAL per-feature lazy i18n (see "Internationalization")
  hooks/             OPTIONAL feature-local hooks
```

Wiring a feature into the app is **explicit**, via three central registries:

1. **`src/app/store/rootReducer.ts`** — add the reducer to the `reducers` map.
   The slice key there is its key in `RootState`. If the slice should survive a
   reload, also add a `Persisted<X>Schema` + a rehydration block in
   `getInitialState()` (see "State persistence").
2. **`src/app/store/processors.ts`** — push every processor into the ordered
   `processors` array. **Order matters** (see processor middleware).
3. **`src/shared/mapDefinitions.tsx`** (layers) / **`src/shared/toolDefinitions.tsx`**
   (tools) and **`src/app/components/Main.tsx`** (lazy modal/menu factories), as
   applicable.

`RootState` is `ReturnType<typeof rootReducer>` — derived, not hand-written.

## The processor middleware (the central pattern)

`src/app/store/middleware/processorMiddleware.ts`. This is the project's answer
to redux-thunk/-saga/-observable. A **`Processor`** declaratively binds a
side effect (or a synchronous action rewrite) to actions and/or state changes:

```ts
export const fooProcessor: Processor = {
  actionCreator: someAction,           // a creator, an array of creators, or omitted (= any action)
  actionPredicate: (a) => boolean,     // extra gate on the action
  statePredicate: (s) => boolean,      // gate on current state
  stateChangePredicate: (s) => value,  // fires when the derived value changes vs prevState
  predicatesOperation: 'AND' | 'OR',   // how the gates combine (default AND)
  transform: ({ action, getState, dispatch, prevState }) => action | falsy,  // see below
  handle: async ({ action, getState, dispatch, prevState }) => { ... },      // the side effect
  errorKey: 'some.message.path',       // toast message key used if `handle` throws/rejects
  id: 'stable-id',                     // used as the toast id (dedupe) and for cancellation
};
```

Two phases per dispatched action:

- **`transform` runs *before* the reducer.** It may return a replacement action
  (mutate/redirect) or a falsy value to **swallow** the action entirely. Used for
  e.g. `setActiveModalTransformer`, `searchHighlightTrafo`.
- **`handle` runs *after* the reducer**, with both `prevState` and live
  `getState()`. Async handlers are awaited collectively; if any is still pending
  after a tick, a **progress spinner** is shown (`startProgress`/`stopProgress`)
  and a global processor-error toast + Sentry report covers unexpected rejections.
  When `errorKey` is set, a handler rejection becomes a localized `danger` toast
  instead. `AbortError` is treated as a silent cancellation.

Conventions:

- **Lazy handlers:** heavy `handle` bodies are split out — the registered
  processor is a thin stub that `await import('./xProcessorHandler.js')` and calls
  its default export (see `routePlanner/model/processors/findRouteProcessor.ts`).
  Keep the action-matching metadata in the stub so the chunk only loads when the
  action actually fires.
- **Cancellation:** processors register against `cancelRegister` / use an
  `AbortController`; the global `cancelProcessor` and toast-cancel wiring drive it.
- A processor can react to **another feature's** actions (e.g. route planner
  recomputes on `mapsLoaded`). That's normal and preferred over cross-imports of
  logic.

### Other middleware (order, from `store.ts`)

`errorHandlingMiddleware` → `statePersistingMiddleware` → websocket middleware →
**processorMiddleware** → tracking middleware. RTK's `serializableCheck` is
customized to allow `Date`, `File`, and `Error` in actions/state.

## State persistence

`statePersistingMiddleware` writes a curated subset of state to `localStorage`
(key `store`) via `local-storage-fallback`. Rehydration is in
`rootReducer.ts → getInitialState()`:

- Each persisted slice has its own `Persisted<X>Schema` (Zod) and is
  `safeParse`d independently, then merged over the slice's `initialState`. A bad
  blob for one slice never nukes the rest.
- **Legacy migrations live here**, e.g. `{ mapType, overlays } → { layers }`, and
  `parseWithFallback` reads older state that used to live under `main`.
- For schema-level backward compat, prefer the `<X>CompatSchema` (`z.preprocess`)
  pattern documented in the root agent file rather than inline narrowing.

Adding persisted state = add to the slice + add a `Persisted<X>Schema` and a
rehydration block here. Forgetting the block means the field silently won't
persist.

## URL ⇄ state synchronization

`src/app/url/` (`urlProcessor.ts`, `urlUpdating.ts`, `locationChangeHandler.ts`,
`urlMapUtils.ts`). The map position/zoom, active layers, tool, and several modal
flags are encoded in the URL hash (`#map=…`, `layers=…`, `#tool=…`, `#show=…`,
etc.). `urlProcessor` is the **last** processor in the array so it observes the
final state. `hashchange` is handled by `locationChangeHandler`. When you add
state that should be shareable/bookmarkable, wire it through here **and** update
the hash-param docs in `src/static/llms.txt`.

## Internationalization

Two layers — global and per-feature:

- **Global** (`src/translations/`): `en.tsx` is the master; `messagesInterface.ts`
  is the **hand-maintained** `Messages` type that all locales are checked against;
  `*.template.tsx` hold per-language overrides; plain `*.tsx` are **generated** by
  `pnpm sync-language-files` (gitignored, but required for `tsgo`). The loaded
  bundle lives in a small subscribable module store (`features/l10n/messagesStore.ts`);
  components read it via `useMessages()` (backed by `useSyncExternalStore`), and
  non-React callers use `getMessages()`. See the root agent file for the full
  add-a-string checklist.
- **Per-feature lazy** (e.g. `features/routePlanner/translations/`): a feature can
  own its own message bundle, code-split per language, to keep it out of the global
  blob. Pattern: `<Feature>Messages.ts` (the type) + `use<Feature>Messages.ts`
  (`useLocalMessages(factory)` for components) + `load<Feature>Messages.ts`
  (a cached promise for use **outside** React — processors, exporters). The dynamic
  `import(\`./${language}.tsx\`)` excludes `.template.` files.
  Gotcha: toast `messageKey`s referenced from processors must resolve against the
  **global** `Messages`, so those namespaces stay global even when the rest of the
  feature's strings are lazy.

## The two registries to keep honest

- `src/shared/mapDefinitions.tsx` — the layer registry (ids, zoom ranges, premium
  thresholds, credits, keyboard shortcuts, countries, base/overlay). The most
  drift-prone file; mirrored in `src/static/llms.txt` and (for POI icons) shared
  by filename with the `freemap-outdoor-map` renderer.
- `src/shared/toolDefinitions.tsx` — the tool list (id, icon, message key, keyboard
  shortcut, whether it's a drawing tool). `Tool` itself is a Zod enum in
  `src/app/store/actions.ts`.

## Lazy loading / code splitting

Modals and tool menus are loaded on demand via `import()` factory functions
declared at the top of `Main.tsx` (each with an explicit
`/* webpackChunkName */`). The lazy-modal infrastructure is described in the
`project_async_modals` memory: to find a modal's real source file, resolve its
factory in `Main.tsx` rather than grepping for a static import.

## Build & tooling (pointers)

- **rspack** (`rspack.config.ts`) builds; prod build is selected by the
  `DEPLOYMENT` env var, **not** `--mode` — see `doc/build-and-deploy.md`.
- `pnpm start` / `pnpm build` first run `build:proto` (protobuf → TS for the
  gallery) and `sync-language-files`, then type-check with **`tsgo`** (the native
  TS preview, not `tsc`) and bundle.
- **Biome** is the linter/formatter and enforces import order — never hand-sort
  imports; run `npx biome check --write <files>` after edits.
- SEO prerender / sitemap and the per-language `index-<lang>` HTML variants are in
  `doc/seo-prerender.md`.
</content>
</invoke>
