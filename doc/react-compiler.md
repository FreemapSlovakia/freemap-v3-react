# React Compiler

The app is compiled with the React Compiler, which memoizes components and their
intermediate values automatically. `Main` subscribes to some forty selectors and
renders the whole tree beneath it, so without it any store change re-rendered
every marker on the map.

## Wiring

- **`rspack.config.ts`** — `jsc.transform.reactCompiler: true` on the
  `builtin:swc-loader` rule. SWC runs the compiler natively, so there is no Babel
  pass. It needs React 19 for `react/compiler-runtime`.
- **`eslint.config.mjs`** + `pnpm lint:react` — ESLint exists here **only** to
  report React Compiler diagnostics. Biome owns everything else, including
  `exhaustive-deps` (`useExhaustiveDependencies`) and `rules-of-hooks`
  (`useHookAtTopLevel`), so those two rules are off.
- The parser is `@babel/eslint-parser`, not typescript-eslint, which caps at
  `typescript <6.1.0` while this project builds with 7. No type information is
  needed: the compiler rules re-parse the source with their own bundled Babel, so
  the ESLint parser only has to hand them the text.

## The bail-out is per function

When the compiler meets something it cannot handle it **skips that whole
function** and leaves it exactly as written. That is the safety mechanism, and
most `lint:react` warnings mean "not optimized" rather than "broken".

Two consequences:

- A `useMemo`/`useCallback` inside a skipped function is the **only** memoization
  it has. Removing manual memoization is safe only where the compiler actually
  lowers the code — check that the emitted output contains
  `react/compiler-runtime`, and that the value is still assigned from a `tN` temp
  written into a `$[n]` cache slot.
- An `eslint-disable` naming a `react-hooks/*` rule reads as an opt-out and skips
  the enclosing function. Don't leave stale ones around.

Opt a component out deliberately with `'use no memo'` as the first statement of
its body.

## What actually goes wrong

The compiler keys each memo block on the values it can *see*. Three traps, all
found in this codebase:

**A value read during render from a source the compiler cannot see gets frozen.**
Leaflet view state, DOM measurements, `document`/`window` properties,
module-level mutable variables. `BearingLine` measures in screen pixels off the
live map, so it opts out. `MapControls` reads Leaflet's live min/max zoom, which
follows the attached layers, so it opts out too. Worst case was `Panorama`, which
called `getPanoramaRenderData()` — a bare call with no reactive input, which the
compiler cached against the memo-cache *sentinel*, i.e. once per mount — so the
rendered picture never appeared. The fix is to make the read reactive:
`renderHolder.ts` notifies and the component subscribes with
`useSyncExternalStore`, as `auth/pictureCacheBust.ts` does.

Keying a `useMemo` on a value its body never mentions is **not** a fix. It
appears to work only because the compiler then bails out on the whole component,
and `lint:react` flags it as an extra dependency — a later version could drop it
and the bug returns.

**State that exists only to force a re-render stops working.** `MapControls` had
a `forceUpdate` counter so it would re-read `document.fullscreenElement`. The
compiled memo guard rightly omitted it, since the JSX never reads its value, so
the button kept the wrong icon. Hold the real state instead.

**A binding that shadows an intrinsic tag name renames the tag.** In
`LongPressTooltip` a map parameter named `kbd` made the compiler emit
`<kbd_0>`, an unknown element, losing the styling. Upstream bug; avoid shadowing.

## Checking the output

Reading the source cannot catch the last two — only the emitted code shows them.
`scripts/react-compiler-check.mjs` does both checks:

- `node scripts/react-compiler-check.mjs rewrites` compiles every file with the
  compiler on and off and compares the emitted string literals. Anything the
  compiler invented is a rewrite bug. Expect zero.
- `node scripts/react-compiler-check.mjs unchanged [ref]` compiles the files
  changed against `ref` before and after, and reports which emit byte-identical
  JavaScript. It is how the `useCallback` removal was shown to be a semantic
  no-op: 50 of 52 files byte-identical, the other two losing only a discarded
  property read left over from evaluating a dependency array.

To inspect one file:

```
node -e "import('@swc/core').then(async({transformFile})=>{const {code}=await transformFile('src/…/X.tsx',{jsc:{parser:{syntax:'typescript',tsx:true},transform:{react:{runtime:'automatic'},reactCompiler:true}}});console.log(code)})"
```

## Manual memoization

Redundant wrappers have been removed where the compiler provably replaces them.
Keep them where identity is load-bearing rather than a performance hint — the
compiler's memoization is a performance guarantee, not a semantic one:

- named in a dependency array, or passed to something that stores or compares it;
- returned as a value from a hook, where a caller may depend on its identity;
- reaching react-leaflet, which compares props such as `position` by reference,
  and whose `useEventHandlers` rebinds on identity change. `RichMarker` keeps its
  `faIcon` ref cache for this reason: rebuilding the icon reaches Leaflet's
  `setIcon`, which replaces the marker's drag handler mid-gesture.

Named handlers and inline arrows in JSX are memoized identically — the choice is
readability, and this codebase prefers named `handleX` consts.
