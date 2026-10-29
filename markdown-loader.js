import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import matter from 'gray-matter';
import { marked, parse } from 'marked';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);

// The loader context of the file being parsed.
let loader;

marked.use({
  extensions: [
    {
      // `:FaBars:` → the react-icons glyph, inline; `:FaGem.text-warning:` adds
      // classes, for a glyph the UI colours.
      name: 'icon',
      level: 'inline',
      start: (src) => /:[A-Z][a-z]+\d?[A-Z]/.exec(src)?.index,
      tokenizer(src) {
        const m = /^:([A-Z][a-z]+\d?)([A-Z]\w*)((?:\.[\w-]+)*):/.exec(src);

        return (
          m && {
            type: 'icon',
            raw: m[0],
            pack: m[1],
            name: m[1] + m[2],
            classes: m[3].split('.').join(' '),
          }
        );
      },
      renderer({ pack, name, classes }) {
        // The pack by the name's prefix, else its numbered successors
        // (`IoLanguage` is in io5).
        const Icon = ['', '5', '6', '2']
          .map((v) => {
            try {
              return require(`react-icons/${pack.toLowerCase()}${v}`)[name];
            } catch {
              return undefined;
            }
          })
          .find(Boolean);

        if (!Icon) {
          throw new Error(`unknown icon :${name}: in ${loader.resourcePath}`);
        }

        return renderToStaticMarkup(
          createElement(Icon, { className: `fm-md-icon${classes}` }),
        );
      },
    },
  ],
  renderer: {
    link({ href, title, text }) {
      const ext = href.match('^https?://')
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';

      return `<a href="${href}" title="${title ?? ''}"${ext}>${text}</a>`;
    },
    // Sized from the `manifest.json` beside the image (CSS px, written by
    // scripts/manual-screenshots.mjs), so 2× captures show at their real size.
    image({ href, title, text }) {
      const file = path.resolve(path.dirname(loader.resourcePath), href);

      const manifest = path.join(path.dirname(file), 'manifest.json');

      loader.addDependency(manifest);

      const size = fs.existsSync(manifest)
        ? JSON.parse(fs.readFileSync(manifest, 'utf-8'))[path.basename(file)]
        : undefined;

      const dims = size ? ` width="${size.width}" height="${size.height}"` : '';

      const attr = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

      const t = title ? ` title="${attr(title)}"` : '';

      return `<img src="${href}" alt="${attr(text)}"${t}${dims} loading="lazy">`;
    },
  },
});

export default function markdownLoader(markdown) {
  loader = this;

  return parse(matter(markdown).content, this.getOptions());
}
