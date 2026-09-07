# Freemap — product reality and market position

Written 2026-09-07 from the code and `src/static/llms.txt`, not from marketing copy.
Purpose: so outreach describes the product **as it is**. Three false claims reached
live posts before this existed (see the roadmap's *Claims that must stay accurate*).

**Verify against the code, not against this file, whenever a claim carries weight.**
Sources of truth: `src/shared/mapDefinitions.tsx` (layers, coverage, premium gates),
`src/shared/transportTypeDefs.tsx` (routing profiles), `src/static/llms.txt`
(hand-maintained functional description), `src/shared/langUtils.ts` (UI languages).

---

## 1. What it actually is

A **single-page web application** on OpenStreetMap data, by the NGO Freemap Slovakia
(Slovak local chapter of the OSMF). Not an outdoor map with tools bolted on — a map
*workbench* that happens to ship an excellent outdoor map. That distinction is the
whole positioning problem: everything posted before September 2026 sold the map.

Two portals, same app: `freemap.sk` renders as "Freemap Slovakia", `freemap.eu` as
"Freemap Europe". The serving domain expands the `{site}` placeholder.

## 2. Coverage — precise

**Outdoor map (`X`), 46 countries** (`mapDefinitions.tsx:723`):
ad al at ba be bg by ch cs cy cz de dk ee es fi fo fr gb gr hr hu ie is it lt lu lv
md me mk nl no pl pt ro rs se si sk sm tr ua uk va xk

Zoom 5–20; **premium from zoom 19**.

**National high-resolution terrain — 16 entries** (`OUTDOOR_NATIONAL_DTM_ATTRIBUTION`).
This is the single strongest differentiator, and it decides which markets are worth
entering:

| Country | Model |
|---|---|
| Austria | ALS DTM, Geoland.at |
| Belgium | MNT 1 m (Wallonia) + DHMV II 1 m (Flanders) |
| Croatia | DMR, Državna geodetska uprava |
| Czechia | DMR 5G, ČÚZK |
| England only (partial) | LIDAR Composite DTM 1 m, Environment Agency |
| Finland | Korkeusmalli 2 m, Maanmittauslaitos |
| France | RGE ALTI, IGN |
| Italy | HR-DTM 5 m, CNR-IRPI |
| Luxembourg | MNT LiDAR 2024 (CC0) |
| Norway | DTM, Kartverket |
| Poland | NMT, GUGiK |
| Slovakia | DMR 5.0, ÚGKK SR |
| Slovenia | DMR, Ministrstvo za okolje in prostor |
| Spain | MDT05, IGN/CNIG |
| Sweden | Markhöjdmodell, Lantmäteriet |
| Switzerland | swissALTI3D, swisstopo |

**Everywhere else falls back to global 30 m GEDTM30** — including **Germany**,
**Netherlands**, **Hungary**, **Ireland**, the Balkans. Do not use the terrain hook in
those markets. (Germany's absence is why the German push is postponed.)

Country-specific extras are **Slovakia-heavy**: detailed shading (`7`), terrain/surface
shading (`5`,`6`), cadastre, forest types, tree composition, geology, hydrochemistry,
NLC forest tracks — all `sk`. Czechia gets detailed shading (`8`) and parametric
shading (`z`). Aerial `Z` is `sk`+`cz`; aerial `S` (Esri) is worldwide.

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
Multimodal segmentation and Optimize order are premium.

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

## 4. Business model

- **Yearly premium €15** (subscription keeps its start price; pre-1 Sep 2026
  subscriptions keep €8). Credits are separate and currently only buy offline-map export.
- **Ads are shown to non-premium users**, **self-served, no ad network**. Premium
  removes them. Never claim "ad-free".
- **No user tracking**, self-hosted analytics, no third-party trackers. This claim is safe.
- Payments via Polar (customer portal) and Rovas.
- The association is non-profit; the developer is paid. Don't make "non-profit project"
  the headline claim — "a project of the Slovak OSM community, open source" is enough.

## 5. Honest strengths

1. **Terrain quality** — national LiDAR-derived models in 16 countries. Beats every free
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

## 6. Honest weaknesses

1. **No mobile app.** A PWA with offline caching, and an Android-only companion APK for
   GPS recording. Competitors are app-first, are in the app stores, and own the
   in-the-field moment. This is the biggest structural weakness and it shapes who to
   target: planners at a desk, not navigators on a summit.
2. **No tour/community content.** komoot, Outdooractive, AllTrails and Bergfex sell
   *inspiration* — hundreds of thousands of user routes with photos, descriptions and
   reviews. Freemap has none of that. Casual users mostly want that, not a workbench.
   Do not compete on it; it cannot be won.
3. **No turn-by-turn voice navigation.**
4. **Germany, Netherlands, Hungary, Ireland and the Balkans get 30 m terrain** — the
   headline differentiator is unavailable in the largest European market.
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

| Product | Price | Where it beats Freemap | Where Freemap beats it |
|---|---|---|---|
| **komoot** (Bending Spoons since Mar 2025, layoffs) | ~€60/yr premium; one free region | Mobile app, community routes, voice nav, brand | Price, terrain detail, open source, no tracking, tooling, export breadth. **Owner change has made its user base restive** — German forums carry long "alternatives" threads |
| **Outdooractive** | Pro subscription | Alpine club partnerships, curated tours, app | Price, open data, tooling, no lock-in |
| **Bergfex** | Pro subscription; reduced free map | Brand in AT, snow/weather, app | Full-strength free map, tooling, terrain |
| **AllTrails** | Pro subscription | Community reviews, global, app | Europe terrain detail, price, tooling |
| **Mapy.com** (Seznam) | Free, cheap premium | Excellent free CZ/SK map, strong app, huge CZ loyalty | Terrain models beyond CZ, planner tooling, exports, open source |
| **Locus Map / OsmAnd** | Freemium apps | Offline-first mobile, deep customisation | Browser workbench, terrain rendering, exports feed *into* them — allies, not rivals |
| **swisstopo / national portals** | Free | Authoritative national data | Cross-border consistency, tooling. Praised over OpenTopoMap by swisstopo's own TLM-Regio quality manager (hikr, Sep 2026) |
| **OpenTopoMap / Waymarked Trails** | Free | Ubiquitous, simple | Far better terrain, and an application rather than a tile layer |

**Structural read:** Freemap cannot win "inspiration" or "in-the-field app". It can win
**planning, precision and tooling** — and it wins decisively on price and on terrain
in the 16 countries that have a national model.

## 8. Positioning that follows from this

Target **people who do things with maps**, not people looking for a walk:

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

- Contours are drawn over open sea (issue #84); tidal channels in the Wadden Sea (#83).
- The `bicycle=no` cross is too prominent — reported independently in two countries (#86).
- The premium notice reads as a caption, not a control — a first-time visitor could not
  tell it was clickable.
- Authoritative nameservers (`ns1-3.webhouse.sk`) have no AAAA records. IPv6 to the web
  server itself is verified working; this is a robustness nit only.
