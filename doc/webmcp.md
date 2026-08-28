# WebMCP: the app's tools for browser AI agents

`src/features/webMcp/` registers tools on
[`document.modelContext`](https://github.com/webmachinelearning/webmcp), so an
agent running in the user's browser can drive the running app — move the map,
search, plan a route — instead of guessing at a deep link. The agent never
touches an API of ours: every tool is a dispatch into the Redux store, so what
it changes is exactly what a click would change, and the browser mediates the
call and asks the user.

## The API

`document.modelContext.registerTool({ name, description, inputSchema, execute },
{ signal })`. `inputSchema` is JSON Schema for the argument object; `execute`
gets the parsed arguments and an options object carrying an `AbortSignal`, and
returns `{ content: [{ type: 'text', text }], isError? }`. Aborting the
registration `signal` unregisters the tool.

Two traps:

- **`navigator.modelContext` is the old spelling.** The interface moved to
  `document`; earlier `provideContext()` / `clearContext()` are gone.
- **Secure context and permissions policy.** The API exists only on HTTPS, and
  `Permissions-Policy: tools=()` (or a cross-origin iframe without
  `allow="tools"`) makes `registerTool` reject with `NotAllowedError`.

lib.dom has none of this yet, so the types are ours: `typings/webmcp.d.ts`,
ambient so no import is needed to type `document.modelContext`.

## Wiring

`attachWebMcp(store)` is called from `src/app/index.tsx` beside the other
`attach*` handlers, skipping an embedded map (someone else's page) and a
crawler. It returns immediately in a browser without `document.modelContext`,
and only then imports `tools/index.js` — so the whole tool set is a chunk that
nobody else downloads.

The store comes in through the tool context rather than a processor because
several tools have to **wait for a processor's answer**: they dispatch, then
`waitForState(store, select, { signal })` resolves on the first truthy value
read off a store subscription (30 s cap, and the agent's abort signal cancels
it). A processor's `handle` gets `dispatch` and `getState` but no `subscribe`,
so it cannot do this.

**A failure is a toast, not a state change.** A processor that throws is turned
into a `danger` toast by the middleware and dispatches nothing the tool is
waiting for — so `waitForState` also watches for a danger toast raised after it
started and rejects with its text. Without that, every failed search or route
came back as "the application did not answer in time" 30 seconds later. Any
danger toast counts, including one another feature happened to raise meanwhile.
The toasts already on screen are remembered **by object, not by id**: an error
toast carries a stable id (`objects`, `routePlanner`), so the same processor
failing twice reuses the key and an id-keyed snapshot would miss the second.

What each waits for:

- **search** and **describe-place** — `search.results` is a fresh array *and*
  `search.query` is the query asked for, so a stale answer for the previous
  query is not read as this one's. (`describe-place` is `searchSetQuery` with
  `@lat,lon`, which is what routes it to the map-details handler.)
- **route** — `routePlanner.resultKey` equals `routeKey(state.routePlanner)`
  taken right after the dispatch. That is the only field that says which
  waypoints the drawn line actually joins. The key alone, deliberately: a
  request the router cannot answer sets the same key with **no alternatives**,
  which the tool reports as no route found rather than waiting out.
- **objects** — a fresh `objects.objects` array. The fetch is edge-triggered on
  the categories and the map position, so `show-objects` clears the filter
  before setting it: re-asking for the categories already active would fetch
  nothing, and after the map moved the store still holds the previous view's
  objects. Below zoom 10 the fetch processor answers with an empty array and a
  toast, which the tool reports as the zoom being too far out.
- **map details** — `describe-place` also resolves on any non-danger toast
  raised meanwhile: a point with nothing on it is answered with a `warning`
  toast and no results at all, which is an answer (`found: []`) rather than a
  failure.
- **route elevation** is not a wait but the same trap from the other side:
  `renderGeojson` / `sampledGeojson` are lazy caches only the chart and
  colorize build, so `get-route-elevation` calls `ensureRouteRenderGeojson`
  itself — an OSRM route carries no elevation of its own to fall back on.

## Adding a tool

Write it in the matching `tools/*.ts` file with `defineTool`, and add the file's
export to `tools/index.ts`:

```ts
defineTool({
  name: 'set-map-view',
  description: 'Moves the map…',
  input: z.object({ lat: LatSchema.optional() }),
  execute({ lat }, { store, signal }) {
    store.dispatch(mapRefocus({ lat }));
  },
});
```

`defineTool` derives the JSON Schema from the zod schema (`z.toJSONSchema`),
validates the arguments the agent sent, JSON-encodes anything but a string that
the body returns, and turns a throw into an `isError` result — so a tool body is
just the dispatch and what it wants to say back. Keep the input schemas plain
(objects, enums, arrays, `.describe()`): they have to survive the JSON Schema
conversion.

Then **describe the tool in `src/static/llms.txt`** ("In-page agent tools"),
which is also what `get-app-guide` serves: it fetches `/llms.txt` and returns
one section of it, so an agent can read what a dialog does before opening it.
That file is the app's own documentation for assistants and the reason the tool
descriptions can stay short.

Descriptions and enum values are **English only**, deliberately — they are read
by a model, not by the user, and translating them would put 15 more strings per
tool through the locale files for nobody to read.

## Two helpers this feature extracted

Both were inline in a component, and a tool would have had to reimplement them:

- **`objectCategories(osmMapping)`** (`src/features/objects/`) — the POI
  categories, read off the localized tag-to-name mapping, with the comma-joined
  `key=value` filter `objectsSetFilter` holds. `ObjectsMenu` builds its dropdown
  from it and `list-object-categories` answers from it, so the filters an agent
  is offered are exactly the ones the menu switches on.
- **`elevationStats(geometry)`** (`src/shared/geoutils.ts`) — climb, drop and
  extremes of a line, segment by segment. `DataViewerDetails` shows it for a
  loaded track and `get-route-elevation` returns it for the planned route.

## Deliberately not tools

- **Anything an unattended agent could use as an API.** The tools exist only
  where a person is looking at the page; a program that wants a map should build
  a deep link (`doc/url-params.md`).
- **Isochrones and round trips**, which take parameter sets of their own, and
  restyling or editing what is drawn, which is an editor's worth of surface.
  Both are reachable through `open-tool` / `open-dialog` for the user to finish
  by hand.
- **Photos, my maps, live tracking, the GPS recorder, offline maps, panorama,
  toposcope, viewshed and the weather radar** — each is a device or account
  flow rather than something an agent should drive.
