# Reading Facebook reach by browser

The Graph API route is closed — see the Tooling section of
[`announcement-log.md`](./announcement-log.md). Facebook's numbers come from Meta Business
Suite instead, read by Claude in Chrome (logged in as a Page admin) or by hand.

Everything below the line is the prompt — paste it as-is.

---

You are logged in to Facebook as an admin of the **Freemap Slovakia** Page. Collect the
reach figures for the Page's recent posts, so they can be recorded in a changelog.

**Read only. Do not post, delete, hide, reply, react, boost, or change any setting.** If
Facebook offers to boost a post or start an ad, decline and carry on. If anything asks for
a payment method, stop and report.

## Where

Meta Business Suite → **Insights → Content**:
<https://business.facebook.com/latest/insights/content>

Set the date range to cover **2026-06-01 to today**, and the account filter to the Freemap
Facebook Page (not Instagram).

## Preferred: export

Use the export button — this is the path that worked on 2026-08-13, and it is enough on its
own; stop once the file is downloaded. In the **Export metric data** dialog:

- Tab **Facebook** (not Instagram), Page: *Freemap - tvoja mapa, tvoj nástroj*
- **Date range:** *This year*, or a range covering everything since the last export
- **Metric presets:** open it and tick **everything** — the default is 5 of them, and a
  missing column means exporting again
- **Data view: Lifetime** — per-post totals. *Daily* gives one row per post per day, which
  is far harder to reduce
- **Content level: Post** — one row per post. *Page* is aggregate only; *Video* is
  video-only (worth a second export if video watch-time is the question)
- **Filter: Creation date**

Then **Generate**. It may download at once or queue for collection. Save it to `~/Downloads`
and report the exact filename — the file's own headers are informative, so don't rename or
open it first.

The resulting CSV carries `Publish time`, `Permalink`, `Post type`, `Description`, `Reach`,
`Views`, `Reactions`, `Comments`, `Shares`, `Total clicks`, `Link Clicks`, organic-vs-boosted
splits and video watch metrics — around 60 columns.

## Otherwise: read the table

For each post in the range, collect:

- **Date** published (YYYY-MM-DD)
- **The first line or two of the post text**, enough to recognise the topic
- **Permalink** — the post's own URL (open the post and copy the address; it looks like
  `https://www.facebook.com/<page>/posts/<id>` or `.../permalink/<id>`)
- **Reach** (or Impressions if reach is not shown)
- **Reactions**, **Comments**, **Shares**
- **Link clicks**, if the column exists

## Report back

One markdown table row per post, newest first, in exactly this shape:

```
| 2026-07-31 | Croatia terrain — national 1 m DTM | Facebook | reach 1,240 · 34 reactions · 5 comments · 2 shares | — | https://www.facebook.com/... |
```

Leave a field as `—` if Facebook does not show it. Do not guess a number, and say so
explicitly if a post's figures are still pending (Meta delays some metrics for a few hours
after publishing).
