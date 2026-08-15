# Self-hosted Photon geocoder

Search runs against `nominatim.openstreetmap.org` today. The Nominatim usage
policy asks consumers at our traffic level to self-host, so search moves to our
own Photon instance at `https://photon.freemap.sk`.

## Why the dumps needed an upstream change first

Photon indexes only the languages present in the dump, and `-languages` can
only select from that set — a downstream user cannot configure around a missing
language. The published export set carried no `name:sk`, so a Slovak user could
not find foreign exonyms ("Paríž"). Slovak names *inside* Slovakia are fine via
the plain `name` tag; it is exonyms that break.

[komoot/photon discussion #1101](https://github.com/komoot/photon/discussions/1101)
resolved this: the export set is generated from Nominatim's
[`country_settings.yaml`](https://github.com/osm-search/Nominatim/blob/master/settings/country_settings.yaml)
official-languages list, plus `br`, `kn`, `oc`. Dumps from the **260809** build
(data timestamp 2026-08-08) onward carry **105 languages**, including every EU
official language. Sub-national languages whose country lists only the national
one are still absent (`cy`, `gd`, `fy`, `hsb`/`dsb`, `fur`, `lld`, `co`).

Verify what a dump contains by reading the `CountryInfo` record — the second
line of the decompressed stream:

    curl -r 0-3000000 -o head.zst <dump-url>
    zstd -dc head.zst 2>/dev/null | sed -n 2p | jq '[.content[].name | keys[]] | unique'

**The prebuilt `photon-db-*.tar.bz2` databases are not usable for us.** They are
imported with the default `-languages` (en, de, fr, it), and `-languages` fixes
both what is indexed and what clients may request at query time. Getting `sk`
means importing the JSONL dump ourselves.

## Where it lives

Host is **fm5** (`fm5.freemap.sk`, EPYC 9454P 48c/96t, 251 GB RAM, NVMe). fm6 is
unsuitable: 12 threads, ~45 GB RAM available while already swapping, and its
only free space is on spinning disks — Photon's Lucene index wants SSD/NVMe and
enough RAM to hold the working set in page cache.

| Path | Contents |
| --- | --- |
| `/opt/photon/` | jar, `photon.service`, vhost files, `nginx-photon.conf` |
| `/fm/data4/photon/` | the index (Photon creates `photon_data/` inside `-data-dir`) |
| `/fm/data4/martin/photon-install/` | dump, `import.sh`, `import.log` |

Both `/opt/photon` and `/fm/data4/photon` are `freemap:freemap` mode 2775, so
members of the `freemap` group stage files there without sudo.

## Service

`photon.service` runs as `freemap`, binds **127.0.0.1:2322**, passes `-cors-any`
(the browser calls it cross-origin from freemap.sk / freemap.eu), and sets
`LimitNOFILE=65535` — Lucene holds many segment files open and systemd's 1024
default is too low.

One-time install of the unit, once an index exists:

    sudo chown -R freemap:freemap /fm/data4/photon
    sudo cp /opt/photon/photon.service /etc/systemd/system/
    sudo systemctl daemon-reload && sudo systemctl enable --now photon

Startup takes a while on a cold page cache; that is expected, not a fault.

## nginx

`photon.freemap.sk` is a **CNAME to `fm5.freemap.sk.`** (the trailing dot
matters; a bare `fm5.` resolves as a root-level name and NXDOMAINs), which
inherits both A and AAAA. Certbot manages the TLS block.

Two things the vhost must carry:

- `gzip_types application/json;` — `nginx.conf` sets `gzip on` but leaves
  `gzip_types` at its `text/html` default, so JSON is otherwise uncompressed.
- The rate limit and cache from `nginx-photon.conf` (installed in
  `/etc/nginx/conf.d/`): 20 r/s per IP with bursts to 40 (autocomplete fires per
  keystroke, so a lower limit hurts users behind one carrier NAT), and a 24 h
  response cache. The index only changes on re-import, which is what makes a
  long TTL safe — and what makes clearing the cache part of the re-import
  runbook.

`nginx -t` before every reload: if the zones file is missing, the vhost
references an undefined `photon_req` zone, the test fails, and the reload is
skipped rather than breaking the running config.

`/opt/photon/photon.freemap.sk` is the served file (symlinked from
`sites-enabled/`), and `photon.freemap.sk.hardened` is a full copy of it.

Re-pointing that symlink is safe, and is how a blue-green switchover would move
traffic between two instances — `/opt/graphhopper` already does exactly this
(`sites-enabled/… → /opt/graphhopper/graphhopper.freemap.sk → ….a`, flipped to
`.b` on each update). Renewal only rewrites the pem files under
`/etc/letsencrypt/live/`; the paths in the vhost never change, so certbot does
not care which copy is currently linked.

The real constraint is that **every copy must carry the whole TLS block**, since
any of them may be the served one. GraphHopper's `.a`/`.b` differ in exactly one
line, the `proxy_pass` port. Keeping them in sync is manual: a `certbot --nginx`
run (not a renewal) edits only the file that is linked at that moment, so
re-sync the others after one.

## Import runbook

Weekly dumps: `https://download1.graphhopper.com/public/europe/`. We serve
**Europe**. `*-1.0-latest.jsonl.zst` tracks the newest release build.

    cd /fm/data4/martin/photon-install
    wget -c https://download1.graphhopper.com/public/europe/photon-dump-europe-1.0-latest.jsonl.zst{,.md5}
    md5sum -c photon-dump-europe-1.0-latest.jsonl.zst.md5

    zstd --stdout -d photon-dump-europe-1.0-latest.jsonl.zst \
      | nice -n 10 java -Xmx16g -jar /opt/photon/photon-1.3.0.jar import \
          -import-file - \
          -data-dir /fm/data4/photon \
          -languages sk,cs,en,de,fr,it,hu,pl,sl,hr,sr,uk,ro,nl,es,pt

The language list is the nine UI locales plus neighbours and larger markets for
freemap.eu. Widening it later costs a full re-import, so it is deliberately a
superset. Photon has no resume for a stream import: if the import dies, delete
`/fm/data4/photon/photon_data` and start over.

Run it detached so it survives the ssh session (it does not survive a reboot of
fm5) — `import.sh` wraps the pipeline and echoes the exit code:

    setsid nohup /fm/data4/martin/photon-install/import.sh \
      > /fm/data4/martin/photon-install/import.log 2>&1 < /dev/null &

Detachment is verifiable: `ps -eo pid,ppid,sid,tty,args` should show PPID 1, the
process as its own session leader, and TTY `?`.

Then:

    sudo chown -R freemap:freemap /fm/data4/photon
    sudo systemctl restart photon
    sudo rm -rf /fm/data4/nginx-proxy-cache/photon/* && sudo systemctl reload nginx

### Re-importing without a 7-hour outage

Nothing auto-updates: there is no timer and no cron, and Photon can only update
a database in place from a Nominatim database (which we do not run). Staying
current means a periodic full re-import, by hand.

Do **not** re-run the import above against the live `-data-dir`. It would have
to delete `photon_data` first, and search is then down for the whole ~7 h.
Import into a staging directory and swap, so the outage is one restart:

    mkdir -p /fm/data4/photon-new
    # …same import pipeline, but: -data-dir /fm/data4/photon-new

    sudo systemctl stop photon
    mv /fm/data4/photon/photon_data /fm/data4/photon/photon_data.old
    mv /fm/data4/photon-new/photon_data /fm/data4/photon/
    sudo chown -R freemap:freemap /fm/data4/photon
    sudo systemctl start photon

Wait for `curl "http://127.0.0.1:2322/api?q=bratislava&limit=1"` to answer —
opening a 59 GB index on a cold page cache is not instant, and nginx's cached
responses are what cover users meanwhile. Only once it answers:

    sudo rm -rf /fm/data4/nginx-proxy-cache/photon/* && sudo systemctl reload nginx

Then `rm -rf /fm/data4/photon/photon_data.old`. Keeping the old index until the
new one is proven is the whole point — it is the rollback. Budget ~130 GB for
the window where both indexes and the dump coexist.

### Watching an import

The log line `Imported N documents [X/second]` reports the **cumulative**
average, not the current rate. For true progress, read the decompressor's
position in the dump — throughput is bursty (it stalls during large segment
merges), so a single short sample can mislead by 2×; prefer the since-start
average:

    pid=$(pgrep -f "zstd --stdout -d photon-dump" | head -1)
    grep ^pos /proc/$pid/fdinfo/3   # against the dump's byte size

`grep EXIT= import.log` answers "finished, and did it work" — the wrapper echoes
the exit code as its last line. Absent, with no `java`/`zstd` processes running,
means it was killed outright (reboot, OOM) rather than failing.

Observed on 2026-08-14 (Europe, 16 languages, 13,188,391,174-byte dump): roughly
6,500 documents/second sustained, ~560 kB/s of compressed input, **158.1M
documents into a 59 GB index in ~6h45m** (16:21 → 23:06). The index is markedly
larger than the prebuilt Europe tarball suggests, because that one carries four
languages and ours carries sixteen. Budget disk accordingly: a re-import needs
room for the new index alongside the old one, or the old one deleted first.

### Verifying the service

    curl "http://127.0.0.1:2322/api?q=bratislava&limit=1"       # on fm5
    curl -sI "https://photon.freemap.sk/api?q=bratislava"       # from outside
    curl -s "https://photon.freemap.sk/api?q=Par%C3%AD%C5%BE&lang=sk&limit=1"

The third is the query that motivated the whole exercise: a Slovak exonym for a
foreign city. If it returns Paris, the language work landed end to end.

`502` from nginx means Photon is not listening on 2322 — check
`systemctl status photon` and `journalctl -u photon -n 50`. A response with
`X-Cache-Status: HIT` confirms the cache is live; `429` confirms the rate limit
(a burst of 60 parallel requests from one IP gets ~18 of them rejected).

`journalctl -u photon` shows nothing unless you are in `adm` or
`systemd-journal` — the unit runs as `freemap`, not as you.

## Switching the app over

Two call sites, both currently hitting Nominatim directly:

- `src/features/search/model/processors/searchProcessorHandler.ts:141` — forward
  search (`/search?`)
- `src/features/mapDetails/model/mapDetailsProcessorHandler.ts:108` — reverse
  geocoding (`/reverse?`)

`src/shared/types/nominatimResult.ts` holds the response schema. Photon returns
GeoJSON with a different property set, so it needs its own schema rather than a
tweak to that one.

The result `source` ids `'nominatim-forward'` and `'nominatim-reverse'` are
**persisted in saved maps** (see `src/features/myMaps/model/mapDocumentSchema.test.ts`),
so they are part of the storage format — renaming them breaks existing saved
maps unless the schema migrates them.

Photon takes the UI language as `&lang=`. **Always send it explicitly.** When
it is absent Photon falls back to the request's `Accept-Language` header, which
would make one URL mean different things to different clients — and the nginx
cache keys on the URI alone. The vhost therefore blanks that header
(`proxy_set_header Accept-Language "";`) so a cached response cannot leak one
user's language to another; the app must not rely on header-based language.

`lang` **must** be one of the imported `-languages`. Where a translation is
simply missing Photon falls back gracefully (to `-default-language`, then the
local name), but a language that was never imported is a hard **HTTP 400**:

    {"lang":[{"message":"Language is not supported. Supported are: default,
      de, pt, en, hr, it, fr, hu, es, cs, uk, sk, sl, pl, ro, nl, sr", ...}]}

All nine UI locales (`sk en cs de fr it hu pl sl`) are inside that set, so
passing the locale straight through is safe today. It stops being safe the
moment a tenth locale is added: **adding a UI language that was not imported
breaks search outright for its users**, and widening `-languages` costs a full
re-import. Add the code to `-languages`, re-import, *then* ship the locale — or
have the app map unknown locales to `default`.

## Status of the first install (delete this section once search is live)

The endpoint is **up and verified** as of 2026-08-15 07:09 — import `EXIT=0`,
service enabled, `https://photon.freemap.sk` answering 200 through nginx with
the cache and rate limit both confirmed live, and the Slovak/Hungarian exonym
queries returning the right foreign cities.

What is left here: delete the dump (~13 GB) from
`/fm/data4/martin/photon-install` once you are confident no re-import is
imminent, or keep it until the next weekly dump supersedes it. `/fm/data4` has
1.4 TB free, so there is no pressure.

`/opt/photon` also holds an unused `photon-1.2.1.jar`; 1.3.0 is the one the unit
runs, and its release notes cover improved Czech/Slovak street-number matching.
The unit serves with `-Xmx8g` (the import used 16g) — query serving is far
lighter than indexing and the 59 GB index is served from page cache, but this
has not yet been observed under real autocomplete load.

## Open items

- The app still calls Nominatim; the switch above is not done.
- No monitoring on the endpoint yet (fm5 runs munin-node).
- Nothing re-imports on a schedule, so the index ages until someone runs the
  staged re-import by hand. Decide a cadence, or automate it.
- `src/static/llms.txt` describes search behaviour; update it when the app
  switches geocoder.
