# iD editor line icons

Vendored from the [iD editor](https://github.com/openstreetmap/iD)
(`svg/iD-sprite/presets`), because nothing in Maki or Temaki draws a road class,
a watercourse or a pipeline, and depending on the whole editor for seventeen
files would be absurd.

The grey tones are darkened from the originals so each drawing's main tone is
ink and follows the text colour — iD draws these on a fixed light panel, where a
mid grey reads fine, and ours sit in a list on either theme.

Only the drawings are used: `scripts/gen-poi-icons.mjs` inlines them into
`src/osm/poiIcons.ts` under the `id:` prefix, so the files themselves never
reach the bundle.

## Licence

    ISC License

    Copyright (c) iD Contributors

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
