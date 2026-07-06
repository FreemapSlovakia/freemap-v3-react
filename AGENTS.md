# Project notes for AI agents

(This file is also exposed as `CLAUDE.md` via a symlink so Claude Code loads it.)

## Reference docs

Deeper format/architecture references live in [`doc/`](./doc/). Consult them before designing changes in the same area:

- [Architecture & code-layout reference](./doc/architecture.md) — the feature-folder convention, the Redux store wiring (`rootReducer.ts` / `processors.ts`), the **processor middleware** that owns all side effects, state persistence + rehydration, URL-hash sync, the global vs. per-feature i18n split, path aliases, and the layer/tool registries. **Read this before adding a feature, a side effect, persisted state, or a new menu/tool/modal — it saves re-reading the tree.**
- [Drawing feature export/import format mapping](./doc/drawing-export-mapping.md) — GPX/GeoJSON write+read for drawing points/lines/polygons, the `fm:*` lossless-shadow design, and the curated Garmin/OsmAnd icon dictionaries. **Read this before changing anything in `src/features/export/` or in the drawing-conversion processors.**
- [Track data: import, elevation, colorize, export](./doc/elevation-and-colorizers.md) — the shared elevation-acquisition layer (`src/shared/elevation.ts`: `fetchElevations`/`enrichElevations`/`densifyAlong`), the shared colorizers (`src/shared/colorizers/`, `isAvailable`-gated per feature), the render-only densified geometry that's never exported, the per-consumer elevation policy (route auto-fill vs. track prompt vs. tracking keep-recorded), and KML/KMZ/TCX import + lossless GeoJSON↔GPX transfer. **Read this before touching elevation, colorize, the elevation chart, or track-file import/export across routePlanner/trackViewer/tracking/mapFeaturesExport.**
- [SEO bot-prerender architecture](./doc/seo-prerender.md) — how crawlers get static HTML snapshots while humans get the SPA: the `sitemap-generator/` (homepages, layer/tool hub pages, per-feature POI pages), the nginx `/__prerender` routing, and the `rspack` `index-<lang>` variants. **Read this before changing `sitemap-generator/`, the sitemap/robots wiring, or the bot routing in the nginx vhost.**
- [Build & deploy gotchas](./doc/build-and-deploy.md) — the `DEPLOYMENT` env var (not `--mode`) selects the prod build, native CSS nesting must be downleveled via LightningCSS, and the nginx cache-header rules (entry HTML `no-store`, only hashed assets `immutable`). **Read this before changing `rspack.config.ts`, the CSS pipeline, or the nginx vhosts.**
- [UI conventions](./doc/ui-conventions.md) — what each react-bootstrap button `variant` means by role (`dark` = dismiss/close, `primary` = main CTA, `secondary` = default neutral action, `danger` = destructive, `outline-primary` = toggle, `warning` = upsell). **Read this before picking a `variant` for a new `<Button>`.**
- [Foreign-growth promotion roadmap](./doc/promotion-roadmap.md) — data-driven plan (from Matomo country/language/referrer cuts) for growing usage and premium conversions outside Slovakia: which markets to target (Italy, Poland, Hungary, Austria, …), which UI languages to add next (Slovenian, then French), and the phased outreach steps. **Read this before working on foreign promotion, deciding the next UI localization, or interpreting the audience analytics.**

## Keeping `llms.txt` in sync

[`src/static/llms.txt`](./src/static/llms.txt) is a hand-maintained, user-facing description of the app for AI assistants. It is **not** generated, so it drifts unless updated deliberately. When a change touches user-visible behavior, update the matching part of `llms.txt` in the same change set:

- **Map layers** (`src/shared/mapDefinitions.tsx`) — the "Layer registry" tables (ids, zoom levels, premium-from-zoom, credits, shortcuts, countries, base/overlay). This is the most drift-prone area.
- **Menu / tools / modals** — added, removed, or renamed main-menu items, tools, toolbars, keyboard shortcuts, URL hash params (`#show=…`, `#tool=…`, `layers=…`), or login/export providers. Cross-check labels against `src/translations/en.tsx`.

If a change makes `llms.txt` wrong but you can't fully fix it, say so explicitly rather than leaving it silently stale.

## Workflow

- **Do not commit until I explicitly approve.** Leave the working tree dirty at the end of a task and wait for "commit"/"looks good"/similar. This overrides any "commit when done" instinct.
- **When I tell you to commit, add yourself as co-author** via a `Co-Authored-By: Claude <noreply@anthropic.com>` trailer in the commit message.
- **Run `npx biome check --write <changed files>` after every change set**, before reporting completion. The project uses Biome with import-order enforcement, so manually arranging imports is wasted effort. Pair with `npx tsgo --noEmit -p .` for type safety.
- **Comments describe current behavior, not history.** Write comments, JSDoc, and test names in the present tense about what the code does now. Don't narrate how it used to work or what a refactor changed (no "previously…", "no longer…", "used to live under…", "dropped from…"). Change history belongs in the commit/diff, not in the source. (A backlog/changelog entry like `TODO.md` may use past tense — it's an explicit record of work done.)

## Translations

For locale changes in `src/translations/`, edit the `*.template.tsx` files (e.g. `sk.template.tsx`, `de.template.tsx`), **not** the plain `*.tsx` files.

- `en.tsx` is the master — add new English strings there.
- **Also add the key's type to `src/translations/messagesInterface.ts`** — this is a hand-maintained (NOT generated) `Messages` type that `en.tsx` and every generated `<lang>.tsx` are typed against. Omitting it makes `tsgo` fail on `en.tsx` ("may only specify known properties") and on each plain locale ("missing properties").
- `<lang>.template.tsx` files use `DeepPartialWithRequiredObjects<Messages>`; missing keys fall back to English.
- The plain `<lang>.tsx` files are generated by `pnpm sync-language-files` (runs as part of `pnpm start` and `pnpm build`) and will be overwritten. They are gitignored, so regeneration is invisible in `git status` but still required for `tsgo` to pass.

### Adding a new language

`translation-manager/scaffold-language.mjs <lang>` scaffolds every `<lang>.template.*` (all feature folders + the global `src/translations/` + the osm mapping) from the English masters: string leaves are dropped so `sync` emits them as `TODO translate` blocks with sibling-language hints, while non-string leaves (functions/JSX) are copied verbatim as English placeholders to translate by hand. Then wire the code up:

Source-language note: Slovak (native quality) and Czech are the best sibling hints, so Slavic targets (e.g. `sl`) translate fast and review easily. Distant targets have no close sibling in the set — French's nearest is Italian (Romance but not close, and only partly human-translated) — so they're a heavier from-scratch pass and warrant closer review.

- **`src/shared/langUtils.ts`** — add the code to the `languages` tuple (drives the `Language` type, so most `Record<Language, …>` sites become `tsgo` errors until updated — those are the safe ones).
- **`src/features/mainMenu/components/LanguageSubmenu.tsx`** — add the endonym to `languageNames`, and a `flagCountries` entry ONLY if the flag's country code differs from the language code (e.g. `sl` → `si`; `fr` → 🇫🇷 matches, so no entry).
- **`translation-manager/templates.json`** — add the code to `langs` so `sync` generates its files.
- **`src/translations/<lang>-shared.ts`** — hand-written SEO title/description (NOT sync-managed).
- **`src/osm/osmTagToNameMapping-<lang>.template.ts`** — the `colorNames` export is NOT sync-managed; translate it by hand.
- **Hardcoded language allowlists** — plain `string[]` gates that `tsgo` will NOT catch, so grep for them. Known one: `getOsmMapping` in `src/osm/osmNameResolver.ts` (`['sk','cs','it','hu','de','pl',…]`) — omitting the new code silently leaves all OSM POI names in English even though the mapping file exists. Also `src/routers/gallery/postPictureCommentHandler.ts` in the **freemap-v3-api** repo has a `Lang` union + `acceptsLanguages([...])` list; the other API email handlers key off `Object.keys(translations)` and need only a new `translations` entry.

## Settings slices

Persisted **user preferences** (default styles, colorize modes, legend toggles, filter prefs) belong in a dedicated `*Settings` slice — e.g. `drawingSettings`, `objectsSettings`, `searchSettings`, `trackViewerSettings` — **not** in the feature's transient slice.

A transient feature slice resets on `clearMapFeatures` (and its own `*Delete`/`*Clear` actions). A persisted pref kept there gets clobbered by that reset, and `statePersistingMiddleware` then writes the default back to localStorage — silently losing the user's choice. Preserving it with a per-handler `{ ...initialState, pref: state.pref }` spread is the fragile pattern this avoids (easy to forget when a new reset path is added); a dedicated settings slice is never reset, so it needs no preservation.

To add one: create `model/settingsReducer.ts` in the feature folder, register it in `rootReducer.ts`, and add a `PERSIST` entry in `persistence.ts`. Shared style helpers live in `src/features/drawing/`: `makeDrawingStyle` (default `DrawingStyle` factory), `useDrawingStyleEditor` (the color/width/dash/cap/join/marker editor hook), and `drawingStyleToPathOptions` (RGBA `DrawingStyle` → Leaflet `PathOptions`). Some prefs still live in transient slices and should migrate — see `TODO.md`.

## Zod conventions

**Schema composition:** prefer the shape-spread form over `.extend()`:

```ts
const DogWithBreed = z.object({
  ...Dog.shape,
  breed: z.string(),
});
```

Reads as an explicit composition, swaps cleanly between `z.object` / `z.strictObject` / `z.looseObject`, and matches the zod docs. Combines with `.omit()`: `z.object({ ...Base.omit({ x: true }).shape, x: NewX })`.

**Backward-compat migrations:** wrap the strict schema with `z.preprocess` and name the wrapped variant `<X>CompatSchema`. Keep the strict `<X>Schema` as the source of truth.

```ts
export const UserSettingsCompatSchema = z.preprocess(
  (s) => { /* migration */ return s; },
  UserSettingsSchema,
);
```

This keeps callers free of inline `typeof === 'object' && ... && Array.isArray` narrowing, and co-locates the migration with the schema it migrates into. Apply whenever a caller does manual narrow-then-mutate-then-safeParse against a strict schema (e.g. legacy `customLayers` upgrade).

**GeoJSON schemas:** use the `zod-geojson` package — don't hand-roll them. Key exports: `GeoJSONFeatureCollectionSchema`, `GeoJSONFeatureSchema`, `GeoJSONGeometrySchema`, individual geometry schemas (`GeoJSONPointSchema`, `GeoJSONLineStringSchema`, …), `GeoJSONPositionSchema`, `GeoJSONBBoxSchema`, `GeoJSONSchema` (root union), plus 2D/3D variants of each. Inferred types are exported alongside (`GeoJSONFeatureCollection`, etc.).
