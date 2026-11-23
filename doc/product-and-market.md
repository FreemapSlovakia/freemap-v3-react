# Freemap — product reality and market position

Written 2026-09-07 from the code and `src/static/llms.txt`, not from marketing copy.
Purpose: so outreach describes the product **as it is**. Three false claims reached
live posts before this existed (see the roadmap's _Claims that must stay accurate_).

**Verify against the code, not against this file, whenever a claim carries weight.**
Sources of truth: `src/shared/mapLibrary/` (layers, coverage, premium gates),
`src/shared/transportTypeDefs.tsx` (routing profiles), `src/static/llms.txt`
(hand-maintained functional description), `src/shared/langUtils.ts` (UI languages).

---

## 1. What it actually is

A **web application plus a native mobile app** on OpenStreetMap data, by the NGO
Freemap Slovakia (Slovak local chapter of the OSMF). Not an outdoor map with tools
bolted on — a map _workbench_ that happens to ship an excellent outdoor map. That
distinction is the whole positioning problem: everything posted before September 2026
sold the map.

**Native mobile app (Flutter, iOS + Android)** — launched 2026-05-15, updated through
2026 (route marker time/distance, isochrones, gallery clustering, 360° viewer, TCX/FIT
import). **Offline routing shipped 2026-09-03: BRouter rewritten in C and embedded
natively, iOS included, running on the phone with no data and no server.** A Capacitor
wrapper of the web app is planned as a further option. Do not describe Freemap as
"web only" — an earlier version of this document did, and it was wrong.

Two portals, same app: `freemap.sk` renders as "Freemap Slovakia", `freemap.eu` as
"Freemap Europe". The serving domain expands the `{site}` placeholder.

## 2. Coverage — precise

**Outdoor map (`X`), 46 countries** (`OUTDOOR_COUNTRIES` in `mapDefinitions.tsx`):
ad al at ba be bg by ch cs cy cz de dk ee es fi fo fr gb gr hr hu ie is it lt lu lv
md me mk nl no pl pt ro rs se si sk sm tr ua uk va xk

Zoom 5–20; **premium from zoom 19**.

**National high-resolution terrain — 33 datasets** (the renderer's `shading:`
entries; `curl https://outdoor.tiles.freemap.sk/licenses` is the live list and the
only one worth quoting from). This is the single strongest differentiator, and it
decides which markets are worth entering:

| Country                 | Model                                       |
| ----------------------- | ------------------------------------------- |
| Austria                 | ALS DTM, Geoland.at                         |
| Belgium                 | MNT 1 m (Wallonia) + DHMV II 1 m (Flanders) |
| Croatia                 | DMR, Državna geodetska uprava               |
| Czechia                 | DMR 5G, ČÚZK                                |
| England only (partial)  | LIDAR Composite DTM 1 m, Environment Agency |
| Germany — all 16 states | Each state's DGM1                           |
| Finland                 | Korkeusmalli 2 m, Maanmittauslaitos         |
| France                  | RGE ALTI, IGN                               |
| Italy                   | HR-DTM 5 m, CNR-IRPI                        |
| Luxembourg              | MNT LiDAR 2024 (CC0)                        |
| Norway                  | DTM, Kartverket                             |
| Poland                  | NMT, GUGiK                                  |
| Slovakia                | DMR 5.0, ÚGKK SR                            |
| Slovenia                | DMR, Ministrstvo za okolje in prostor       |
| Netherlands             | AHN                                         |
| Spain                   | MDT05, IGN/CNIG                             |
| Sweden                  | Markhöjdmodell, Lantmäteriet                |
| Switzerland             | swissALTI3D, swisstopo                      |

**Everywhere else falls back to global 30 m GEDTM30** — **Hungary**, **Ireland**, the
Balkans, and the UK outside England. Do not use the terrain hook in those markets.
Germany is covered state by state, so the terrain claim holds nationwide there.

Country-specific extras are **Slovakia-heavy**: detailed shading (`7`), surface
shading (`6`), cadastre, forest types, tree composition, geology, hydrochemistry,
NLC forest tracks — all `sk`. Parametric shading (`h`) covers SK, CZ, AT and CH.
Aerial `S` is worldwide (Esri), with the national orthophoto over it in `sk`+`cz`.

**Objects/POI API and the Photon geocoder: Europe only.**

**UI languages (9):** Slovak, Czech, Hungarian, English, Polish, German, Italian,
Slovenian, French. Missing and relevant: Ukrainian; Spanish/Croatian/Nordic absent
despite hi-res terrain there.

## 3. Feature inventory

**Routing** — self-hosted GraphHopper (terrain-weighted, so it avoids climbs) plus
third-party OSRM. Profiles (`transportTypeDefs.tsx`): foot, hiking, easyhike, bike,
mtb, gravelbike, racingbike, ebike, stroller/wheelchair, car, carnotoll, car4wd,
motorcycle, manual. **No ski-touring profile and no horse profile.** Modes: ordered,
roundtrip, isochrones (GraphHopper); visiting-places (OSRM). Alternatives up to 5.
Departure time and an itinerary (distance, times, arrival, toll roads per waypoint);
**weather along the route** at the time of passing (free). Multimodal segmentation (a
transport per part of the route), breaks and overnights at stops, and Optimize order
are premium.

**Colorize** a route/track/live track by: elevation, steepness, surface, smoothness,
road type, track grade, hiking (SAC) difficulty, MTB difficulty, waymark colour, speed,
time, heading, heart rate, cadence, power, temperature, battery, GSM signal. Only
**elevation, speed and time are free**; the rest are premium.

**Elevation profile** — zoomable distance axis, drag-to-slide, shift-drag to mark a
stretch and get its own climb/descent/steepness, waypoint ticks, SVG download,
linkable via `elevation-chart-range=`.

**Drawing & measurement** — points/lines/polygons with holes, styles, icons, free-form
properties with a `{p:key}` label template language, computed `{length}`/`{area}`/
`{azimuth}`/`{location}` in many units, simplification with a real-distance
Douglas–Peucker slider, project-point, join/split, Open in JOSM.

**Tracks and data** — import GPX/KML/KMZ/TCX/GeoJSON (multi-file, drag-drop, or by
URL); edit, not just view: select, join, split, split into segments, match to the
routing graph, convert, elevation fill/override.

**Search** — places, addresses (own Photon geocoder), coordinates in common formats,
OSM element ids, bounding boxes, tile numbers, pasted GeoJSON; POIs by category
(Objects); events; and the app's own functions, maps and manual chapters.

**Maps and shading** — **parametric terrain shading** of all Europe, designed from
layers (hillshade, slope, colour relief, contours, …) or presets (Swiss style,
hypsometric tints, watercolour, night, …), rendered on the server or in the browser
(WebGPU, experimental). A map library: the built-in maps plus **1,442 Editor Layer
Index maps** (aerial and historic imagery, historic and national maps) and 21 curated
ones; custom TMS/WMS/vector maps; presets; any map as base or overlay with opacity.

**Photos** — **743,465 community photos** (583 uploaders, 2,236 360° panoramas) and
**32.2 million geotagged Wikimedia Commons photos**, worldwide, re-imported monthly
(fm6 counts, Nov 2026). Rating, comments, tags, a leaderboard, colorize by author,
rating, date, season or licence; premium photos.

**Wikipedia** overlay — article markers with an article panel.

**Events** — shared trips with participants (interested/going), discussion, saved
filters with email alerts, weather forecast in the panel. 3,566 events, 2,964 upcoming
(Nov 2026); all but ~130 harvested from KČT, KST and its regions, DATAtourisme (FR),
Südtirol, DVV and TTT calendars.

**Weather** — hourly 16-day forecast for any place in Europe (Open-Meteo), in lists
or charts, for the place's own elevation and time zone; along a route; in an event's
panel; animated radar.

**My maps** — everything on the map saved under a name: open on any device, share by
link, invite editors, flag offline.

**OSM tools** — map details (query features, element history), changeset viewer, OSM
notes overlay, open in iD/JOSM.

**Live tracking and recording** — devices on the map with their path, watch links;
OsmAnd/Locus/Traccar or the Freemap GPS recorder as senders. The GPS recorder records
a track in the web app on Android (a companion APK keeps recording with the browser
closed).

**3D terrain model** — STL for 3D printing, or 3MF with the route, drawings, points
and landcover in filament colours for multi-colour printers; preview in the browser.

**Offline** — in-browser tile caching per area/zoom/scale (free), and **MBTiles /
SQLiteDB export** (costs credits, delivered by email link). Saved maps can be flagged
offline; saving works offline and syncs later.

**Export** — GPX, GeoJSON, KML/KMZ (lossless round-trip via `freemap:*` shadows),
PDF/SVG/PNG/JPEG documents with server-rendered contour/relief/trail overlays; targets
include file, share sheet, Google Drive, Dropbox, **Garmin Connect** courses.

**Unusual-to-unique:** 360° **panorama** rendered server-side from the terrain model
with automatically named peaks scored by prominence; **viewshed** overlay; **toposcope**
(printable/engravable SVG orientation dial); **animated weather radar**; **isochrones**;
**embeddable iframe**; **WebMCP agent tools** so a browser AI agent can drive the app;
**live tracking** (OsmAnd/Locus/Traccar as senders) with shareable watch tokens;
**Android GPS recorder** via a companion APK; community photo gallery including
geotagged Wikimedia Commons; deep-linkable URL state for everything.

## 3a. Descriptions to reuse

Freemap is a map for everyone, with power tools for those who want them — not an
outdoor map only. Reuse these texts; recheck the figures before quoting them.

**Tagline:** _more than just a map_

**Short** (meta description, under 160 characters):

> Free OpenStreetMap map of Europe: route planner, hiking and cycling map with relief,
> weather, photos, events, drawing, measuring, GPX and offline maps.

**Paragraph** (forums, wikis):

> Freemap is a free map application built on OpenStreetMap by the Slovak OSM community
> (OZ Freemap Slovakia), in the browser and as an Android and iOS app. Anyone can use it
> to find a place, plan a route by car, bike or on foot — mixing modes along the way,
> with breaks and overnights and the weather at each point of the trip — check an hourly
> weather forecast or the radar, and explore what is around: over 700,000 community
> photos, over 30 million geotagged Wikimedia Commons photos, Wikipedia articles and thousands of
> upcoming hikes and rides from club calendars. Whatever you put on the map you can save
> as your own map, open on any device and share or edit with others. For the outdoors it
> has its own detailed map of 46 European countries with waymarked trails and relief
> from national terrain models, elevation profiles, panoramas, GPS track recording, live
> tracking you can share with others, and offline maps. Those who want more get tools
> close to a GIS: terrain shading you design yourself, drawing and measuring, editing
> and converting GPX, KML and GeoJSON, your own WMS and tile maps plus a library of over
> 1,400 more, viewshed and isochrones, print-ready PDF and SVG, MBTiles for GPS devices,
> and terrain models for 3D printing, in colour too. Most of it is free; an optional
> €15/year premium pays for the servers. Open source, with no user tracking.

**Long** (wiki pages, about sections):

- **Find and discover** — search for places, addresses, coordinates and OSM elements,
  and for the app's own functions; points of interest by category; community and
  Wikimedia photos; Wikipedia; events; weather forecast and radar.
- **Get somewhere** — 13 travel profiles (car, toll-free car, 4WD, motorcycle, walking,
  hiking, easy hike, stroller/wheelchair, bicycle, MTB, gravel, road bike, e-bike), a
  different one for each part of a route; departure time, itinerary, breaks and
  overnights at stops, weather along the route; alternatives, round trips, optimized
  stop order, isochrones; routes coloured by steepness, surface or difficulty, recorded
  tracks also by speed, heart rate or power, with a matching elevation profile; sharing
  or opening the place in Google or Apple Maps; saved places.
- **Outdoors** — the Outdoor map with trails in their waymark colours; terrain shading;
  panorama, toposcope, viewshed; GPS track recording in the web app on Android;
  offline maps; maps and files for Garmin, Locus, OsmAnd and OruxMaps; the mobile app
  with offline routing on the phone.
- **Keep and share** — My maps: everything on the map saved, opened on any device,
  shared by link, edited together, flagged for offline use; events with participants
  and discussion; live tracking of phones and GPS trackers, shared by link; embed code.
- **Power tools** — parametric shading; the map library, your own WMS/tile/vector maps,
  presets and stacking with opacity; drawing with styles, properties and label
  templates; length, area, azimuth; lossless GPX/KML/KMZ/TCX/GeoJSON conversion, join,
  split, simplify, match to roads; PDF/SVG/PNG with a legend, MBTiles/SQLiteDB; terrain
  models for 3D printing, STL or 3MF in colour with your route, drawings and landcover;
  everything in the URL; `llms.txt` and WebMCP for AI agents.
- **OSM mappers** — element details and history, changeset viewer, OSM notes, open in
  iD or JOSM; edits show within minutes.

The paragraph and the short text are in the repo too: the short one in nine languages
in `src/translations/<lang>-shared.ts` (page meta, bot homepages), a one-line form in
`appDescription` in `rspack.config.ts` (web manifest), and the summary of
`src/static/llms.txt`.

## 4. Business model

- **Yearly premium €15** (subscription keeps its start price; pre-1 Sep 2026
  subscriptions keep €8). Credits are separate and currently only buy offline-map export.
- **Why the price rose from €8 to €15 in September 2026:** Polar charges a percentage
  _plus a fixed amount per purchase_, so at €8 the fixed fee ate an unreasonable share.
  A campaign before 1 Sep offered €8 locked for as long as the subscription runs, which
  pulled a bump of subscribers forward. **Any September-vs-August comparison is therefore
  measuring a trough against a pulled-forward peak — compare against a pre-campaign
  baseline (e.g. July) instead.**
- **Ads are shown to non-premium users**, **self-served, no ad network**. Premium
  removes them. Never claim "ad-free".
- **No user tracking**, self-hosted analytics, no third-party trackers. This claim is safe.
- Payments via Polar (customer portal) and Rovas.
- The association is non-profit; the developer is paid. Don't make "non-profit project"
  the headline claim — "a project of the Slovak OSM community, open source" is enough.

## 5. Honest strengths

1. **Terrain quality** — national high-resolution models in 18 countries. Beats every free
   competitor and most paid ones outside their home country.
2. **Breadth in a browser, no install** — planning, drawing, measuring, converting,
   exporting, offline, embedding, panorama, viewshed, radar, isochrones.
3. **Price** — €15/yr against komoot Premium at roughly €60/yr, Outdooractive Pro,
   Bergfex Pro, AllTrails+ all in the same higher bracket.
4. **Open source, no tracking, self-served ads** — credible to OSM/FOSS audiences, and
   a real differentiator now that komoot is owned by Bending Spoons.
5. **OSM-native and fast** — an OSM edit shows within minutes. Powerful with mappers:
   fix it yourself and see it.
6. **Waymark fidelity** — trails drawn in `osmc:symbol` colours with `ref`/`name`
   labels. Directly answers "where do I find numbered CAI/KČT trails".
7. **Everything is a URL** — deep links, embeds, sharing, and an agent API. No
   competitor exposes this.
8. **Export breadth** — GPX/GeoJSON/KML/KMZ/TCX, MBTiles/SQLiteDB, PDF/SVG/PNG,
   Garmin Connect. Serves Garmin/Locus/OsmAnd users rather than fighting them.
9. **On-device offline routing in the mobile app** (BRouter in C, iOS included, no data,
   no server). Rare even among paid competitors, and a genuine field-use advantage.
10. **Photos across Europe** — own community uploads (Slovakia strongest) plus geotagged
    Wikimedia Commons imported with author, licence, dates and ratings, so the layer has
    content outside Slovakia too.

## 6. Honest weaknesses

1. **Awareness of the mobile app, not its absence.** The app exists and does things the
   competition does not (on-device offline routing with no server). The weakness is that
   almost nobody outside Slovakia knows it exists — it has been announced on the Slovak
   Facebook page and Mastodon, and essentially nowhere else. This is a distribution gap,
   which is fixable, rather than a product gap, which would not be.
2. **No curated tour library.** komoot, Outdooractive, AllTrails and Bergfex sell
   _inspiration_ — user routes with descriptions and reviews. Freemap has **photos**
   (own community uploads plus geotagged Wikimedia Commons, so Europe is not empty,
   though Slovakia is by far the best covered) but not route descriptions or reviews.
   Casual "where shall I walk on Sunday" users mostly want that. Don't compete there.
3. **No turn-by-turn voice navigation.**
4. **Hungary, Ireland, the Balkans and the UK outside England get 30 m terrain** — the
   headline differentiator is unavailable there.
5. **Discoverability** — no app store, no route SEO corpus. Growth has to come from
   communities and word of mouth, which is exactly why forum outreach works.
6. **Two-domain brand confusion** — `freemap.sk` says "Slovakia" to a foreigner.
7. **Feature surface is large** — powerful for tinkerers, potentially overwhelming for
   casual users. The premium notice, for instance, wasn't even recognised as clickable
   by one tester.
8. **Server-queued renders** — panorama and viewshed serve one request at a time; the
   finest panorama takes most of a minute.
9. **Slovakia-weighted extra layers** — cadastre, forest, geology are `sk` only, so the
   "many layers" story is thinner abroad than at home.
10. **Live tracking needs a third-party sender app** (OsmAnd/Locus/Traccar).

## 7. Competitors

| Product                                    | Price                                                   | Where it beats Freemap                                     | Where Freemap beats it                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **komoot** (Bending Spoons since Mar 2025) | ~€60/yr premium; one free region; one-time region packs | Mobile app, community routes, voice nav, brand, 45 M users | Price, terrain detail, open source, no tracking, tooling, export breadth. **Owner change has made its user base restive** — German forums carry long "alternatives" threads |
| **Outdooractive**                          | Pro subscription                                        | Alpine club partnerships, curated tours, app               | Price, open data, tooling, no lock-in                                                                                                                                       |
| **Bergfex**                                | Pro subscription; reduced free map                      | Brand in AT, snow/weather, app                             | Full-strength free map, tooling, terrain                                                                                                                                    |
| **AllTrails**                              | Pro subscription                                        | Community reviews, global, app                             | Europe terrain detail, price, tooling                                                                                                                                       |
| **Mapy.com** (Seznam.cz)                   | Free; paid ad-free tier since Dec 2024                  | Excellent free CZ/SK map, strong app, huge CZ loyalty      | Terrain models beyond CZ, planner tooling, exports, open source                                                                                                             |
| **Locus Map / OsmAnd**                     | Freemium apps                                           | Offline-first mobile, deep customisation                   | Browser workbench, terrain rendering, exports feed _into_ them — allies, not rivals                                                                                         |
| **swisstopo / national portals**           | Free                                                    | Authoritative national data                                | Cross-border consistency, tooling. Praised over OpenTopoMap by swisstopo's own TLM-Regio quality manager (hikr, Sep 2026)                                                   |
| **OpenTopoMap / Waymarked Trails**         | Free                                                    | Ubiquitous, simple                                         | Far better terrain, and an application rather than a tile layer                                                                                                             |

### How the big two are actually funded

Worth knowing before comparing team sizes or growth rates:

- **komoot** reached **~45 million users with about 250 staff**, then sold to Bending
  Spoons in March 2025 for roughly **€300 million**; about **80 % of staff were laid off
  immediately**. Bending Spoons' model is to buy sound apps, cut costs hard, move users
  to subscriptions and raise prices 2–4×.
- **Mapy.com** is a product of **Seznam.cz**, a large Czech internet company (search,
  email, news, the Sklik ad system). It does not have to pay for itself — the parent's
  advertising business funds it. A paid ad-free tier only arrived in December 2024.

So neither is a like-for-like comparison with a community project. The instructive
ratio is komoot's **~180,000 users per employee** — Freemap sustaining one person is
the same order of efficiency, just far earlier on the curve and without capital to buy
the middle of it.

**Structural read:** Freemap cannot win "inspiration" or a curated tour library. It can
win **planning, precision and tooling** — and it wins decisively on price and on terrain
in the 18 countries that have a national model (England alone for the UK). Note the mobile app means the
in-the-field moment is _not_ conceded: on-device offline routing is something most paid
competitors cannot do.

## 8. Positioning that follows from this

Target **people who do things with maps**, not people looking for a walk. Note this is
about which need to lead with — it is not a claim that Freemap is desk-only; the mobile
app covers the field, including offline routing:

- planners and trip preparers (route, profile, print, export to device)
- mappers and OSM contributors (fix it, see it in minutes, JOSM handoff)
- clubs, guides and publishers (embed, print/PDF, saved shared maps)
- GPS device owners (Garmin/Locus/OsmAnd exports, MBTiles, offline)
- specialists (viewshed, panorama, toposcope, isochrones, custom WMS/TMS)

Lead with the **need the audience already has**, not with the map. What worked: offline
maps after 4UMaps shut down; "tell me where it's wrong" to map-literate communities;
CAI/waymark numbering where a forum had asked for it repeatedly.

## 9. Verticals worth testing (Europe only)

Geocaching (CZ/AT/SK — `geocaching.cz` already lists freemap tiles as a GME source);
paragliding/free flight (panorama, viewshed, custom airspace WMS, Alps = hi-res terrain);
ham radio / drone VLOS / hunting (viewshed, no free competitor); gravel and bikepacking
(profiles + surface colorize); GIS and developers (WMS/TMS, embed, WebMCP). Ski touring
is seasonal — revisit in November, and note there is **no ski-touring routing profile**.

## 10. Open product questions raised by real users

- ~~Contours over open sea (#84); tidal channels in the Wadden Sea (#83); the `bicycle=no`
  cross too prominent (#86)~~ — all three fixed in the renderer in September 2026 (shading
  and contours masked to dry land from z12, tidal channels dropped, crosses only where a
  restriction starts). Worth telling hikr.org, where #83 and #86 came from.
- The premium notice reads as a caption, not a control — a first-time visitor could not
  tell it was clickable.
- Authoritative nameservers (`ns1-3.webhouse.sk`) have no AAAA records. IPv6 to the web
  server itself is verified working; this is a robustness nit only.

## 11. Competition in the AI era

Writing a map application is no longer the hard part. With AI-assisted coding a single
enthusiast ships a capable MapLibre app in weeks — `mapa.cergov.sk` (one mountain range,
3D terrain, Sentinel imagery, forest-change tracking, flight playback, built over one
summer in plain JavaScript) is the pattern, and there will be more of them. Coding skill
stopped being a moat; Freemap is itself mostly built this way now.

**What still does not come cheap, and is where Freemap should keep investing:**

- **Data and the infrastructure behind it.** Its own tile renderer, national terrain
  models processed country by country, a self-hosted geocoder, routing, its own OSM API.
  A generated app still needs tiles, terrain and routing from somewhere, and running them
  costs money and upkeep every month. Most new apps sit on someone else's.
- **Domain judgement.** Which OSM tags matter, what an outdoor reader needs at which zoom,
  when to leave something _off_ the map. AI writes code fast; it does not know what is
  right. Deep map expertise now steers the output instead of typing it.
- **Community and trust.** The Page, the osm_sk mappers, GitHub reporters, and a name
  people have known for years. Slow to build, impossible to generate.
- **A business model.** Premium pays for the servers. Hobby apps without one fade when the
  author moves on or the hosting bill grows.

**What follows:**

- **Be infrastructure, not only an app.** A small local project is better as a user of
  Freemap tiles, terrain or elevation than as a rival — offer them. It turns would-be
  competitors into an audience and possibly into paying API customers.
- **Keep speed as an advantage.** AI tooling plus domain knowledge ships as fast as anyone;
  the cadence of the September 2026 announcement log is the evidence.
- **Invest in distribution.** Every new app competes for the same attention: SEO,
  `llms.txt`, the WebMCP agent tools, shareable posts.
- **Lean into the local.** A single-range page like Čergov.sk (3.9K followers, against the
  Page's 3.2K) wins on attachment to a place, not on features — its map posts draw about
  what Freemap's do. Freemap's best posts follow the same rule: a named hill, a named view,
  a regional dialect.
