# Rendering exported drawing-point markers (`marker-svg`)

Instructions for the map-rendering server that consumes the client's `/export`
request.

## Where it comes from

The web client `POST`s to `/export` with this body:

```jsonc
{
  "bbox": [...], "zoom": 14, "format": "...", "scale": 1,
  "features": {
    "shading": false, "contours": false,
    "hikingTrails": false, "bicycleTrails": false,
    "skiTrails": false, "horseTrails": false,
    "featureCollection": { "type": "FeatureCollection", "features": [...] },
    "featureCollectionOrder": [...]
  }
}
```

`features.featureCollection` is a standard GeoJSON `FeatureCollection`. Among
its features are **drawing-point** features:

```jsonc
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [lon, lat] },
  "properties": {
    "title": "optional label text",
    "marker-svg": "<svg xmlns=…>…</svg>"
  }
}
```

## What `marker-svg` contains

The **entire marker, self-contained**: the shape, the fill color, the
semi-transparency, and the icon/text glyph. Render it verbatim — there are no
separate color/shape/icon properties to combine.

- The **fill color** is baked into the shape's `fill`/`stroke` (solid RGB hex).
- **Opacity** (when the marker is semi-transparent) is applied as an `opacity`
  attribute on the **root `<svg>` element**, so the whole marker (shape + white
  inset + glyph) fades uniformly. Make sure your rasterizer honors root-element
  opacity (resvg/librsvg do).
- The **icon** is one of: an embedded Font Awesome `<path>`, a poi icon embedded
  as `<image href="data:image/svg+xml;base64,…">` (a nested SVG via data URL),
  or a short `<text>` label.

## Placement — one rule, no shape logic

There are three marker shapes (pin / ring / square), but **you do not need to
know which**. Every marker SVG is authored so that the **anchor point (the
geographic location it represents) is the exact center of the viewBox.**

- All shapes share **width 310** (viewBox units).
- Ring/square are square (`viewBox 0 0 310 310`).
- Pin is taller (`viewBox 0 0 310 986.478`): its visible body is in the top
  half, the bottom half is transparent padding so the tip lands at center.

So the rendering rule is uniform for every marker:

1. Rasterize `marker-svg` (resvg / librsvg / Inkscape), preserving aspect ratio.
2. **Scale to a fixed pixel width** (e.g. ~30 px — the in-app marker is ~30 px
   wide). Do **not** scale by height; height follows from the aspect ratio.
   Optionally multiply by the request's `scale`.
3. **Center** the resulting bitmap on the projected `lon`/`lat` (bitmap center =
   coordinate). That's it — pins naturally rise above the point because their
   lower half is transparent; ring/square sit centered on the point.
4. Optionally draw `title` as a separate text label near the marker (it is
   **not** part of the SVG).

Don't hard-code a canvas size — read `width`/`height`/`viewBox` from each SVG.
Width is constant (310) but height differs by shape.

## Renderer gotchas

- **Root-element opacity:** semi-transparent markers set `opacity` on `<svg>`.
  Confirm your rasterizer applies it to the whole group (resvg/librsvg do).
- **Nested SVG images:** poi-icon markers embed the icon as
  `<image href="data:image/svg+xml;base64,…">`. The renderer must support
  `<image>` with `data:` URLs and nested SVG (resvg does — verify with a `poi:`
  marker).
- **Text glyphs** use `font-family="Sans-Serif"`, bold. Ensure a sans-serif font
  is installed in the render environment, or text-only markers render blank.
- **Other point features** (from imported tracks/search) may have **no**
  `marker-svg` — fall back to a default marker for those.
