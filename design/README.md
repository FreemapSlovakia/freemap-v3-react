# Logo masters

The editable sources behind `src/images/freemap-{flower,logo-sk,logo-eu}.svg`.
They differ from the shipped files in one way that matters: the wordmark is
**live `<text>` in Sriracha**, not outlines, so it can still be retyped or
restyled. Everything shipped is outlined, and outlines cannot be un-outlined.

Nothing in the build reads this directory.

## Editing

Open in Inkscape. Sriracha must be installed or the text reflows — it is a
Google font (OFL), and the shipped files were made on a machine that had it.

The flower is drawn as three flowers (green, red, amber), each of them three
paths: fill, sheen and outline, sharing one geometry. Inkscape treats those as
unrelated objects, so a node edit on one silently desynchronises the other two.
Edit the `-outline` path and copy its `d` to the other two, or select all three
and edit them together.

The same flower exists in all three files, in the same coordinate space. A
change to it has to be made in each.

## Exporting to `src/images/`

```sh
inkscape --export-plain-svg --export-text-to-path \
  --export-filename=../src/images/freemap-logo-sk.svg freemap-logo-sk-master.svg
```

Then, before committing the result:

- **Keep the viewBox ratio exactly.** `sk` is 134:34, `eu` 136:34, the flower
  45:34. `RspackIconsPlugin` draws the header rasters to fill those boxes, and
  browsers size the pre-JS bootstrap logo from the ratio alone — the shipped
  files carry no `width`/`height` for that reason. Drop those attributes if the
  export adds them back.
- **Run SVGO with attribute precision 6** (paths may be 3). The default rounds
  the viewBox and breaks the ratio above. See
  [`doc/build-and-deploy.md`](../doc/build-and-deploy.md).
- **Check the result renders the same** as what it replaces. Inkscape and
  librsvg lay live text out differently, so compare the *exported* file, never
  the master, against the previous shipped one.
