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
1. Free, open-source, non-commercial, privacy-friendly (no tracking).
2. Hi-res LiDAR terrain + shaded relief + contours ("see every gully and old road").
3. Real offline maps + GPS-device export (Garmin/Locus/OsmAnd) + live tracking.
4. Multi-profile route planning (hike/MTB/ski/horse) with elevation profiles.
Hooks 2–4 are also the premium hooks — users drawn by them convert best.

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
