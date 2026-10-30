import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Marked } from 'marked';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);

const attr = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

/**
 * Markdown of `src/documents/` and `src/manual/` to HTML, for the app's loader
 * and the SEO prerender alike. `file` resolves images and names the file in
 * errors; `onDependency` is told of files read; without `images` an image is
 * left out (its built URL is the app bundle's to know).
 */
export function renderMarkdown(
  markdown,
  { file, onDependency = () => {}, images = true },
) {
  const marked = new Marked({
    extensions: [
      {
        // `:FaBars:` → the react-icons glyph, inline; `:FaGem.text-warning:`
        // adds classes, for a glyph the UI colours.
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
            throw new Error(`unknown icon :${name}: in ${file}`);
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
      // A `<name>.mobile.webp` beside it is what a phone-width screen shows.
      image({ href, title, text }) {
        if (!images) {
          return '';
        }

        const image = path.resolve(path.dirname(file), href);

        const manifestFile = path.join(path.dirname(image), 'manifest.json');

        onDependency(manifestFile);

        const manifest = fs.existsSync(manifestFile)
          ? JSON.parse(fs.readFileSync(manifestFile, 'utf-8'))
          : {};

        const dims = (name) => {
          const size = manifest[name];

          return size ? ` width="${size.width}" height="${size.height}"` : '';
        };

        const t = title ? ` title="${attr(title)}"` : '';

        const img = `<img src="${href}" alt="${attr(text)}"${t}${dims(path.basename(image))} loading="lazy">`;

        const mobile = image.replace(/\.webp$/, '.mobile.webp');

        if (mobile === image || !fs.existsSync(mobile)) {
          return img;
        }

        onDependency(mobile);

        // Bootstrap's `sm` breakpoint, below which the app lays out for a phone.
        return `<picture><source media="(max-width: 575.98px)" srcset="${href.replace(/\.webp$/, '.mobile.webp')}"${dims(path.basename(mobile))}>${img}</picture>`;
      },
    },
  });

  return marked.parse(markdown, { async: false });
}
