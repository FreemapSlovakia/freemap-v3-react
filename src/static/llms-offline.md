## Offline use

**Without a connection** the app says up front what it cannot do: everything that needs the server — logging in and the account, photo upload and the photo leaderboard, the route finder, objects, map details, map changes, live tracking, the map legend, the exports the server produces, purchases and the links that open other websites — is disabled and marked with a crossed-out Wi-Fi symbol whose tooltip says it is unavailable offline; the dialogs of those functions head themselves with the same notice. In the layer menu, every map that has no downloaded tiles carries that symbol too. What works from local or cached data stays available: drawing and measurement, imported tracks and files, the language, saved maps flagged for offline use (and saving to them), offline maps, and the GPS recorder. The search box also stays usable, because coordinates, a bounding box, tile numbers (`zoom/x/y`) and pasted GeoJSON are all read locally; only searching by name, or by an OSM element id, needs the server, and only such a query takes the symbol in place of the search button — which is what stops it being submitted. Switching the photos layer on is likewise left alone: it is a local toggle, badged, and simply shows nothing.

Settings sit in between. A signed-out browser keeps them itself, so map preferences, custom maps and the layer configuration all save offline; a signed-in account keeps them on the server, where the copy fetched at the next sign-in would overwrite anything saved meanwhile, so those saves wait for a connection and say so. Signing out puts custom maps, map combinations and the layer configuration back to their defaults, so they don't pass to whoever signs in next; signing in takes the account's own, keeping what was set while signed out only where the account has nothing of that kind. What an offline map holds is the browser's own either way — renaming one, changing its icon or narrowing its area works offline, while enlarging it, downloading a new one or resuming an unfinished one does not. Logging out also waits for a connection, because it ends the session on the server and clears what the account left in this browser. That the app is offline at all is said once, by the same crossed-out Wi-Fi symbol standing beside the logo in the top toolbar.

### Offline maps

- Access: Manage maps button > Offline maps
- Keyboard shortcut: <kbd>m</kbd> <kbd>o</kbd>
- URL path: `/#show=offline-maps`

Caches selected map areas (tiles) in the browser for offline use. (This is different from "Offline maps export", which produces a downloadable MBTiles/SQLiteDB file.)

A cached map is not limited to what it holds. While there is a connection it behaves as the layer it was made from: it takes that layer's zoom range and its premium gate, and any tile it doesn't have — outside its area, deeper than it was downloaded, or not downloaded yet — is fetched from that layer's own server. Such tiles are only displayed, never added to the cached map. Without a connection the map falls back to being just what was downloaded: its own area and zoom range, with the deepest cached level scaled up beyond it. The form's **Fetch missing tiles from the internet** checkbox (on by default) governs this: unticked, the map is a sealed artifact that shows what was downloaded and nothing else, connection or not. With it ticked and no connection, a tile the map lacks is looked for in the browse cache below — the same tile may have been kept while browsing the source layer — before the map gives up on it.

The manager modal lists already-cached offline maps with their zoom range, tile count, scale, size and status (Ready, or incomplete with a percentage), and has buttons to modify, delete, and **Add offline map**. A ready map has an **Activate** button that switches the map layer on and zooms to its area; a map that is still downloading offers **Zoom to area** instead. A running download can be **Stop**ped, which halts it and keeps whatever has been cached so far; an incomplete map then offers **Resume**, which fetches only the tiles it is missing. **Delete** discards the map altogether, asking for confirmation first, and is available whether or not it is downloading.

The "Cache map for offline use" form heads itself with a notice that the map is stored in this browser on this device only, and lets the user choose:

- the map (layer) to cache — tile layers only; WMS layers cannot be cached
- the area: current visible area, or a rectangle drawn on the map
- a name
- an icon, picked from the same icon set the drawing points use (Font Awesome and the OSM POI icons). Caching a custom map starts from that map's own icon; the built-in layers have none to pass on. A map left without one shows the offline-map symbol (a pin with a check mark) wherever it is listed
- the zoom range. For a layer whose deepest zooms are premium, a non-premium user's range stops just short of them and a gem beside the field says why: cached tiles are kept for good and are shown with no connection, where no checkerboard applies, so downloading those levels needs premium access. Browsing them online is unaffected — the cached map shows the same checkerboard there as the source layer does.
- the scale (1×, 2×, … — only for layers that offer hi-DPI tiles; defaults to what the current screen displays). A cached map holds exactly one scale and is always drawn at it, regardless of the screen and of the resolution/feature-size preferences.
- whether missing tiles may be fetched from the internet (see above)
- whether to show the cached map in the menu and/or toolbar

It shows the estimated tile count and size before caching starts; the size is estimated by fetching a few real tiles of the selected layer, area, zoom range and scale. It warns about very large downloads and about downloads that would not fit in the browser's free storage.

**Modify** opens the same form seeded from an existing offline map, to change its name, icon, area, zoom range and menu/toolbar visibility. The map (layer) and the scale are fixed, since changing either would invalidate every stored tile. Widening the area or the zoom range downloads only the tiles that are missing; narrowing it deletes the tiles that fall outside. The form then shows both the map's total tile count and how many of them still have to be downloaded. Changing only the name touches no tiles.

Picking the rectangle option (in this form and in the map/document exports) hides the modal and lets the user drag the rectangle's corner, edge, and center handles on the map, confirming with **OK** or discarding with **Cancel** (<kbd>Esc</kbd>). The confirmed rectangle is remembered for the other export/cache forms until the page is reloaded; if it lies outside the current view, the map jumps to it.

### Cache while browsing

- Access: Manage maps button > Cache while browsing (also linked from the Offline maps list)
- Keyboard shortcut: <kbd>m</kbd> <kbd>b</kbd>
- URL path: `/#show=browse-cache`

A second, separate cache: the one ordinary map browsing fills. It covers every tile layer, is shared by all of them, and is off by default. Its options are **Serve tiles from** (Internet only / Internet, then cache / Cache, then internet / Cache only), **Save tiles fetched from the internet**, **Keep tiles for** (7 to 365 days, or until space runs out) and a **Cache size limit** (100 MB to 2 GB, or none) — over the limit the least recently shown tiles go first. "Cache, then internet" always shows a held tile at once, refreshing an expired one in the background rather than making the map wait. The screen shows how many tiles are held and how much space they take; the settings take effect on **Save**, and **Clear cache** (which asks for confirmation) empties the cache while leaving the settings alone. Layers whose tiles are served without CORS headers are left uncached, their size being unmeasurable.
