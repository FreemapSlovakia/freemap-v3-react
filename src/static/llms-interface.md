## Interface, search and account

### Search

- Access: the search box at the top of the page ("Search places and functions")

The box's dropdown ends with a **Lookup style** row opening the modal of that name (see [OSM data](/llms-osm.md)); while the box is empty, its ▾ caret opens the dropdown with that row alone. It is not shown in an embedded map.

The box also finds POI types: from two characters on, the types matching the query are listed under an **Objects (POIs)** caption as checkboxes that switch them on the map (see [OSM data](/llms-osm.md)). Picking one leaves the query and the list up, so several can be switched on in a row.

The box also finds the app's own functions, so a tool, a dialog, a help document or a map layer can be reached by name instead of through the menus: from the second character on, the matching ones are listed above the places, under a **Functions** caption and a **Maps** one, with the matched letters in bold. Typing "weather" offers the weather-radar layer, "export" the three export dialogs, "shading" the shading layers. Matching ignores case and accents and accepts gaps (as in a code editor's command palette), and each function carries synonyms of its own, so it is found by words its label doesn't use. Picking one does what its menu item does; the functions an embedded map has no menus for are not offered there.

Searches the map by place name, category, or coordinates. Suggestions appear as you type, from the third character on, biased towards the middle of the map you are looking at; pressing Enter or the search button asks for a longer list of the same. Results may come from several sources — place-name (forward) and reverse geocoding, both answered by Freemap's own Photon instance over OpenStreetMap data and localized into the UI language, nearby and surrounding POIs (Freemap's own OSM query API, Europe only), raw coordinates, OSM elements, and WMS feature info. A geocoded hit arrives as a point; its outline and full tags are fetched from OSM once it is picked. An element can also be asked for by id — `n123` / `w456` / `r789`, the spelled-out `node/123` or `way 456`, or a link to an element's osm.org page (or its history) — which is read locally and offered as a row carrying the id alone; the element itself is fetched when that row is picked. A one-letter prefix has to be tight and at least three digits (`n123`), so road refs such as `R2` or `N 118` stay queries for the geocoder. Pointing at a result in the list (or arrowing onto it) draws it on the map, so it can be found without being picked — the map doesn't move and nothing is loaded for it. Picking a result goes to it and shows it on the map for as long as it stays selected — closing its selection toolbar (× or <kbd>Esc</kbd>), picking the next result, or selecting anything else takes it off again. A 📌 **Keep on the map** button on that toolbar makes it stay instead: kept results remain on the map beside one another and beside whatever is being looked at, so several can be compared at once. Once a result is kept, that button gives way to the 🗑 delete one beside the ×, so the toolbar always offers the one thing that can be done about the result being on the map. Clicking one on the map picks it out of them. The selected result is drawn in the selection color instead of the configured result color, the same way a selected POI is; the selection toolbar and the details popup act on it. Its ⋮ menu turns the result into drawing features — through the conversion dialog described under Drawing, which asks what to take along and how much to simplify — converts it to Tracks and data, and carries the place actions described under Map details — inline, above the "Open in…" submenu. A result that is merely being looked at has no delete button, going as it does the moment it stops being looked at; <kbd>Del</kbd> takes either kind off outright. Only kept OSM elements go into the URL, each with its own `osm-node=` / `osm-way=` / `osm-relation=` param, so a link restores all of them — in one query however many it names.

### UI Language switcher

- Access: Main menu > Language
- Available languages: Slovak, Czech, Hungarian, English, Polish, German, Italian, Slovenian, French

### Account

- Access: Main menu > Account
- Keyboard shortcut: <kbd>e</kbd> <kbd>a</kbd>
- URL path: `/#show=account`

Available only to logged-in users. Logged-out users instead see a **Log in** item in the same place, which opens the login provider chooser (see Login providers below).

The Account modal has three collapsible sections (below); from the buttons at the bottom the user can also log out or delete their account.

#### Purchases

- Shows current premium status (e.g. "premium access until <date>", or "premium access, your subscription renews automatically" while an auto-renewing subscription is running) and the credit balance, with a **Buy credits** button
- History of purchases (date and item)
- Users can purchase yearly premium access and/or credits; a user with a running subscription is shown their premium status instead of purchase options
- **Manage payments** — shown to anyone who ever paid through Polar; opens the Polar customer portal in a new tab (cancel the subscription, change the payment method, download invoices). It does not cover payments made through Rovas
- Yearly premium costs 15 €; it is bought either as an auto-renewing subscription (which keeps the price it was started at for as long as it stays active, and can be cancelled at any time) or as a one-time year (which keeps the price for that year only). Subscriptions started before 1 September 2026 keep their 8 € price
- Credits are currently spent only on "Offline maps export" (see [Sharing and export](/llms-export.md))
- Yearly premium allows:
  - Removal of the ad banner
  - Access to premium photos (users can mark uploaded photos as premium-only)
  - Access to higher map zoom levels for specific map layers (see the layer registry in [Map Layers](/llms-layers.md))
  - Multimodal routing (combining several transport modes in one route)
  - "Optimize order" in the route planner (reordering the waypoints to minimize travel time)
  - Colorizing routes and tracks in every mode except Elevation, Speed and Time — those three are free, the rest carry a gem and are locked (the option is disabled, the gem opens the purchase flow)
  - Weather radar: up to 6 hours of history instead of 2, plus the 1-hour forecast (the `R` overlay)
  - Viewshed: looking further than 20 km, and detail past what the free pixel budget buys at the chosen range — that budget is what 20 km at the coarsest tier costs, so a shorter viewshed spends it on detail instead (10 km reaches the second tier, 5 km the fourth) (the `v` overlay)
  - Panorama: renders costing more rays than the free allowance — finer detail, and more rays per pixel — and a maximum visible distance beyond 300 km
  - High-resolution elevation data in supported countries (used by the elevation API for the chart, colorizing, and elevation fill); currently Slovakia (DMR 5.0: ÚGKK SR), Czechia (DMR 5G: ČÚZK), Austria (ALS DTM: Geoland.at), Switzerland (swissALTI3D: © swisstopo), Italy (HR-DTM 5 m: IRPI-CNR), Slovenia (DMR: Ministrstvo za okolje in prostor), Spain (MDT05: IGN/CNIG), Sweden (Markhöjdmodell: Lantmäteriet), France (RGE ALTI: IGN), Poland (NMT: GUGiK), Finland (Korkeusmalli 2 m: Maanmittauslaitos), Croatia (DMR: Državna geodetska uprava), Norway (DTM: Kartverket, NLOD 2.0), Luxembourg (MNT LiDAR 2024: Administration du cadastre et de la topographie, CC0), England (LIDAR Composite DTM 1 m: Environment Agency, OGL v3), and Belgium (Wallonia — MNT 1 m 2021–2022: © Service public de Wallonie, CC BY 4.0, modified; Flanders — DHMV II 1 m, Bron: Digitaal Vlaanderen), with more countries being added; past their borders a premium read falls back to a global 30 m model (GEDTM30), while without premium the elevation API answers from SRTM everywhere

#### Personal information

- Profile picture (choose / remove)
- Name (required) and email address
- "About me" description

#### Login providers

Supported login providers:

- Apple
- Facebook
- Google
- OpenStreetMap
- Garmin
- GitHub
- Microsoft
- Strava — login and connect work only on `www.freemap.sk`, because Strava's API app accepts only that callback domain; disconnecting works everywhere

For each provider the modal shows either a **Connect** button (to link it) or a **Disconnect** button (if already linked), so multiple providers can be linked to a single Freemap account.

### Clear map elements

- Access: Main menu > Clear map elements
- Keyboard shortcut: <kbd>g</kbd> <kbd>c</kbd>

Clears the data layer (all interactive map elements of various tools) from the map.

### Info & help

- Access: Info & help

Opens a submenu:

- Map legend
- Contacts
- OpenStreetMap documentation
- About Freemap Association
- About OpenStreetMap
- Map License
- Keyboard Shortcuts
- Garmin
- Freemap.sk for Geocaching Extension
- Advertise with Us
- **Reset application** — clears all locally stored settings (signing you out) and reloads the page; confirmed first

Most items open a modal with the selected topic; **Reset application** instead wipes the persisted state and reloads.

The **Advertise with Us** page (also opened from the "place your own ad here" banner) describes the audience, where the ad appears in the interface, the accepted formats, and the address to ask for an offer at.

The **Map License** modal explains the attribution the licenses require and points at the map's **©** button, which lists the sources to credit for what is currently shown: the active layers' map, data and picture credits, plus what a standing route or isochrone adds. A route is OpenStreetMap-derived whatever layer is drawn under it, so it credits OSM data even over aerial imagery; a GraphHopper one also credits Sonny's LiDAR DTM (the terrain model the router is weighted by, which shapes every route it returns, not only the profiles that show its values), and an OSRM one credits OSRM / FOSSGIS e. V., the volunteers whose server answered. Wherever OpenStreetMap data is credited, a "report a map error" link to openstreetmap.org/fixthemap sits beside it — in the list of links only, not in the attribution baked into an exported image, where a link would be inert. The first time each of these sources contributes in a session, the attribution toast is raised, the same way switching to a new map layer raises it.

The **Map legend** modal is specific to the currently active map and explains its symbols, grouped into collapsible categories, listed alphabetically by their name in the current language with the catch-all **Other** kept last (Accommodation and shelter, Barriers, Borders, Culture and entertainment, Facilities, Finance, Food & Drink, Healthcare, Historical objects, Institutions, Land cover, Man-made structures, Natural features, Places of worship, Railways, Roads and paths, Shops, Sports and leisure, Terrain, Tourism, Transport, Water, Other). The outdoor map's legend has a search box above the categories that filters the symbols by their name, by their OSM tags (`key=value`) or by a category name; from two characters on the matching categories are laid out open one under another instead of collapsed, and a query nothing answers says so. The legend content differs per map type and is also available for WMS and custom WMS maps. The KST map and each of the outdoor overlays (`x…`) get a legend of only what that layer draws, with the samples drawn transparent, as the overlay is; a legend holding a single category lists its symbols directly, without the search box or the collapsible section. The OpenStreetMap layer's legend is the OpenStreetMap Wiki's key: with that layer alone it opens there directly, and beside other legend-bearing layers its section links to it. With several legend-bearing layers on, each has its own collapsible section. It can also be opened from the map's **ⓘ** info button (<kbd>m</kbd> <kbd>l</kbd>).

### Support Freemap

- Access: Main menu > Support Freemap
- URL path: `/#show=support-us`

### Social and app buttons

At the bottom of the main menu there is a row of buttons: links to Mastodon, [Facebook](https://www.facebook.com/FreemapSlovakia), [YouTube](https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ) and [GitHub](https://www.github.com/FreemapSlovakia); the mobile apps on Google Play and the App Store; and a **Services status** link.

### UI theme switcher

At the bottom right of the main menu, there are buttons to switch the app UI theme: Light / Dark / Auto.

### Map context menu (right-click)

Right-clicking (or long-pressing) a location on the map opens a context menu with actions for that point. The same list is carried inline by every ⋮ menu that knows a place — see below:

- Center a map here
- Find coordinates and elevation
- Query nearby features
- Show nearby photos
- Add here a point
- Start here drawing a line or measurement
- Route from here
- Route to here
- Panorama from here
- Look at this in the panorama (only while a panorama has been rendered — turns that picture to face the clicked point instead of rendering anything)
- Viewshed from here (turns the `v` overlay on and computes it from that point)
- Toposcope from here (only while points are drawn on the map — the dial's rays are those points, so with none it would stand on an empty dial; the toposcope tool's own ◎ button is the way in from nothing)
- Share location (hands the place to the device's share sheet as a `geo:` link, with the page in view alongside it)
- Open in… (submenu; the same targets as in the main menu, but acting on the clicked point rather than the map centre)

Anything else that stands somewhere — a drawing point, a route waypoint, a search result or object, a track-viewer waypoint, a photo, a panorama or viewshed viewpoint — offers that same list inline in its own ⋮ menu, **Open in…** last, acting on that feature's position instead of a clicked point. An embedded map is the exception: the drawing, routing and view entries need tools it never opens, so there they are left out of the list wherever it appears, and the toolbars that build their menu out of `ResponsiveActions` (search results, objects, the panorama and viewshed viewpoints, route waypoints) carry no place actions at all.

### Info button

A round **ⓘ** info button at the bottom-right corner of the map opens a small popover with:

- Copyright
- Map legend (<kbd>m</kbd> <kbd>l</kbd>)
- Privacy policy
- Terms of service
- Refund policy (not in an embedded map, which sells nothing; the privacy policy and terms of service stay, both applying to the visitor either way)
