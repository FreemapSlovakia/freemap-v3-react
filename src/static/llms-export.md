## Sharing and export

### Share / Open in external app

- Access: Main menu > Share / Open in external app

Opens a submenu:

- Copy page URL <kbd>j</kbd> <kbd>c</kbd>
- Share location
- OpenStreetMap <kbd>j</kbd> <kbd>o</kbd>
- JOSM <kbd>j</kbd> <kbd>j</kbd>
- iD <kbd>j</kbd> <kbd>i</kbd>
- Osmose
- Mapy.com <kbd>j</kbd> <kbd>m</kbd>
- Google Maps <kbd>j</kbd> <kbd>g</kbd>
- Apple Maps <kbd>j</kbd> <kbd>a</kbd>
- Waze
- Google Street View <kbd>j</kbd> <kbd>s</kbd>
- Mapillary <kbd>j</kbd> <kbd>l</kbd>
- Panoramax <kbd>j</kbd> <kbd>x</kbd>
- F4Map <kbd>j</kbd> <kbd>4</kbd>
- Peakfinder <kbd>j</kbd> <kbd>p</kbd>
- Strava
- Geocaching
- Windy <kbd>j</kbd> <kbd>w</kbd>

Targets with data in one country only appear when the shared place lies in it:

- OMA (SK)
- Hiking.sk (SK, CZ) <kbd>j</kbd> <kbd>h</kbd>
- ZBGIS (SK) <kbd>j</kbd> <kbd>z</kbd>
- ČÚZK (CZ)
- basemap.at (AT)
- Geoportal (PL)
- Atlas okolja (SI)
- Geoportale Nazionale (IT)
- ARKOD (HR)
- Géoportail (FR)
- Iberpix (ES)
- MapasPT (PT)
- Topomapviewer (BE)
- PDOK (NL)
- Norgeskart (NO)
- Min karta (SE)
- Karttapaikka (FI)

### Map export to image/document

- Access: Main menu > Map export to image/document
- Keyboard shortcut: <kbd>e</kbd> <kbd>p</kbd>
- URL path: `/#show=map-to-document-export`

Opens a modal to export the map as an image or document. Options:

- Export area: visible area, or a rectangle drawn on the map
- Format: JPEG, PNG, WebP, PDF, or SVG. JPEG and WebP take a quality (0–100), each remembering its own (JPEG 90, WebP 80); WebP's quality field is preceded by a joined **Lossless** / **Lossy** pair, defaulting to Lossless, which is a different codec and takes the number away — on a map render it is both exact and usually smaller than lossy at any quality
- Map resolution (DPI)
- Server-rendered layers:
  - **Base map** toggle button — on, the whole map is drawn; off, only the selected optional layers are, over transparency
  - **Leave out** (with the base map on) — ground cover (land cover, sea, water, piers, bridges, solar plants, trees) and buildings, each dropped to transparency, for laying the map over an aerial image
  - **Optional layers** added on top: contours, shaded relief, hiking/bicycle/ski/horse trails, hiking difficulty (SAC scale), MTB difficulty (S0–S6), road smoothness, guideposts
  - Anything short of the whole map needs a format with transparency (PNG, WebP or SVG); JPEG and PDF are disabled then, and a chosen one gives way to WebP — switched to lossy when it replaces JPEG, so the compression the user picked is kept
- Own map-feature sources to draw on top (only those with data are selectable, same set as the map data export): found route (always with its start/finish/stop markers), objects (POIs), photos, drawing lines/areas/points, live tracking, imported GPX track, highlighted map feature
- Glow: optional glow/shadow drawn around all own map-feature markers and lines, with configurable color (incl. opacity) and width
- Marker size: configurable pixel size of own map-feature point markers
- Labels: configurable color (no opacity), size, and weight of own map-feature labels
- Drawing order: Topmost or Natural

While the export runs the modal stays open with its controls disabled and a spinner on the export button; only Cancel stays active (cancelling asks for confirmation and aborts the request).

When the export finishes the modal switches to a result view in place of the options, naming the file and its size and listing the credits it must be shown with: Freemap, then whatever the exported features earn (the routers, when a planned route is included), then OpenStreetMap and the datasets the render reports having actually drawn from, the global fallback models last (codes the licence catalog cannot name are listed as they stand). A route routed by OSRM adds FOSSGIS' "report a map error" link, which is shown but not copied — it is a link or it is nothing. The attribution burnt into the image is composed by the renderer from the same list, in the same order, so the two agree. The file is not downloaded by itself: a **Save** split button saves it, with **Open in a new tab** (not for SVG) and **Copy attribution** behind its caret. Saving closes the modal and leaves a toast repeating the credits, so they survive the window they were read in. Closing the result without saving it — Close, <kbd>Esc</kbd> or the backdrop — asks for confirmation first, since the render would be lost; having opened it in a tab counts as having it and skips the question.

### Map data export

- Access: Main menu > Map data export
- Keyboard shortcut: <kbd>e</kbd> <kbd>g</kbd>
- URL path: `/#show=map-features-export`

Opens a modal to export the user's own map data as a GPX, GeoJSON or KML file. The KML option emits a self-contained KMZ (zipped KML plus packaged PNG marker icons) when point icons are present, and a plain KML otherwise. Exported drawing features round-trip losslessly back into Freemap — style, icon, label, the line/polygon distinction and polygon holes are preserved (GeoJSON and KML carry holes as interior rings natively; GPX, which has no polygon type, carries them as sibling tracks linked by a private extension) — and for other apps the marker icons and styles are additionally mapped to their nearest Garmin (BaseCamp), OsmAnd and Locus equivalents so they still render sensibly. Only the data types that actually have something on the map are selectable:

- found (planned) route, optionally including stops
- objects (POIs)
- photos (in the visible map area)
- drawing — points, lines, polygons
- live tracking
- tracks and data
- highlighted map feature

When a single map feature is selected (a drawing point/line/polygon, an object, a track, the planned route, or a lookup result), an **Only the selected item** toggle appears (on by default) that narrows the export to just that one feature instead of its whole source.

For the file/share/Google Drive/Dropbox targets an **Elevation** control chooses whether to fill elevation from the elevation API into exported points, lines and the planned route: *Keep recorded* (leave as-is), *Fill missing* (only coordinates lacking elevation), or *Override all* (replace every elevation). Polygons are always skipped.

While the export runs its controls are disabled and a spinner replaces the icon on the export button. **Close** stays active: it gives up on the export — one that is filling elevation is abandoned outright, while one that is not carries on and downloads its file with the modal already gone.

The target can be a downloaded file, the device share sheet, Google Drive, Dropbox, or Garmin Connect. **Share** hands the exported file to the operating system's share sheet (send it to a messenger, mail app, or a hiking app); it is offered only in browsers that let a page share files at all. Chromium-based browsers share no geo formats, so there the file travels as plain text with a `.txt` suffix appended to its name (`freemap-export-….gpx.txt`), which a note under the target explains. If the browser refuses to open the share sheet at all — an export slow enough to lose the click that asked for it — the file is downloaded instead and a message says so. Exporting a planned route to Garmin Connect as a course (experimental) requires a connected Garmin account and lets the user choose a course name and activity type (running, hiking, mountain biking, trail running, road/gravel cycling, other).

### Maps for GPS devices

- Access: Main menu > Maps for GPS devices
- URL path: `/#show=document/exports` (legacy `/#document=exports` still works)

Opens a modal with instructions to get various maps for GPS devices:

- Garmin (+BaseCamp)
- Locus
- Orux maps
- BackCountry Navigator
- BikeComputer
- XCTrack

### Offline maps export

- Access: Main menu > Offline maps export
- Keyboard shortcut: <kbd>e</kbd> <kbd>m</kbd>
- URL path: `/#show=offline-map-export`

Opens a modal to download a map in offline formats (MBTiles or SQLiteDB).
Selection can be the current visible map area or a rectangle drawn on the map.
Multiple tile-based maps are supported for download.
Users can select the desired zoom range and, for maps offering hi-DPI variants, the tile scale.
The modal summarizes the tile count, the estimated file size (sampled from real tiles of the selected map, area, zoom range and scale) and the price in credits.
Link to the map prepared for download will be emailed to the provided email address.

### Embed map

- Access: Main menu > Embed map
- Keyboard shortcut: <kbd>e</kbd> <kbd>e</kbd>
- URL path: `/#show=embed`

Opens a modal to configure the map for embedding into another website.

Users can configure:

- dimensions (w/h)
- enabled features (search, map layer switch button, "find me" (locate me) button)

Users can then copy and paste the generated iframe markup.

An embedded map is recognized by being framed at all, not by anything in its address, so any link it opens in a new tab lands in the ordinary app. It shows no "Manage maps" gear, starts none of the keyboard chords, and refuses the modals that manage the visitor's own maps or account — **Installed maps**, **Available maps**, **Custom maps**, **Offline maps**, **Caching while browsing**, **Map preferences**, **Elevation preferences** and the premium purchase — even when a `show=` in its own address names one. A premium gem inside an embed therefore opens the portal in a new tab with the purchase modal, rather than trying to sign the visitor in and charge them inside somebody else's page.
