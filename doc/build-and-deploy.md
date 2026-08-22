# Build & deploy gotchas

Non-obvious traps in the production build and the nginx serving layer. Consult before changing `rspack.config.ts`, the CSS pipeline, or the nginx vhosts.

## Production build is selected by `DEPLOYMENT`, not `--mode`

`rspack.config.ts` derives its `prod` flag from an env var, not the CLI flag:

```ts
const prod = 'DEPLOYMENT' in process.env && process.env['DEPLOYMENT'] !== 'dev';
const config = { mode: prod ? 'production' : 'development', /* … */ };
```

So `npx rspack build --mode production` does **not** produce a production build — `prod` stays `false`, `mode` is forced back to `development`, and you get dev `localIdentName` (`[path][name]__[local]`), unminified output, etc.

**To test real production output, set the env var:** `DEPLOYMENT=prod npx rspack build` (any value other than `dev`). Symptom of getting this wrong: CSS-module classes come out as readable `path-name__local` instead of opaque hashes, and you chase phantom config bugs.

## Native CSS nesting must be downleveled

Plain `.css` / `.module.css` files in `src/` use native CSS nesting (`&`). The rspack pipeline runs them through `css-loader` only — **no PostCSS/autoprefixer** — so nesting ships verbatim unless lowered. Browsers without nesting support (Firefox < 117 incl. **ESR 115**, Chrome < 112, Safari < 16.5) then drop those rules → broken layout (e.g. `&>*{pointer-events:auto}` on toolbars and `[data-bs-theme=dark] &` theming vanish).

CSS minification therefore uses `rspack.LightningCssMinimizerRspackPlugin` with a `cssTargets` browserslist array (`'firefox >= 115'`, …) in `rspack.config.ts`, **not** cssnano (`css-minimizer-webpack-plugin`), which does not downlevel nesting. LightningCSS flattens nesting and adds prefixes for those targets. JS is intentionally **not** downleveled — these browsers run the ES output fine; nesting was the only gap.

**Don't** revert to cssnano or remove `cssTargets`. Lowering only runs in the prod minifier, so dev (style-loader, modern browser) is unaffected — verify real output with `DEPLOYMENT=prod npx rspack build`, then grep `dist/*.css` for stray `&` (should be 0).

## A stylesheet reached only from lazy chunks is emitted into every one of them

There is no `splitChunks` CSS grouping, so a `.module.css` imported **only** by
lazily-loaded components is duplicated into each of their chunk stylesheets.
Loading the second such component appends that copy *after* the first
component's own CSS, and any pair of rules that disagree at equal specificity —
one class each — silently swaps winner.

That is what made the panorama's move grip revert to Bootstrap's muted style the
moment the toposcope was opened: both panels use
`shared/components/FloatingWindow.module.css`, whose `.move-handle` sets a
colour, and the panorama's own `.grip` overrides it — until a second copy of
`.move-handle` arrived after it.

**Dev cannot show this.** One bundle, one copy, nothing inserted afterwards; it
only appears in a real production build.

The fix is to give the shared stylesheet an eager importer — `Main.tsx` carries
a bare `import '@shared/components/FloatingWindow.module.css'` for exactly this
— which puts it in `main.css`: emitted once, and ahead of every feature
stylesheet, which is the order a shared base wants regardless.

`SingleCopyCssPlugin` in `rspack.config.ts` **warns** for every stylesheet under
`src/shared/` that reaches more than one chunk, naming them. Treat the warning as
"check whether anything overrides these rules", because the duplication only
bites when a feature stylesheet overrides a shared one **at equal specificity** —
one class each.

**Load order will not settle it for you.** The chunk-CSS runtime inserts a
stylesheet *relative to an existing link* — `n.parentNode.insertBefore(l,
n.nextSibling)`, not `head.appendChild` — so a lazily-loaded feature sheet can
land **ahead of `main.css`** and lose a tie it looks like it should win. Reading
the emitted CSS and reasoning "this one is fetched later, so it wins" is how the
panorama's grips were declared fixed twice while still being black in
production.

Two fixes, and which one applies depends on why the stylesheet is duplicated:

- **An eager importer**, where the users are top-level lazy components.
  `FloatingWindow.module.css` had three, and the import in `Main.tsx` removed it
  from all of them.
- **Raise the overriding rule's specificity**, so load order stops mattering at
  all. This is the only option when the stylesheet belongs to a shared
  *component*, since it follows that component into every chunk that uses it and
  no import changes that. (`optimization.removeAvailableModules` does not help
  either — those chunks do not all descend from one parent.)

`SelectToggle.module.css` is the second case and already takes the second fix: it
is one rule, written `.toggle.toggle` to outrank a Bootstrap selector, so nothing
the load order does can reach it. It is in the plugin's `benign` list for that
reason — a warning that fires on every build and is always fine teaches people to
skip the whole check.

Feature-local CSS reaching several chunks is not flagged: a message that renders
a component pulls it into all nine of that feature's language chunks, and only
one language is ever loaded, so those copies never meet.

## Typed CSS modules need the `.d.css.ts` naming

`*.module.css` files get a precise per-file declaration so `import classes from './x.module.css'` is typed with the actual class names instead of the loose `Record<string, string>` ambient fallback. The wiring (all in `rspack.config.ts` + `tsconfig.json` + `typings/global.d.ts`):

- **`cssModulesDtsLoader.js`** (a repo-root custom loader, à la `markdown-loader.js`) sits directly **above** `css-loader` in the `.module.css` rule, so it receives css-loader's JS output and parses the `___CSS_LOADER_EXPORT___.locals = { … }` object for class names. Placing it below `css-loader` gives it raw CSS and produces empty declarations.
- It emits **`x.module.d.css.ts`** — the `.d.<ext>.ts` form. Under `moduleResolution: nodenext`, TypeScript only finds a declaration for a `.css` import in that exact shape **and** only with **`allowArbitraryExtensions: true`** in `tsconfig.json`. The conventional `x.module.css.d.ts` sidecar (what off-the-shelf loaders like `css-modules-dts-loader` write) is silently ignored under `nodenext` — that's a dead end; don't reach for it.
- The declarations are **gitignored** (`**/*.module.d.css.ts`) and regenerated each build, so the loader always runs in emit mode (nothing committed for a "verify" mode to check on a clean checkout).
- The `declare module '*.css'` / `'*.scss'` ambients in `typings/global.d.ts` are still required — for **global** (non-module) stylesheet side-effect imports (`leaflet/dist/leaflet.css`, `./styles/index.scss`, …) and as a pre-build fallback for module CSS. Removing them yields `TS2882` errors. The generated `.d.css.ts` overrides the ambient for module imports when present.

Symptom of breakage: `classes['typo']` stops being a type error (the ambient `Record` is shadowing because no `.d.css.ts` resolved) — check the loader order, the `.d.css.ts` naming, and `allowArbitraryExtensions`.

## maplibre-gl's worker is a build-emitted asset, not a bundled module

Since v6, maplibre-gl no longer inlines its worker. It ships `dist/maplibre-gl-worker.mjs`, resolves it from `import.meta.url` at runtime, and that file `import`s `dist/maplibre-gl-shared.mjs` as a literal `./` sibling. Under a bundler `import.meta.url` points at the bundle, so the auto-detection yields `''` and `new Worker('')` — the map silently fails. rspack even bakes the build machine's `file:///home/…` path into the output. Consumers must call `setWorkerUrl()`; `MaplibreLayer.tsx` does, at module scope.

The wiring (`rspack.config.ts` + `maplibreWorkerLoader.js`):

- A rule matching `maplibre-gl-worker.mjs` makes it `type: 'asset/resource'`. It has to come **after** the generic `.mjs` rule, which would otherwise force it back to `javascript/auto` and bundle it as a module.
- `maplibreWorkerLoader.js` reads the shared sibling, emits it, and rewrites the worker's import to the emitted name. Nothing else can rewrite that specifier — it's inside an asset the bundler treats as opaque bytes. The loader errors out if the specifier ever disappears.
- Both are emitted as **`.js`**, not `.mjs`: nginx's stock `mime.types` has no `.mjs` entry, and a module worker served as `application/octet-stream` is rejected by the browser (it would also miss `gzip_types`).
- Both carry a **content hash**. The offline shell (`offlineStaticCache.ts`) only re-fetches assets whose URL changed, so stable names would pin an old worker against a new bundle after a redeploy.
- `TerserPlugin` **excludes** them. They're already minified, and re-minifying the two halves separately risks breaking the ESM bindings between them.
- `ignoreWarnings` drops maplibre's "Critical dependency: the request of a dependency is an expression" — that's the `new Worker(url)` call, which is the intended design here.

Cheap check that the pair still links after a maplibre bump: `cd dist && node --input-type=module -e "import('./maplibre-gl-worker.<hash>.js')"`. `ReferenceError: self is not defined` means the modules linked and only evaluation hit a browser global — that's a pass. A `SyntaxError` about a missing export means the two halves are mismatched.

Also note v6 requires WebGL2, so the vector layers are simply unavailable on devices that lack it.

## sentry-cli: the URL and the auth token must come from the same source

`pnpm sentry-sourcemaps` (run by `pnpm deploy`) uploads to the self-hosted **https://sentry.freemap.sk**, but the `--url` flag is deliberately **not** passed. sentry-cli ≥ 3 refuses to combine a server URL and an auth token that come from different configuration sources — CLI flag + `~/.sentryclirc` token gives:

```
WARN  Ignoring an auth token because the selected URL comes from a different configuration source.
error: Auth token is required for this request. Please run `sentry-cli login` and try again!
```

So the URL has to sit next to the token. Either put both in `~/.sentryclirc`:

```ini
[auth]
token=…
[defaults]
url=https://sentry.freemap.sk
```

or pass both through the environment (`SENTRY_URL` + `SENTRY_AUTH_TOKEN`) — e.g. in CI. Re-adding `--url` to the script breaks the file-based setup again, because the flag re-splits the two across sources.

## nginx cache headers

Live vhost configs are `etc/nginx/sites-available/www.freemap.sk` and `www.freemap.eu` (deployed under `/home/freemap/www`; no `.htaccess`). Rules that must hold:

- **Entry HTML must be `no-store`.** A `location ~ \.html$` rule covers `/index.html` and the `index-XX.html` variants. Without it browsers cache the entry HTML heuristically and pin users to stale hashed asset names → missing CSS / broken layout after a deploy.
  - Trap: putting the header only on `location = /` does **not** work — `/` is served via nginx's `index` directive as an internal redirect to `/index.html`, handled outside `location = /`, so those headers are dropped.
- **`sw.js`, `upload-sw.js`, `assets-manifest.json` → `no-store`** (unhashed; must never go stale).
- **Content-addressed assets → `max-age=31536000, immutable`.** The hashed-asset rule must match rspack's **16-char** hashes (`\.[a-z0-9]{16,}\.`); an older `{20}` rule never matched and left bundles uncached.
- **Plain `png`/`jpg` → bare `max-age`** (no `immutable`; they are reloadable, mutable names).

nginx `add_header` is replace-not-merge per level, and never put `immutable` on a mutable name (index.html, logos).

Related: the SEO bot-prerender routing in the same vhost is documented in [seo-prerender.md](./seo-prerender.md).
