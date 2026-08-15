# Feature-announcement log

What has shipped, what has been posted about it, and where.

**Two channels, two audiences, managed separately — but both tracked here.**

- **Facebook** (`facebook.com/FreemapSlovakia`) — Slovak, in Slovak. The big audience:
  400–17,000 reach per post. Wants practical, local, usable-this-weekend.
- **Mastodon** (`@FreemapSlovakia@en.osm.town`) — everyone else, in English. Small
  following (~64) but boosts carry it into the international OSM network. Wants terrain,
  coverage, open data.

A topic can go to both, but never as the same text: each gets its own language and angle.
Some topics belong to only one — Slovak mobile-app releases never reach Mastodon, foreign
terrain updates are wasted on the Page. The per-channel evidence is in *What actually
performs* below.

Three lists:

- **Backlog** — post-worthy shipped features, newest first, with the commits that carry
  them and which channel they suit. A topic leaves the backlog when posted or deliberately
  skipped.
- **Posted — Mastodon** and **Posted — Facebook** — one row per post, per channel.

Market-intro posts ("Freemap.eu exists, here is what it does") belong in the Outreach log
in [`promotion-roadmap.md`](./promotion-roadmap.md), not here. This file is for
"here is what's new".

## How to maintain it

- Add a backlog entry when a user-visible feature lands, with its commit hashes. Group the
  follow-up fixes under the feature they belong to — one topic, not one commit.
- Size a topic to a post: a headline feature worth its own visual, or a bullet in another
  post's tail. Mark which.
- On posting, move the topic to the **Posted** table of the channel it went to, with the
  date and URL, and keep the commit hashes with it — that is what makes the log worth
  having. A topic posted to both gets a row in each; leave it in the backlog until it has
  gone to every channel its `Channel` value names.
- Keep `—` where a date or link is unknown rather than guessing.
- Mastodon (`en.osm.town`) caps a post at 500 characters, so a post is one headline plus a
  short tail. Facebook has no cap but shows one visual, so the same shape applies.
- The Posted rows can be re-read without auth:
  `curl -s 'https://en.osm.town/api/v1/accounts/116063901680527111/statuses?limit=25&exclude_replies=true'`
  — that is also where the ♥/↻ counts come from.

## Tooling

**Posting is manual on both channels.** The tooling below is for reading — filling in this
file's reach figures, and checking what has already gone out.

- **Mastodon** needs no auth at all: the curl above refreshes the Posted rows and their ♥/↻
  counts any time. No token, no server.
- **Facebook** is read from Meta Business Suite in the browser — see
  [`facebook-insights-prompt.md`](./facebook-insights-prompt.md), which is a
  ready-to-paste prompt for Claude in Chrome (or a checklist to follow by hand). Prefer its
  CSV export over reading figures off the screen.

**Do not retry the Facebook Graph API** (attempted 2026-08-13). Reading a Page's own posts
and insights needs `pages_read_engagement` and `read_insights`, and Meta no longer offers
either to an ordinary app: in the Login-for-Business permission picker only
`pages_show_list` and `business_management` appear, and the "+ Add" button leads to
*become a Tech Provider* — irreversible, and gated behind business verification plus App
Review. Verified against a purpose-made app (Freemap MCP, unpublished, "Manage everything
on your Page" use case) with the Page's own admin; `pages_show_list` was the only Page
scope granted. Two further traps found on the way: the app-type gate means the existing
`Freemap` login app (Consumer type, App ID `171410630094006`, wired up in
`src/features/auth/model/processors/fbLoader.ts`) cannot do Pages API at all, and claiming
the Page into the Freemap Slovakia business portfolio — which the system-user route
requires — would have removed three existing people from the Page.

Meta's own [MCP servers](https://developers.facebook.com/documentation/mcp) do not change
this: the documented one (Meta Devtools MCP) manages apps, webhooks, compliance and doc
search, and the other is Ads. Neither reads a Page's posts or insights, and no MCP can grant
a permission the platform withholds.

## House style (@FreemapSlovakia on Mastodon)

Read off the account's own posts, so a new draft matches what is already there:

- English only, 1–4 images or one animation, one post per topic — no changelog dumps.
- An emoji-led headline that asks the user's question ("How hard will that climb really
  be? ⛰️"), then 2–5 short lines, each opening with an emoji when it is a list.
- A link to `https://www.freemap.eu` — deep-linked with a `#map=…&layers=…` hash where the
  feature can be shown directly, which is stronger than the bare homepage.
- 3–6 hashtags, closing: `#OpenStreetMap` almost always, plus `#hiking` / `#cycling` /
  `#GIS` / `#OpenData` and the country tag in both languages (`#Croatia #Hrvatska`).
- Credit the data source by name and licence when a post is about data.
- **Say the mechanism in plain words.** This audience rewards knowing *how* a feature works,
  but naming the plumbing is not the same as explaining it — `127.0.0.1` read as jargon even
  here, where "they talk on the phone itself — no server, no signal" says the same thing and
  carries the privacy and offline consequences with it.
- Awkward news gets posted too, plainly (the Strava-heatmap removal, 2026-06-12 — the
  account's most-boosted post).

## What actually performs — and the two audiences differ

From the Mastodon API plus a Business Suite post-level export (Jan–Aug 2026, 47 FB posts).
**The two channels reward opposite things, so the same post does not belong on both.**

- **Scale.** Facebook reach runs 400–17,000 per post against a Mastodon account of ~64
  followers. Facebook is where the volume is; Mastodon's value is boosts carrying a post
  into the international OSM network, not raw numbers.
- **Foreign-country terrain updates are Mastodon's best and Facebook's worst.** Poland's
  shading: 9♥/6↻ on Mastodon, 456 FB reach. Italy: 7♥/6↻, and 403 FB reach — the lowest of
  the year. The Slovak Page audience does not care about Polish contours; the international
  OSM crowd does.
- **Slovak-relevant, practical, "go and use this today" posts are Facebook's best.** The
  cloud-inversion shading post — a mediocre 3♥/1↻ on Mastodon — did **9,263 reach, 127
  reactions and 266 link clicks** on Facebook. National terrain models: 4,880 reach.
- **The single biggest post of the year never went to Mastodon at all**: 2026-08-07,
  17,137 reach, 110 reactions, **426 link clicks** — the ÚGKK orthophoto update for eastern
  Slovakia, headlined in East-Slovak dialect ("Vychodňare, takoj vnimajce!"). Twice the next
  best. The lesson is the combination: a data update for one Slovak region, addressed to
  that region in its own voice. Repeatable, and nothing like it has been tried since.
- **Link clicks are the closest thing to a conversion signal** and they track practicality,
  not novelty: inversion 266, app launch 65, terrain models 23, most feature posts 0–10.
- **Video on Facebook is a lottery, not an upgrade.** Median reach by format: photos
  **1,193** (n=37), videos/reels **581** (n=7) — yet the single best post of the year is a
  video (17,137). High variance, and a *worse* typical outcome than a photo. Don't assume an
  animation will travel just because it moves; the reliable floor is a photo post.
- On Mastodon specifically, awkward news travels: the Strava-heatmap removal is the
  most-boosted post ever (10♥/10↻). Mastodon has no comparable format effect.

**So pick the lead per channel.** A terrain/coverage post leads on Mastodon; Facebook wants
the practical Slovak-usable feature, framed as a thing to do this weekend.

## Backlog

Post-worthy and unposted, newest first.

- `Weight`: **lead** = its own post and visual · **tail** = a bullet under someone else's
  headline.
- `Channel`: **🇸🇰 FB** = Slovak audience, practical and local · **🌍 Masto** = international,
  OSM/terrain/open-data · **both** = worth writing twice, in each channel's own language and
  angle. Never the same text on both.

| Weight | Channel | Topic | Commits | Notes |
|--------|---------|-------|---------|-------|
| lead | 🌍 Masto | **Norway 🇳🇴 terrain** — hillshading and contours regenerated from Kartverket's national DTM (deployed 2026-08-13), and premium elevation now reads the same model (NLOD 2.0) instead of GEDTM30. | `9abd1b90` (elevation API; the shading/contours are a renderer-side deploy, no commit in this repo) | **Mastodon lead, not Facebook.** Same shape as the Croatia and Poland posts, which are Mastodon's best performers — but foreign terrain is Facebook's worst (Poland 456 reach, Italy 403), so it is not worth the Page. Norway already has an OSM-community intro post to build on. Before/after animation (Mastodon has no format penalty), `#Norway #Norge`, credit Kartverket + NLOD 2.0. |
| lead | 🌍 Masto | **An elevation profile that tells you where its numbers came from** — the notch a bridge or a tunnel used to cut into a profile is levelled and clamped against the terrain, and the chart now lists the terrain models the profile was actually read from (reported per point by the elevation API, not guessed from the view), with the point readout naming them too. Credits added for GEDTM30 beyond the national models, IRPI-CNR's 5 m DTM in Italy, and Sonny's LiDAR DTM behind GraphHopper's routing. | `91de8afc` `c8a63e66` `d0bf62f1` `caa7d1ee` `ffa6cb7b` `6dddd517` | **Facebook already had the profile half** (2026-07-29, "Výškový profil je takmer raketová veda", 1,580 reach) — this is the Mastodon half, and the crediting is the part that suits it: naming datasets and licences is what this audience boosts. Before/after of a bridge notch as the visual. |
| lead | both | **Animated precipitation radar** — the `R` overlay: EUMETNET OPERA composite over Europe, 6 h of measured frames + 1 h nowcast, own playback toolbar (play/pause, stepping, timeline, colour schemes, smoothing, snow). Free = 2 h and no forecast; premium unlocks the full track. | `7ca9bef2` `d8be404c` `2a1a7369` `e0d11317` `6040b186` `dd847c90` `98871283` | **The Facebook lead.** Confirmed unposted (the last Mastodon post is steepness, 2026-08-01). It is the practical, Slovakia-covering, watch-it-move kind of post that Facebook rewards — the profile of the inversion post (9,263 reach, 266 link clicks). **On hold until it rains** (2026-08-13: record heat, nothing on the radar to show — an empty loop sells nothing). Post it when a front is actually crossing the country; that also makes it useful on the day rather than abstract. On Facebook, note the format finding above — an animation is the honest medium for radar, but video reach there is high-variance and typically *below* a photo post, so consider leading with a still of the radar over a recognisable Slovak view and putting the animation second. See [`weather-radar.md`](./weather-radar.md). |
| lead | both | **Search holds more than one result** — any number of results on the map at once, hovering the list previews one, "Keep on the map" pins it, and the URL carries them all. The Objects tool hands one — or every visible object — over to search as lookups. | `77f12b0f` `8cc9a138` `4be61e6b` `b6ddc927` `2ddde5b7` | |
| lead | 🌍 Masto | **WMS overhaul** — a custom WMS map is requested as one image per view instead of a 20–40-tile burst (fixes black tiles on rate-limited servers and labels clipped at tile seams); extent and minimum zoom are read from GetCapabilities; more servers' capabilities parse; a slow map shows it is loading. | `60108715` `f08e20c4` `4b24a05e` `da2de213` `bcbd3b00` | Triggered by an Italian ministry WMS — fits the Italy push in [`promotion-roadmap.md`](./promotion-roadmap.md) and an OSM-community channel better than a general audience. |
| tail | both | **Fractional zoom** — a Zoom step preference (1, ½, ¼, free); `+`/`-` still step whole levels. | `08f8a3f3` | |
| tail | both | **A map that can't be shown here is offered, not hidden** — a layer below its minimum zoom or away from its coverage stays in the menu with a button that takes you where it works. | `25c539a9` | |
| tail | both | **Custom and cached maps get their own icon** — an icon picker beside Name, drawn in the layer menu, toolbar, Configure layers and the map lists. | `0c7d21f6` | |
| tail | both | **Share sheet** — hand a GPX/GeoJSON export straight to the device's share sheet; the gallery shares the photo itself rather than a link. | `ec2bb48f` `e1705623` `e13fc083` | |
| tail | both | **Several toolbars open at once** — the route planner, objects, a recording and a loaded track can all be to hand; the one owning map clicks carries a green outline. | `fcce824c` `a93f24b4` | |
| tail | both | **Details panel follows the selection** — an ⓘ Details toggle on the search and objects toolbars, and an object's details show the terrain-model elevation. | `bacf3de8` `cb13c240` | |
| tail | both | **Elevation chart window is resizable** by a corner grip and remembers its geometry — the plot itself is left free for scrubbing by touch; pointing at the line on the map marks the matching place on the chart; a point with no elevation says why instead of spinning; the **legend** shows the zoom you are actually looking at. | `e562de6e` `8a421e42` `f408f23c` `a69f70b3` `7852ed12` | |
| tail | both | **Export the isochrones** you just computed, styled as the map draws them. | `d4896604` | |
| tail | 🇸🇰 FB | **Manage your own subscription** — the customer portal opens from the app, and a cancelled subscription is told apart from a lapsed one. | `2c24f665` `2876994a` | Belongs in the same breath as the pricing row below rather than on its own. |
| — | 🇸🇰 FB | **Colorize modes moved behind premium** — the "free during launch" badge became a real gate (elevation, speed and time stay free), and the purchase modal now compares one-time against subscription pricing at the point of choice. | `6dd14ebb` `0e46231b` | Announcement, not a feature post — different register, and easy to get wrong tonally. Decide whether to say it at all. |

## Posted — Mastodon (international, English)

Newest first. `Reach` is ♥ favourites / ↻ boosts, read when the row was added; refresh with
the curl above.

| Date | Topic | Reach | Commits | Link |
|------|-------|-------|---------|------|
| 2026-08-15 | **Record a track from the web app** — the PWA drives the standalone Android recorder over its loopback API; background recording with the screen off, live track, live elevation profile, Finish hands the ride to the track viewer. Android-only, experimental | 0♥ 2↻ (just posted) | `7616e552` `c8c9e171` `c5908bd8` `6af45d4b` `fda3f534` `803924c8` `27ecba06` | https://en.osm.town/@FreemapSlovakia/117098553555043788 |
| 2026-08-13 | **Polygons with holes in Drawing** — cut out a hole, make a hole of the enclosing polygon, detach hole; area net of holes, and holes survive GeoJSON/KML/GPX export | 0♥ 0↻ (just posted) | `a6616a8b` `63f2f890` `4d1fb42c` | https://en.osm.town/@FreemapSlovakia/117088914210123613 |
| 2026-08-01 | **Steepness at any point** — on a planned route, a drawn line, a GPX file or live tracking | 1♥ 5↻ | `ccfe422a` `64179169` `308f0eda` `29d34943` `2d66ceb7` | https://en.osm.town/@FreemapSlovakia/117019442212391027 |
| 2026-07-31 | **Croatia 🇭🇷 terrain** — shading + contours regenerated from the national 1 m DTM (© DGU), also powering premium elevation | 12♥ 8↻ | `6d2c314d` | https://en.osm.town/@FreemapSlovakia/117013755664869442 |
| 2026-07-27 | **Direction, distance and azimuth** — heading beam from GPS or compass, and a labelled line from your position to the crosshair | 3♥ 3↻ | `b4ea7537` `d5eb9745` `4eeeb06f` `42ebc571` | https://en.osm.town/@FreemapSlovakia/116991250866361203 |
| 2026-07-19 | **Italy 🇮🇹 terrain** — 5 m LiDAR model replaces interpolated 10 m TINITALY where available; before/after visual | 7♥ 6↻ | — | https://en.osm.town/@FreemapSlovakia/116946226599957843 |
| 2026-07-14 | **New map features** — windthrow areas, outdoor fitness stations, gyms | 1♥ 0↻ | — | https://en.osm.town/@FreemapSlovakia/116918137503643686 |
| 2026-07-13 | **Photos layer + Wikimedia Commons** — 31 M+ freely-licensed photos merged in, marker shape by source | 1♥ 0↻ | `83aa94a2` | https://en.osm.town/@FreemapSlovakia/116912307723009689 |
| 2026-07-10 | **Per-photo licences** — CC0 → CC BY-NC-SA, colour and filter the map by licence | 2♥ 1↻ | — | https://en.osm.town/@FreemapSlovakia/116895489767534007 |
| 2026-07-09 | **Poland 🇵🇱 terrain** — detailed hillshading + contours across the whole country | 9♥ 6↻ | — | https://en.osm.town/@FreemapSlovakia/116889810164287525 |
| 2026-07-07 | **French + Slovenian UI** added | 1♥ 0↻ | — | https://en.osm.town/@FreemapSlovakia/116877052767298764 |
| 2026-07-05 | **National terrain models + a worldwide 30 m model** for premium (thread, with a per-country resolution list) | 3♥ 1↻ | — | https://en.osm.town/@FreemapSlovakia/116866605289443988 |
| 2026-06-30 | **Route optimization** — shave off kilometres by reordering waypoints | 1♥ 1↻ | — | https://en.osm.town/@FreemapSlovakia/116838528048086024 |
| 2026-06-26 | **Tracks and data** — multi-file GPX/GeoJSON/KML/KMZ/TCX import + merge, colorize by elevation/speed/steepness, waypoints on the profile, save to My Maps, every recorded channel kept | 2♥ 1↻ | — | https://en.osm.town/@FreemapSlovakia/116816127417049500 |
| 2026-06-17 | **Cloud-inversion shading** — colour-relief band to see which hill clears the fog | 3♥ 1↻ | `574c8c37` | https://en.osm.town/@FreemapSlovakia/116764645446611486 |
| 2026-06-12 | **Strava heatmap removed** (API terms) — the account's most-boosted post | 10♥ 10↻ | — | https://en.osm.town/@FreemapSlovakia/116738960588819696 |
| 2026-06-12 | **Spain 🇪🇸 terrain** — improved hillshading and contours | 3♥ 4↻ | — | https://en.osm.town/@FreemapSlovakia/116736344875973100 |
| 2026-06-05 | **Map export overhaul** — true rendering of drawing styles and POI icons, scale bar / north arrow / attribution, better area selection | 4♥ 4↻ | — | https://en.osm.town/@FreemapSlovakia/116697796443395582 |
| 2026-06-02 | **Native mobile app update** — route marker time/distance, isochrones, gallery clustering + 360° viewer, TCX/FIT import | 2♥ 2↻ | — | https://en.osm.town/@FreemapSlovakia/116680686563828516 |
| 2026-05-15 | **Native mobile app launch** (iOS + Android), 3-post thread | 3♥ 3↻ | — | https://en.osm.town/@FreemapSlovakia/116578420790459694 |

## Posted — Facebook (Slovak)

Every 2026 post on the Page, newest first, from the Business Suite export described in
[`facebook-insights-prompt.md`](./facebook-insights-prompt.md) (exported 2026-08-13; figures
are lifetime-to-that-date). Topic text is the post's own opening line, trimmed. Many are
mobile-app releases and Slovakia-specific items that never went to Mastodon — that is the
point of tracking the two separately.

| Date | Post | Reach | Commits | Link |
|------|------|-------|---------|------|
| 2026-08-15 | 🏔️ Chystáte sa na miesta so slabým signálom? Vylepšili sme Offline mapy vo webovej aplikácii Freemap… (2 photos) | *(pending — re-export)* | `17f27fbe` `3d7a10e9` `ef0278b7` `1bb1cd19` `dd3e3c28` `7147f796` `508f3892` `736fd65b` `dde43a89` `bff71a23` `818eb550` `1898901b` | — |
| 2026-08-13 | 🕳️ Jazero s ostrovom? Čistinka uprostred lesa? Odteraz sa dá nakresliť aj polygón s dierou.… | *(pending — re-export)* | `a6616a8b` `63f2f890` `4d1fb42c` | — |
| 2026-08-09 | Vydali sme novú verziu mobilnej aplikácie freemap - 1.2.0. Novinky: 🗺️ Nové vrstvy mapy podľa v… | 847 reach · 20 react · 9 cmt · 1 shr | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02tt1X7JtvYDCasZiNzhEa5yw1E5vfMhGite4CXzxc41HdgpjRcss5xU176fFJRWjrl |
| 2026-08-07 | Vychodňare, takoj vnimajce! Po troch rokoch tu máme aktualizáciu Ortofotomozaiky SR od ÚGKK pre… | 17,137 reach · 110 react · 5 cmt · 8 shr · 426 link clicks | — | https://www.facebook.com/reel/897443029644521/ |
| 2026-08-05 | 📐 Ak potrebujete vedieť stúpanie miesta na trase, Freemap je váš nástroj. | 744 reach · 14 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0USuBJiMXStRnoRuqF3DCfjPBAr6894RtryCn2q7XxVFQddHYY4NXgtKqjRAbAfiRl |
| 2026-08-03 | V mobilnej aplikácii pribudli dve významné funkcie: Ste na túre a pri pohľade na oblaky neviete… | 751 reach · 16 react · 1 shr | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid04mN9Czh9Basg7Z9g7cJJ4pPLLwJDMBPC72JHsVk2tc1cCWfJsiHs7TGemytDKzZKl |
| 2026-07-31 | *(no caption in export — videos)* | 5,977 reach · 14 react · 1 shr · 22 link clicks | — | https://www.facebook.com/reel/1523385346227371/ |
| 2026-07-30 | Akože čože!? Nahrávanie trasy priamo vo webovej aplikácii www.freemap.sk? A čo by nie. S našou… | 669 reach · 12 react · 1 cmt · 2 link clicks | `7616e552` | https://www.facebook.com/FreemapSlovakia/posts/pfbid028JngnzT41pxx6i7trnUZ6AnGC9xPWYbbCxKUjaiFS4qyGHeetH9e4kMQYWBLzoz7l |
| 2026-07-29 | Výškový profil je takmer raketová veda 🚀 Znie to ako triviálna vec: vezmi trasu, pozri sa do mo… | 1,580 reach · 33 react · 5 cmt · 1 shr | `91de8afc` `c8a63e66` | https://www.facebook.com/FreemapSlovakia/posts/pfbid06nmPis2sBQgfBq5rUSfj4N77RrydKYGp6NBfprkr3i7Uf3wu9MpdQAN6eYtSU2j3l |
| 2026-07-27 | 🧭 Do webovej aplikácie www.freemap.sk sme pridali zobrazenie smeru, vzdialenosti a azimutu. ➤ U… | 1,388 reach · 20 react · 10 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0q5QYkNsSW8vkkEkRENtHVVdXcpAugqYaoLfp4RX1qJ5jD34njYaKvy7EPjCQ9N4Ll |
| 2026-07-19 | 🇮🇹 Aktualizácia terénu Talianska na outdoorovej mape Freemap. Na miestach, kde sú dostupné LiDA… | 403 reach · 9 react | — | https://www.facebook.com/reel/929224993521353/ |
| 2026-07-14 | Dnes máme pre zmenu nejaké vylepšenia na našej outdoorovej mape. Keď na turistiku 🥾️, tak radše… | 1,571 reach · 26 react · 8 cmt | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02QRBxdnKfJXyDku5uYptsgWch2WYQuxR4eeNsA6cpaqhFk2ygJMqTQRYRaXW4jN5Ul |
| 2026-07-13 | 📸 Novinka vo vrstve Fotografie na Freemape! Nedávno pridanú samostatnú vrstvu s geotagovanými f… | 1,193 reach · 29 react · 10 cmt · 10 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid03aEbthwoXSgBV4Hv7R2YJnXQyq3ZPFuH7Rv9V3ch63bvKWtheiJeVW5HmP9aMkrol |
| 2026-07-10 | 📸 Novinka: licencie pri fotkách! Doteraz mali všetky fotky na Freemap.sk jednotnú licenciu CC B… | 407 reach · 11 react · 3 cmt · 1 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0Ujq15MyhBcCnHzRVfFERjyz9uX1pUFyLPC7AJFeVocAMYzmjgoDseU1sULX6v1Dml |
| 2026-07-09 | 🏔️ Poľsko má nové detailné pokrytie tieňovaného reliéfu a vrstevníc! Doteraz sme podrobné dáta… | 456 reach · 17 react | — | https://www.facebook.com/reel/1678179170982186/ |
| 2026-07-05 | 🏔️ Práve sme pridali podrobné modely terénu pre viacero krajín a nový kvalitný celosvetový mode… | 4,880 reach · 35 react · 3 cmt · 1 shr · 23 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0vr8q3Z8fxVn8CYmLNGzcCgPTPyk9HiHGC8zh9bJfvHfA7Gmj84rsFMUdGN1yQthyl |
| 2026-07-01 | K offline mapovým vrstvám sme do webovej aplikácie freemap.sk pridali aj offline "moje mapy", n… | 635 reach · 6 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02k3bYRdKUU6yt7QcJkcWU5P6WzfxehDY3dQ8M5otzgrX8UtMERGSNhfdUtaQGW5ZMl |
| 2026-06-30 | Zoptimalizujte si svoju plánovanú trasu, nech sa v tejto horúčave úplne nezničíte 🌞. | 509 reach · 6 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0V7zqnWBweAy98dLU7PhLV1DaD1ZbcQCeWr85SxSnxZmiNNozCMVFJyACW4cm3tYjl |
| 2026-06-29 | *(no caption in export — photos)* | 256 reach · 4 react · 8 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid07Bha7RXY915iTSz51bZDNPTbv6GfPAa8XWC6otqvbmfJCSuVessPUotHiD9EmGdYl |
| 2026-06-27 | Stačí vám výška ±🚌, alebo potrebujete bezpodmienečnú presnosť 🔬? S Freemap Premium 💎 posuniete… | 2,418 reach · 22 react · 6 cmt · 1 shr | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0MWTj77o8F9c8WNcSDeD2iQcVv1nmg2oYGb2Er2HTRpSkXSsxJNdbxjAYFXFT6CYYl |
| 2026-06-26 | 🏔️ Veľká aktualizácia pre turistov, cyklistov, bežcov – a všetkých, čo pracujú s mapovými súbor… | 1,499 reach · 44 react · 3 cmt · 4 shr · 6 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0SQQaxpU4AafyqL165pw3r6M8oFvSv61fc9KKWa8WybSztEmXuojKiNRFK5ztzZzzl |
| 2026-06-17 | Má byť inverzia 🌁 a neviete na ktorý kopec sa vyštverať? Alebo má byť nízka oblačnosť ☁️ no nec… | 9,263 reach · 127 react · 10 cmt · 9 shr · 266 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0Cv2Vz9BjAhASZEjwJpsdR8wZPkq76xCqzW3QduhFTJbFsDXsLkthxT9w8hpVfhNYl |
| 2026-06-12 | Väčšinou sem chodíme s dobrými správami. Táto medzi ne tak celkom nepatrí. 😅 Z Freemapu sme mus… | 1,507 reach · 33 react · 15 cmt | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0MJSxzpmv8E8gA7my6gZJkfyDM9FBxfYgqozgG6y54JisizDADF9zDQW4gnYmYq3Gl |
| 2026-06-12 | Plánujete outdoorové dobrodružstvo v Španielsku? 🇪🇸⛰️ Práve sme nasadili vylepšené tieňovanie k… | 498 reach · 11 react · 2 cmt · 2 link clicks | — | https://www.facebook.com/reel/1031294482799452/ |
| 2026-06-10 | Stravníčky a Stravníci, pridali sme experimentálny import svojich záznamov zo Stravy. Hľa: http… | 1,316 reach · 22 react · 4 cmt · 14 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0dgU41qDQ1gMDEoYVJ5fBFXnsvQut9sPS2nCw36fZLrQtfosUBsgx6BFTSdk6vafql |
| 2026-06-08 | Keď už sme nedávno potešili jablčkárov, potešíme aj vlastíkov okien, stravníkov a milovníkov ch… | 1,520 reach · 15 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0YWaNqJiGi8v4ozyJGReenMeA3A853ZLRZr4KhswkQDYWo6NL5GkbpPj3RsXpdBvul |
| 2026-06-02 | 🗺️ VYLEPŠILI SME EXPORT MAPY! Potrebujete dostať mapu do obrázka, PDF alebo SVG? Či už chystáte… | 539 reach · 14 react · 1 shr · 3 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0vwpBWrjrPhez6iGWqoZms3R4VmHB5UhLSW29Ltm1BcJJ2w5pbeYsKE2SBEEAAzBpl |
| 2026-05-29 | 🗺️ Na Freemap.sk pribudla kopa noviniek! 🤩 📌 Nakresleným bodom v mape si môžete zvoliť tvar (šp… | 1,969 reach · 36 react · 3 cmt · 1 shr · 5 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02gAjTELKWxKURoW3RwwJjfAoxQ54ssbDvGBAgz6KP57u24bctCsX8B7sRmj1VJqLKl |
| 2026-05-23 | Novinky v natívnej mobilnej appke! Do našej natívnej aplikácie sme postupne pridali množstvo vy… | 1,768 reach · 36 react · 8 cmt | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0RR5AResUcQgeN8wnN8DNL1z6R87DovkZvsDRLowoog2AiAWc1dxFQ9qYiJ1JYijAl |
| 2026-05-22 | Minulý týždeň sme sa zúčastnili medzinárodného programu Open Geospatial Technologies in Humanit… | 950 reach · 23 react · 1 shr | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02wc37TodujJtEcUNY9ZjX6ZxaB1R4aBe3JFGrxKKg649Rz54mtJ8jqnMuYDWQkzZql |
| 2026-05-19 | Maličkosť, ale niekoho možno poteší - v predvoľbách máp si viete nastaviť farbu Strava heatmapy… | 1,003 reach · 35 react · 1 cmt · 1 shr · 14 link clicks | — | https://www.facebook.com/reel/960599393250575/ |
| 2026-05-15 | 🎉 Freemap konečne v mobile aj ako natívna aplikácia! 📱 Natívna appka je už dostupná pre iOS aj… | 3,630 reach · 105 react · 24 cmt · 6 shr · 65 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0LeZ1AVt7yhXceTHuC4PTymCBmqRJobkYJaKM2aEPoXFSyyta6ADEvZnBmjiUDmKql |
| 2026-05-14 | Na našej outdoorovej mape freemap.sk sme výrazne vylepšili detaily tieňovaného reliéfu a vrstev… | 581 reach · 25 react · 2 cmt · 4 link clicks | — | https://www.facebook.com/reel/1511356373879054/ |
| 2026-05-07 | 🍎 Tak už aj jablčkári majú konečne svoje prihlásenie 🍏 | 433 reach · 5 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02mYJtNYaXbTg6aDbrG2NDqKx1vKKApu7WSnx5AgPBM11FU85sKNP9sNi5ZbWBbUg3l |
| 2026-05-05 | 🖼️ Pridali sme vrstvu fotografií z Wikimedia Commons (https://commons.wikimedia.org/). Pomôže h… | 783 reach · 20 react · 4 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid023ebujbEdEFeAihijLpXx3hKvV16HTGVdoyUsT1Xc3yXwouMrGrN2dA73n4P2MzxJl |
| 2026-04-24 | Pridali sme ďalšie predvoľby máp: • Škála rozlíšenia - máte UHD (4K) alebo QHD monitor ale poma… | 515 reach · 6 react · 1 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02GK9eUjamST9KmUVopLkunrqaJjM84vMcgEMpB1S7K9HXn8djAHZuCP4oLNq26Fakl |
| 2026-04-21 | 🏔️ Nová funkcia: Offline mapy Poznáte ten pocit? Ste niekde hlboko v pralese Polonín, kde strom… | 4,425 reach · 70 react · 3 cmt · 4 shr · 45 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02RWe9UmTpXZzAgRxi9fS1yE96diYXSYFHNrzDYTwLHbqTJ4ujqor6yfMrA6j18sxrl |
| 2026-04-21 | Pridali sme možnosť upraviť štýly čiar v mape. Prejaví sa to aj v exporte mapy do obrázka alebo… | 642 reach · 17 react | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid025wjFwQco54RquayqoLVucyiNurYNVh65s5EnPbwJ1cc55xxL5vDjoG3wBgun9aCdl |
| 2026-04-03 | Iste ste si dnes všimli chvíľkové výpadky našej outdoorovej mapy - nasadzovali sme novú verziu;… | 1,772 reach · 26 react · 3 cmt · 1 shr | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0uY8DBGCRyNKSu685X4JkFquxmMmCqA4pRF8o4Xtk3tiASUDC9pLKUXeYAZG41sNfl |
| 2026-03-30 | Stav našich služieb pod drobnohľadom: https://status.freemap.sk/status/all Za hostovanie služby… | 1,074 reach · 12 react · 3 cmt · 18 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02Po9gJuG2wa7FEWesJjNk7rEVvswuGoQjLrsDHHNQkK9WT2a1E9ZSUSztcuwiJthpl |
| 2026-03-18 | Rozšírili sme spektrum zariadení pre sledovanie na www.freemap.sk - podporujeme teraz viac ako… | 963 reach · 13 react · 1 cmt · 21 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02QhF7Loudcf1oUhTbxYejsd1vpTcdTihfcVHqiK5GU85Tr1ngD5FWKF1NuE2RY3ydl |
| 2026-03-04 | Vyhlasujeme súťaž o najlepšieho fotografa 📸! Na výhercov čakajú hodnotné ceny ako ajFón 20 😉, P… | 907 reach · 14 react · 5 cmt · 12 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid034Bwm8XwnEqXFoe2ZE3AK3n5aXScMDekJwbpsv8P4yhRTQmj2E7xwZK3HPS7rKX7Rl |
| 2026-02-27 | Doladili sme oblasť renderovania Outdoorovej mapy, a pri tej príležitosti sme pridali aj Špicbe… | 2,246 reach · 34 react · 5 cmt | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0moANU6UwSgSonzxr68Yt7YqP8ABpGUm7MF7dJ6iRDLC7s7FjKoXCkJ1v6U9TKAnXl |
| 2026-02-24 | Pre KST sme pripravili mapu len s ich oficiálnymi trasami; kuk https://mapy.kst.sk/ (disclaimer… | 914 reach · 27 react · 4 shr · 73 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0n5erhw61U15surTLrZQBd4infAQRcgF7ohTop9XJqUESNdtCe6WMwpnABBjjxBvql |
| 2026-02-22 | Neni týždňa, keď sa potrebuje niekam odnavigovať autom 🚗, presedlať na bike 🚴, v hore ho odpark… | 5,230 reach · 58 react · 14 cmt · 4 shr · 39 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02Ra8qjFccEe4i6KBUURBV8USYbpUfdTZBPjfCMjs2bGz9J5McY6XAQ7nV4jmGytBDl |
| 2026-02-18 | Pre širšie, anglicky hovoriace publikum a pre viac technicky orientované OSM správy sme založil… | 362 reach · 4 react · 7 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid0gRFwBGxc2GEC1UCfa7rJ6ww65HcovoWHt3f6peXwkFZY7QtPhieedbbVwbCdxAJ8l |
| 2026-02-15 | Tentoraz sme zamakali 💪 najmä na legende mapy a mapových prvkoch: 🏷️ v legende mapy si naši mil… | 1,796 reach · 45 react · 4 cmt · 2 shr · 12 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02YNiFoVULS37gCTLWDvyuU7nrMJBt5pHxvHBUnWat5B4ba89AKsKxqb5erC5vnKkWl |
| 2026-01-29 | Športu zdar! Hlavne v tomto duchu sa nesie posledné vylepšenie našej outdoorovej mapy - pribudl… | 741 reach · 25 react · 2 shr · 2 link clicks | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid026ZLCjUfKieAmBghMWMUaC1d7GejA3KeUUnwyG8N7km4vtYvEkm8Xzae9NKVW2sCml |
| 2026-01-01 | Šťastný nový rok ... veľa zmapovaných miest, pomocou mapy objavených zákutí a fotiek na našej m… | 3,975 reach · 82 react · 5 cmt | — | https://www.facebook.com/FreemapSlovakia/posts/pfbid02epRqm2B7KGmUzaqCPcfAWEb4WTNukEncEdpJoZZmZeT81ZsX8tsCYw3ai8DgN1Unl |
