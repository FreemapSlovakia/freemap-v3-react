## In-page agent tools (WebMCP)

When the page is open in a browser whose AI agent supports [WebMCP](https://github.com/webmachinelearning/webmcp), the app registers tools on `document.modelContext` that let the agent drive the map directly instead of building a URL. They act on the running app — what they change is what the user sees — and the browser mediates every call.

| Tool | What it does |
| --- | --- |
| `get-app-guide` | Reads this document, section by section: the app's functions, the layer registry, and the deep-link parameters. |
| `get-map-view` | The current centre, zoom, visible bounding box, layers, and the shareable URL of that state. |
| `set-map-view` | Moves the map to a centre and/or zoom. |
| `fit-map-to-area` | Zooms so a given bounding box fits the screen. |
| `list-map-layers` | The layer codes, their names, base/overlay, minimum zoom and premium threshold. |
| `set-map-layers` | Switches the base map and the overlays. |
| `search-places` | Runs the search box — by name, category, OSM element id, coordinates, bounding box or pasted GeoJSON — and returns the results with their coordinates. |
| `show-search-result` | Draws one of those results on the map and moves to it. |
| `clear-search-results` | Empties the result list and takes the results off the map. |
| `plan-route` | Plans a route through given waypoints (transport type, ordered route or shortest trip) and returns its length and time. |
| `get-route-itinerary` | The turn-by-turn steps of the planned route. |
| `list-object-categories` | Finds POI categories by name in the UI language; each row carries the filter `show-objects` takes. |
| `show-objects` | Shows POIs of the given categories within the current map view and returns what was found (zoom 8 or closer). |
| `describe-place` | What is at a point: the nearest addressable place, the OSM elements there, and the areas containing it. |
| `add-marker` | Puts a labelled, coloured, icon-bearing marker on the map. |
| `draw-line` / `draw-area` | Draws a line or a filled area through given points. |
| `list-drawings` / `remove-drawing` | Lists what is drawn, and removes one by index. |
| `open-drawing-tool` | Opens a drawing toolbar so the user can carry on by hand. |
| `get-elevation` | Heights above sea level of given points, from the terrain model. |
| `sample-elevation-grid` | Reads the terrain model over a rectangle on a regular grid in one call (up to 50 000 points), optionally with slope and aspect per cell. |
| `find-objects-in-area` | Finds POIs of given categories inside any bounding box and reports them back without touching what the map shows. |
| `get-route-elevation` | Climb, drop and the highest and lowest point of the planned route. |
| `get-map-features` | Everything on the map as one GeoJSON FeatureCollection. |
| `download-map-features` | Saves what is on the map as GPX, GeoJSON or KML. |
| `open-tool` / `close-tool` | Opens or closes one of the app's tools. |
| `open-dialog` | Opens one of the app's dialogs for the user to carry on in themselves. |
| `clear-map` | Takes everything the user put on the map off it. |
| `get-app-state` | The open tools and dialog, the selection, the UI language and who is signed in. |

The bulk readers — `sample-elevation-grid`, `find-objects-in-area` and `get-map-features` — also take `deliver: "download"`, which writes the answer to a JSON file instead of returning it, for a result too large to carry back through the agent's own channel.

The tools are not registered in an embedded map (`/embed`), and there is no HTTP API behind them: an agent that is not running in the user's browser should build a deep link instead (see "Deep links" in [llms.txt](/llms.txt)).
