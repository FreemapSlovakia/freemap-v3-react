# Freemap.eu foreign-growth roadmap

Goal: grow usage (and premium conversions) outside Slovakia. Data-driven; based on
Matomo (site 1, `www.freemap.sk`) last-365-day country / language / referrer cuts,
July 2026.

## Why these markets

Foreign audience is concentrated in a Carpathian/Alpine ring where three product
assets already line up: localized UI, hi-res LiDAR elevation, and outdoor culture.
Quality is read from **actions/visit + time-on-site**, not raw visits (US ~178k
visits is bots/SEO noise at 3.1 actions / 43s — ignored).

Real engaged foreign markets, best first:
Italy · Poland · Hungary · Austria · Czechia · Germany · Slovenia.

Distinctive positioning hooks (lead with these, not "another OSM map"):
1. Free, open source, no user tracking. **Not** "ad-free": the map carries our own
   self-served ads (no ad network) that disappear for supporters — never claim otherwise.
2. Hi-res LiDAR terrain + shaded relief + contours ("see every gully and old road").
3. Real offline maps + GPS-device export (Garmin/Locus/OsmAnd) + live tracking.
4. Multi-profile route planning with elevation profiles. The real profiles, from
   `src/shared/transportTypeDefs.tsx`: foot, hiking, easyhike, bike, mtb, gravelbike,
   racingbike, ebike, stroller, car, carnotoll, car4wd, motorcycle, manual.
   **There is no ski-touring and no horse profile** — "Hiking, Bicycle, Ski, Riding"
   is the name of the *map layer*, not a list of routing profiles. Do not confuse them.
Hooks 2–4 are also the premium hooks — users drawn by them convert best.

---

## Current state — 2026-09-07

**Goal restated:** attract users to the *whole application* (planner, offline maps,
exports, panorama, viewshed, tracking, drawing, custom layers), not only to the
outdoor map. Everything posted so far sold "a map", which is why all the feedback
came back about rendering. Correcting that is the point of the next phase.

**Scope: Europe only.** The map covers ~46 European countries. Do not spend the good
one-shot channels on a mostly-US audience — Hacker News was considered and dropped
for this reason.

### Accounts

| Venue | Account | State |
|---|---|---|
| hikr.org | `MartinFreemap` (shown as `MartinFree`) | active, 2 posts, joined comms `talk` + `italiano` |
| avventurosamente.it | `MartinFreemap` | active, staff-approved 2026-09-04 |
| gipfeltreffen.at | `MartinFreemap` | active, admin-approved 2026-09-06 |
| alpinforum.com | `MartinFreemap` | registered but **unused — wrong audience** (ski resorts/cable cars) |
| mtb-forum.it | none | **registration broken on their side** (invalid reCAPTCHA key, dead Meta app) |
| tourentipp.com, fuorivia.com | none | candidates, never registered |

### Posted (details in the Outreach log below)

1. **hikr.org / Small Talk** (DE) — drew 3 named people: Bergmax (bug reports),
   ABoehlen/Adrian (**quality manager of swisstopo's swissTLM-Regio**, public
   endorsement over OpenTopoMap), kopfsalat (critique of coloured trails). All answered.
2. **avventurosamente.it** (IT) — offline maps after 4UMaps. No replies yet.
3. **gipfeltreffen.at** (DE) — entry in the pinned map index; opens by answering
   Exilfranke, who is active daily.
4. **hikr.org / Hikr in italiano** (IT) — drew Garabombo (CM), an OSM mapper who gave
   a 14-point expert cartographic review. All answered.

### What the outreach produced for the product

Eight issues on `FreemapSlovakia/freemap-outdoor-map`: **#83** tidal channels in the
Watt, **#84** contours drawn over open sea, **#86** `bicycle=no` cross too prominent
(**reported independently by two people in two countries**), **#87** `historic=ruins`
icon, **#88** `historic=chalet`+`ruins=yes` renders nothing, **#89** unnamed spot
elevations, **#90** penstocks too prominent, **#91** `information=board` labels.

Also surfaced: the premium notice reads as a caption rather than a control (a first-time
visitor could not tell it was clickable), and the authoritative nameservers
(`ns1-3.webhouse.sk`) have no AAAA records — a robustness nit only, IPv6 to the web
server itself verified working.

## Next phase — whole-app verticals

Hiking forums pit you against komoot, Mapy.cz, OutdoorActive and swisstopo. Communities
organised around **a need only Freemap serves for free** have no incumbent. Ranked:

| Vertical | Hook with no free equivalent | Europe fit |
|---|---|---|
| **Geocaching (CZ, AT, SK; DE later)** | coordinate entry in many formats, offline area download, GPX + Garmin/Locus export, drawing/measurement, custom WMS/TMS overlays | DE and CZ are the two densest geocaching countries in the world — exactly where the national high-res terrain is |
| Paragliding / free flight (Alps) | 360° panorama with named peaks, viewshed, hi-res relief, custom airspace WMS | Alps = AT/CH/IT/SI/FR, all with national DTM |
| Ham radio, drone (VLOS), hunting | **viewshed** — line of sight from a point | EU-wide; drone VLOS is an EASA legal requirement |
| Gravel / bikepacking | multi-profile routing + surface / steepness / track-grade colorize | DE/AT strong, but komoot is entrenched |
| GIS / developers / hobby cartographers | custom WMS/TMS, embedding, WebMCP agent tools | EU-wide, small but influential |
| Ski touring | terrain + steepness colorize | **seasonal — revisit in November**, pointless in September |

### Geocaching: warm channel already found

`geocaching.cz` runs a long-lived thread **"Mapové zdroje pro Geocaching Map
Enhancements"** (28+ pages) in which **freemap.sk tiles are already listed as a map
source** (Outdoor LowDPI / HiDPI / UltraDPI) for the GME userscript, described there as
*"a great map application above OSM data and the map key is very well readable"*. There
is also `geocaching.cz/wiki/Free_mapy_(garmin)`.

So Czech geocachers already consume the **tiles** and most likely do not know the
**application** exists. That is the gap to close — and it is the same warm-channel
pattern that worked in Italy and Austria.

`geoclub.de` is the largest German-language geocaching forum and has a dedicated
**Geocaching Software** section (`/forum/categories/geocaching-software.83/`).

**Not yet done:** confirm current activity on both, check registration flow before
writing copy (the mtb-forum lesson), and check whether Freemap is mentioned on
geoclub.de at all.

### Revised order (2026-09-07, after Martin's steer)

Martin's direction: **stay with hiking/bicycle forums and add Facebook groups** — those
are proven here — but change the *message* to the whole application rather than the
cartography. Germany is postponed (see Phase 3). Facebook division of labour: **agent
drafts, Martin posts** (Facebook fights automation, and the Polish group post that
worked went out from his own account).

Next market must have hi-res terrain already **and** an untapped forum scene, which
points at **Czechia**: DMR 5G coverage, Czech UI shipped, very high engagement in
Matomo, and Martin can verify Czech copy himself.

Czech venues found: **bike-forum.cz** (largest CZ MTB/road forum), **nakole.cz**
(cycle touring). Editorial rather than forum, so embed/partnership targets instead:
**treking.cz**, **horydoly.cz**, **mtbs.cz**. Note horydoly.cz ran a "Live sledovanie
Cesty SNP" piece — live tracking is a Freemap feature, worth checking for an existing
connection.

### Start here, next session (state as of 2026-09-07 evening)

**Read first:** [`product-and-market.md`](./product-and-market.md) — what the product
actually is. Copy written from this roadmap instead of from the code produced three
false claims in live posts. Also note a **private business/revenue document lives
outside this repo** (Martin's Drive): it holds the subscriber numbers, the €2,500/month
sustainability target, the ARPU analysis and the "Freemap for organisations" plan.
Nothing commercial or financial belongs in this public repo.

**Live and needing nothing:** four posts are up — hikr.org Small Talk (DE),
hikr.org Hikr in italiano (IT), gipfeltreffen.at pinned map index (DE),
avventurosamente.it (IT). All claims in them are corrected and accurate.

**Do next, in order:**

1. **Answer replies.** This is where all the value has come from — a tracked rendering
   bug, a public endorsement from swisstopo's swissTLM-Regio quality manager, a 14-point
   expert review, a likely new OSM contributor. Martin forwards the hikr notification
   mails. Draft the reply in **English first** (he does not read German/Italian well),
   then post the target-language version once he approves.
2. **Czechia is the next market.** Hi-res terrain (DMR 5G), Czech UI shipped, high
   Matomo engagement, and Martin can verify Czech copy himself. Venues found:
   **bike-forum.cz** (largest CZ MTB/road forum), **nakole.cz** (cycle touring).
   Editorial rather than forum, so embed/partnership targets instead: **treking.cz**,
   **horydoly.cz**, **mtbs.cz** (note horydoly ran a "Live sledovanie Cesty SNP" piece —
   live tracking is a Freemap feature, check for an existing connection).
   **Check the registration path before writing copy** — the mtb-forum.it lesson.
3. **Lead with the whole application, not the cartography.** Everything posted so far
   sold the map, which is why every reply came back about rendering. The app is a map
   *workbench* — planner, offline, exports to Garmin/Locus/OsmAnd, drawing, embedding,
   panorama, viewshed — and there is a **native Flutter app for iOS and Android with
   on-device offline routing** that almost nobody outside Slovakia knows about.
4. **Facebook groups:** agent drafts, **Martin posts**. Facebook fights automation and
   the Polish group post that worked went out from his own account.
5. **Do not re-post to venues already used.** The platform framing reaches those
   audiences through replies and, much later, a "what's new" post — not a second
   introduction days apart.

**Parked deliberately:**

- **Germany** — until hi-res shading and contours cover it (Martin's call). Venues
  researched and waiting in Phase 3.
- **Ski touring** — seasonal, revisit in November. There is no ski-touring routing
  profile, so do not promise one.
- Draft 3 (avventurosamente "what changed since 2023" — wait a few days, ≤2 links),
  Draft 5 (embed pitch to Italian trail sites — needs contact addresses and a decision
  on sending), Draft 8 (MTB-MAG broken-registration report).
- The **Skelter PM** on avventurosamente is abandoned: dormant since March 2025 and the
  spam filter refused it.

**Outside the outreach work but higher value per hour:** a **Slovak-language page for
organisations** on zdila.sk. The site exists and is good, but it is English-only, sells
capability rather than outcomes, carries no price anchor, and omits the ZMOS reference.
Details in the private document.

## Claims that must stay accurate

Three false claims went out in live posts on 2026-09-04/06 and had to be edited
afterwards. Check copy against this list before posting.

| Do not write | Reality |
|---|---|
| "ad-free", "werbefrei", "senza pubblicità" | The map **carries ads** for non-premium users. They are **self-served — no ad network** — and they disappear for supporters. Say that instead; self-served ads are a better story than silence. |
| "non-profit", "gemeinnützig", "no-profit" | The association does not profit, but Martin is paid as the developer. Normal and unobjectionable — just don't make the claim. "A project of the Slovak OpenStreetMap community, open source" is true and needs no qualifier. |
| ski-touring or horse routing profile | Neither exists. The profiles are foot, hiking, easyhike, bike, mtb, gravelbike, racingbike, ebike, stroller, car, carnotoll, car4wd, motorcycle, manual (`src/shared/transportTypeDefs.tsx`). "Hiking, Bicycle, Ski, Riding" is the **map layer's** name — not a profile list. |

**Safe to claim:** open source; no user tracking (self-hosted analytics only, no ad
network, no third-party trackers); national high-resolution terrain in the countries
listed in `OUTDOOR_NATIONAL_DTM_ATTRIBUTION` (**not** Germany); trails drawn from
`osmc:symbol` with `ref`/`name` labels; offline download; Garmin/Locus/OsmAnd exports.

**Verify feature claims against the code, not against this roadmap.** Hook 4 below
carried the ski/horse error for months and it propagated into two published posts.

---

## Phase 0 — Poland activation (hi-res shading + contours deployed 2026-07-09)

- [x] Finish hi-res shading + contours coverage for Poland (deployed 2026-07-09;
      announced on Mastodon — see Outreach log). The shading + contours are part of the
      Outdoor map for everyone; premium only unlocks the higher zoom levels (19–20), the
      same as everywhere else — nothing Poland-specific is gated.
- [x] Polish-language launch post drafted and posted to the Polish OSM community
      (2026-07-09, see Outreach log). The hook is the terrain, not the UI — Polish UI has
      existed for years; engagement already high (11.6 actions, 209s).
- [x] Seed end-user channels — posted the terrain-led post to a Polish FB hiking group
      (2026-07-09, see Outreach log).
- [ ] Optional: more Polish FB hiking/MTB groups (Tatry/Beskidy/Sudety) and Fediverse
      (pl hiking/OSM hashtags). Reddit is weak for PL outdoor; skip the dormant classic
      hiking forums (szlaki.net.pl etc.).

## Phase 1 — Localization expansion

- [x] **Slovenian** UI added (highest fit-per-effort: Alpine, hi-res DEM exists, 378s
      engagement) and announced (2026-07-09) to the Slovenian OSM community and the
      hribi.net outdoor community (the latter auto-translates across the hike.uno network,
      so it also reaches IT/DE — see Outreach log).
- [x] **French** UI added (aggregates FR + Belgium + CH-Romandy + LU; Alps/Pyrenees)
      and announced to the French community. Follow-up: broaden to French-speaking
      outdoor communities (Belgium, CH-Romandy, Pyrenees).
- [ ] (Optional) Ukrainian — Carpathians + diaspora.
- [ ] Deferred: Spanish (Spain/LatAm only, peripheral — NOT a pan-Europe lever),
      Dutch (speakers use English UI).
- Note: adding a language is an ongoing cost (new `en.tsx` strings need translating);
  `translate-missing` skill fills `TODO translate` markers to keep the cost low.

## Phase 2 — Italy: cultivate the warm channel (highest-ROI foreign market)

Italy is already sending genuine engaged traffic with zero outreach — Italian trail
sites link organically (camminodelledolomiti.it, avventurosamente.it 9.4 actions/295s,
amicodelpopolo.it), plus a LiDAR/archaeology niche (lidarandaerialarchaeology.com).

**Working file with the venue research, the finished Italian drafts and the current
account/blocker state: [`promotion-italy.md`](./promotion-italy.md).** Read it before
touching Italy — it carries which venues already know Freemap (and so must never be
"introduced" again) and which are cold.

- [ ] Partnership/embed pitch (EN + IT) to the Italian trail sites already linking in;
      offer the embed-map widget + attribution. (Draft 5 written.)
- [ ] Post in Italian hiking/MTB communities (CAI-adjacent forums, FB groups, subreddits).
      - avventurosamente.it — account registered, **awaiting admin approval**; Drafts 1–3.
      - mtb-forum.it — reachable, **not registered**; Drafts 6 (track-merge answer) and 4/7.
      - fuorivia.com, hikr.org (IT) — not started.
- [ ] Lead with hi-res terrain (Dolomites) + offline maps + free/OSS.
      Correction from the research: on avventurosamente the strongest hook is **CAI trail
      numbering** (`osmc:symbol` colours + `ref` labels), which their forum has asked for
      repeatedly and never had answered. Terrain is the second punch there.
- Italy's national model is **HR-DTM 5 m (IRPI-CNR)** — 5 m, not the 1 m LiDAR wording
  used for PL/SK. Say 5 m.

## Phase 3 — Broaden community seeding (DE, AT, CZ, HU)

**Austria is the entry point for the German-language push, not Germany** — see
[`promotion-austria.md`](./promotion-austria.md) for the venue research and drafts.

- [ ] **Germany is POSTPONED (decided 2026-09-07)** until hi-res shading + contours cover
      it. Martin's call, and the right one: entering the biggest market with the weakest
      terrain spends the one first impression on a weaker product. Revisit when the German
      high-resolution data ships. German venues researched and parked meanwhile:
      **mtb-news.de** (largest DE MTB forum, XenForo, registration has a question-captcha),
      **wanderforum.de** (already has a thread "Online-Wanderkarten für Tschechien und die
      Slowakei" mentioning Freemap — warm), **rennrad-news.de**, **trekkingguide.de**.
      Also worth knowing when the time comes: **komoot was acquired by Bending Spoons in
      March 2025 with mass layoffs**, and German forums carry long-running threads
      ("Komoot wird immer unbrauchbarer", "Navigation Apps - Alternativen zu Komoot").
      Displaced-user moment in exactly this category — but it is a slow grumble, not a
      stampede, so do not overestimate it.
- [ ] Germany — biggest untapped ceiling BUT **no national high-res DTM** (`de` is absent
      from `OUTDOOR_NATIONAL_DTM_ATTRIBUTION`; it falls back to 30 m GEDTM30), so the
      terrain hook cannot be used there. Lead with tools/offline/OSS instead.
      German outdoor forums, Wander/MTB subreddits, Fediverse. (talk-de intro done once.)
- [ ] Austria — Alpine, ALS DTM (Geoland.at), 13 actions/visit; **warm channel found**:
      gipfeltreffen.at (ÖAV-affiliated) already carries a 2023 organic mention from two
      heavyweight posters, including an unanswered "I can't find aerial imagery"
      objection. Registration there is healthy (no reCAPTCHA, no approval queue).
      German copy written for Austria is reusable for DE and CH.
- [ ] Czechia + Hungary — reinforce (UI localized, very high engagement already).
- [ ] Emphasize non-OSM channels: hiking/MTB forums, regional FB groups, subreddits,
      Fediverse hashtags — the paying outdoor users, not just mappers.

## Phase 4 — Complete the OSM-community intro-post matrix

**Reconsidered 2026-09-04 — do not complete this matrix.**
`community.openstreetmap.org` is one Discourse instance: the per-country categories
share a global feed, so the FR/FI/NO/SI/PL intro posts were largely read by the same
people. Further per-country intro posts reach few new readers and start to look like
repetition to the regulars, which costs more goodwill than the posts gain. Martin has
already posted under several local communities and observed exactly this.

- [x] Slovenia — posted 2026-07-09 (see Outreach log).
- [ ] ~~Italy, Poland, Hungary, Austria, Czechia OSM community intro posts.~~ Dropped.
      Post there only when there is genuinely country-specific *news* (e.g. a national
      terrain model going live), not to introduce the project again.
- Note: OSM forums reach mappers, not end-users anyway — the paying outdoor users are
  on the hiking/MTB forums and in regional FB groups (Phase 2/3).

## Phase 5 — Measure & iterate

- [ ] Identify which Matomo goal IDs = real premium purchases (goal "revenue" in the
      country report is goal-value, not currency). Then pull paying-users-by-country to
      confirm where money — not just engagement — comes from.
- [ ] After each push, re-check that country's visits + actions/visit + conversions.
- [ ] Feed learnings back into which market/language to do next.

---

## Current UI languages
Slovak, Czech, Hungarian, English, Polish, German, Italian, French, Slovenian.
Missing but relevant: **Ukrainian**.

## Existing promotion channels
groups.google.com/g/osm_sk · en.osm.town/@FreemapSlovakia (Mastodon) · facebook.com/FreemapSlovakia

## Outreach log

Version-controlled record of market-intro posts (replaces the old Google Doc).
Add a row per post; keep `—` where the date is unknown rather than guessing.
"Here is what's new" feature announcements go in
[`announcement-log.md`](./announcement-log.md) instead.

| Date | Market | Channel | Lang | Status | Link |
|------|--------|---------|------|--------|------|
| 2026-01 | 🇩🇪 Germany | talk-de mailing list | EN | posted | https://lists.openstreetmap.org/pipermail/talk-de/2026-January/118507.html |
| — | 🇫🇷 France | forum.openstreetmap.fr (template source) | FR | posted | https://forum.openstreetmap.fr/t/freemap-eu-carte-outdoor-et-outils-bases-sur-osm-open-source-par-la-communaute-osm-slovaque/40396 |
| — | 🇫🇮 Finland | community.openstreetmap.org | EN | posted | https://community.openstreetmap.org/t/freemap-eu-open-source-osm-based-outdoor-map-tools-by-the-slovak-osm-community-introduction/139943 |
| — | 🇳🇴 Norway | community.openstreetmap.org | EN | posted | https://community.openstreetmap.org/t/freemap-eu-open-source-osm-based-outdoor-map-tools-by-the-slovak-osm-community/139942 |
| — | 🇸🇰 Slovakia | mtbiker.sk forum | SK | posted | https://www.mtbiker.sk/forum/cyklotrasy-navigacia/freemap-sk-openstreetmap-org--35970 |
| 2026-07-09 | 🇸🇮 Slovenia | community.openstreetmap.org (Slovenija) | SL | posted | https://community.openstreetmap.org/t/freemap-eu-odprtokodna-zunanja-karta-in-orodja-na-osnovah-osm-ki-jih-razvija-slovaska-skupnost-osm/145198 |
| 2026-07-09 | 🇸🇮🇮🇹🇩🇪 SI+IT+DE | hribi.net / hike.uno network (auto-translated) | SL | posted | https://www.hribi.net/trenutne_razmere/slo/freemapeu_-_brezplacna_pohodniska_karta_z_lidar_reliefom_zdaj_v_slovenscini/10001/10088 |
| 2026-07-09 | 🇵🇱 Poland | Mastodon (@FreemapSlovakia) — hi-res shading + contours deployed | EN | posted | https://en.osm.town/@FreemapSlovakia/116889810164287525 |
| 2026-07-09 | 🇵🇱 Poland | community.openstreetmap.org (Polska) | PL | posted | https://community.openstreetmap.org/t/freemap-eu-otwartozrodlowa-mapa-i-narzedzia-outdoor-oparte-na-osm-tworzone-przez-slowacka-spolecznosc-osm/145278 |
| 2026-07-09 | 🇵🇱 Poland | Facebook (Polish hiking group) | PL | posted | https://www.facebook.com/groups/478222752225355/posts/27531908469763417 |
| — | 🇸🇮🇫🇷 SL + FR | Mastodon new-languages announcement (@FreemapSlovakia) | EN | posted | https://en.osm.town/@FreemapSlovakia |
| 2026-09-04 | 🇦🇹🇨🇭🇩🇪 AT+CH+DE | hikr.org — Small Talk forum ("sagt mir, wo sie danebenliegt") | DE | posted | https://www.hikr.org/post203834.html |
| 2026-09-04 | 🇮🇹 Italy | avventurosamente.it — Orientamento/cartografia ("Mappe offline senza MOBAC") | IT | posted | https://www.avventurosamente.it/xf/threads/mappe-offline-senza-mobac-%E2%80%94-scaricare-larea-direttamente-dal-browser.65728/ |
| 2026-09-06 | 🇦🇹 Austria | gipfeltreffen.at — pinned "Digitale Karten im Netz – Übersicht" | DE | posted | https://www.gipfeltreffen.at/forum/gipfeltreffen/literatur-navigation-und-technik/hard-software-mit-bergbezug/67800-digitale-karten-im-netz-%C3%BCbersicht/page6 |
| 2026-09-06 | 🇮🇹🇨🇭 IT + CH | hikr.org — "Hikr in italiano" community (419 members) | IT | posted | https://www.hikr.org/post203897.html |
