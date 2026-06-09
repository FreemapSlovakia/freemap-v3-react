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

## Typed CSS modules need the `.d.css.ts` naming

`*.module.css` files get a precise per-file declaration so `import classes from './x.module.css'` is typed with the actual class names instead of the loose `Record<string, string>` ambient fallback. The wiring (all in `rspack.config.ts` + `tsconfig.json` + `typings/global.d.ts`):

- **`cssModulesDtsLoader.js`** (a repo-root custom loader, à la `markdown-loader.js`) sits directly **above** `css-loader` in the `.module.css` rule, so it receives css-loader's JS output and parses the `___CSS_LOADER_EXPORT___.locals = { … }` object for class names. Placing it below `css-loader` gives it raw CSS and produces empty declarations.
- It emits **`x.module.d.css.ts`** — the `.d.<ext>.ts` form. Under `moduleResolution: nodenext`, TypeScript only finds a declaration for a `.css` import in that exact shape **and** only with **`allowArbitraryExtensions: true`** in `tsconfig.json`. The conventional `x.module.css.d.ts` sidecar (what off-the-shelf loaders like `css-modules-dts-loader` write) is silently ignored under `nodenext` — that's a dead end; don't reach for it.
- The declarations are **gitignored** (`**/*.module.d.css.ts`) and regenerated each build, so the loader always runs in emit mode (nothing committed for a "verify" mode to check on a clean checkout).
- The `declare module '*.css'` / `'*.scss'` ambients in `typings/global.d.ts` are still required — for **global** (non-module) stylesheet side-effect imports (`leaflet/dist/leaflet.css`, `./styles/index.scss`, …) and as a pre-build fallback for module CSS. Removing them yields `TS2882` errors. The generated `.d.css.ts` overrides the ambient for module imports when present.

Symptom of breakage: `classes['typo']` stops being a type error (the ambient `Record` is shadowing because no `.d.css.ts` resolved) — check the loader order, the `.d.css.ts` naming, and `allowArbitraryExtensions`.

## nginx cache headers

Live vhost configs are `etc/nginx/sites-available/www.freemap.sk` and `www.freemap.eu` (deployed under `/home/freemap/www`; no `.htaccess`). Rules that must hold:

- **Entry HTML must be `no-store`.** A `location ~ \.html$` rule covers `/index.html` and the `index-XX.html` variants. Without it browsers cache the entry HTML heuristically and pin users to stale hashed asset names → missing CSS / broken layout after a deploy.
  - Trap: putting the header only on `location = /` does **not** work — `/` is served via nginx's `index` directive as an internal redirect to `/index.html`, handled outside `location = /`, so those headers are dropped.
- **`sw.js`, `upload-sw.js`, `assets-manifest.json` → `no-store`** (unhashed; must never go stale).
- **Content-addressed assets → `max-age=31536000, immutable`.** The hashed-asset rule must match rspack's **16-char** hashes (`\.[a-z0-9]{16,}\.`); an older `{20}` rule never matched and left bundles uncached.
- **Plain `png`/`jpg` → bare `max-age`** (no `immutable`; they are reloadable, mutable names).

nginx `add_header` is replace-not-merge per level, and never put `immutable` on a mutable name (index.html, logos).

Related: the SEO bot-prerender routing in the same vhost is documented in [seo-prerender.md](./seo-prerender.md).
