import fs from 'node:fs';
import path from 'node:path';
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';
import type { Compiler } from '@rspack/core';
import { rspack } from '@rspack/core';

const NAME = 'RspackIconsPlugin';

/** Mirrors the `icons` in `src/manifest.webmanifest`. */
const MANIFEST_SIZES = [96, 128, 192, 256, 384, 512];

/** Mirrors the square tiles named in `src/static/browserconfig.xml`. */
const MSTILE_SIZES = [70, 144, 150, 310];

/** The sizes `favicon.ico` bundles. */
const ICO_SIZES = [16, 24, 32, 48, 64];

/**
 * Fraction of the canvas the drawing fills, matching the icons this replaces.
 * Measured against the drawing's own bounds, not the viewBox — the logo SVGs
 * carry margin for their drop shadow, which would otherwise eat into this.
 */
const ICON_COVERAGE = 0.84;
const SPLASH_COVERAGE = 0.6;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** How far Liberation Sans reaches below the baseline, in ems. */
const DESCENDER = 0.21;

/** Densities the header logo is rasterized at, for the stylesheet's image-set. */
const DENSITIES = [1, 2, 3, 4];

export interface IconsPluginSite {
  site: string;
  /** Wordmark SVG for this domain, relative to the compiler context. */
  wordmark: string;
}

export interface IconsPluginOptions {
  /** Site-neutral flower SVG, relative to the compiler context. */
  flower: string;
  sites: IconsPluginSite[];
  /** Splash-screen pixel sizes, as `[width, height]`. */
  splashSizes: [number, number][];
  /**
   * The header logos, drawn at a fixed size where Firefox renders the SVGs
   * blurred. Rasterized at 1×/2×/3× for the stylesheet's `image-set()`; the
   * height follows each viewBox's ratio.
   */
  headerLogos: { name: string; source: string; width: number }[];
  /** Where those go. Gitignored, and resolvable by the stylesheet. */
  headerOutDir: string;
  /** `favicon-NxN.png` sizes; shared with the entry document so they agree. */
  faviconSizes: number[];
  /** `apple-touch-icon-NxN.png` sizes; likewise shared. */
  appleTouchSizes: number[];
  /** The tagline under the wordmark on the og:image, per UI language. */
  taglines: { lang: string; text: string }[];
  /** Font the tagline is set in; bundled so CI and local render identically. */
  fontFile: string;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Svg {
  viewBox: string;
  view: Box;
  /** Everything inside the root element, ready to nest in another `<svg>`. */
  body: string;
  /** Namespace declarations off the root, which the body may still rely on. */
  namespaces: string;
  /** What the drawing actually covers, inset from the viewBox by its margin. */
  bounds: Box;
}

/**
 * Renders every raster the entry documents and the manifest reference, out of
 * the logo SVGs, so the repository carries no generated bitmap.
 */
export class RspackIconsPlugin {
  /** Absolute path to the tagline font, resolved once the context is known. */
  private fontPath = '';

  private cache?: { key: string; assets: Map<string, Buffer | string> };

  constructor(private readonly options: IconsPluginOptions) {}

  apply(compiler: Compiler) {
    const resolve = (p: string) => path.resolve(compiler.context, p);

    this.fontPath = resolve(this.options.fontFile);

    const sources = [
      resolve(this.options.flower),
      this.fontPath,
      ...this.options.sites.map((s) => resolve(s.wordmark)),
    ];

    // Before compilation, so the stylesheet can resolve and hash these like any
    // other asset rather than reaching for an unhashed URL at the site root.
    compiler.hooks.beforeCompile.tap(NAME, () => {
      this.writeHeaderLogos(resolve, sources);
    });

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: NAME,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          for (const file of sources) {
            compilation.fileDependencies.add(file);
          }

          for (const [name, data] of this.build(resolve, sources)) {
            compilation.emitAsset(name, new rspack.sources.RawSource(data));
          }
        },
      );
    });
  }

  /**
   * Renders the whole set, reusing the last one while the sources are
   * untouched — a watch rebuild would otherwise spend seconds redrawing the
   * splash screens and social images for an unrelated edit.
   */
  private build(resolve: (p: string) => string, sources: string[]) {
    const key = mtimeKey(sources);

    if (this.cache?.key === key) {
      return this.cache.assets;
    }

    const assets = new Map<string, Buffer | string>();

    const flower = readSvg(resolve(this.options.flower), this.font);

    for (const { name, size, opaque } of this.flowerIcons()) {
      assets.set(
        name,
        this.renderFitted(flower, size, size, ICON_COVERAGE, opaque),
      );
    }

    assets.set(
      'mstile-310x150.png',
      this.renderFitted(flower, 310, 150, ICON_COVERAGE),
    );

    assets.set(
      'favicon.ico',
      buildIco(
        ICO_SIZES.map((size) =>
          this.renderFitted(flower, size, size, ICON_COVERAGE),
        ),
      ),
    );

    for (const { site, wordmark } of this.options.sites) {
      const mark = readSvg(resolve(wordmark), this.font);

      for (const [width, height] of this.options.splashSizes) {
        assets.set(
          `apple-touch-startup-image-${site}-${width}x${height}.png`,
          this.renderFitted(mark, width, height, SPLASH_COVERAGE, true),
        );
      }

      for (const { lang, text } of this.options.taglines) {
        assets.set(`og-${site}-${lang}.png`, this.renderOg(mark, text));
      }
    }

    this.cache = { key, assets };

    return assets;
  }

  /** Draws `svg` centred in `width`×`height`, filling `coverage` of the box. */
  private renderFitted(
    svg: Svg,
    width: number,
    height: number,
    coverage: number,
    opaque = false,
  ) {
    const scale = fitScale(svg, width, height, coverage);

    return this.render(
      wrap(
        width,
        height,
        opaque,
        svg.namespaces,
        placeAt(
          svg,
          (width - svg.bounds.width * scale) / 2,
          (height - svg.bounds.height * scale) / 2,
          scale,
        ),
      ),
    );
  }

  private renderOg(mark: Svg, tagline: string) {
    const scale = (OG_WIDTH * 0.72) / mark.bounds.width;
    const markWidth = mark.bounds.width * scale;
    const markHeight = mark.bounds.height * scale;
    const fontSize = Math.round(OG_HEIGHT * 0.073);
    const gap = fontSize * 1.4;

    // Centre the wordmark and the line under it as one block. Only the
    // descender sits below the baseline, so budgeting a whole em there would
    // push the block visibly high.
    const top = (OG_HEIGHT - (markHeight + gap + fontSize * DESCENDER)) / 2;

    return this.render(
      wrap(
        OG_WIDTH,
        OG_HEIGHT,
        true,
        mark.namespaces,
        placeAt(mark, (OG_WIDTH - markWidth) / 2, top, scale) +
          `<text x="${OG_WIDTH / 2}" y="${top + markHeight + gap}" ` +
          `font-family="Liberation Sans" font-weight="bold" ` +
          `font-size="${fontSize}" fill="#333333" text-anchor="middle">` +
          escapeXml(tagline) +
          '</text>',
      ),
    );
  }

  private writeHeaderLogos(resolve: (p: string) => string, sources: string[]) {
    const dir = resolve(this.options.headerOutDir);

    const outputs = this.options.headerLogos.flatMap(({ name }) =>
      DENSITIES.map((density) => path.join(dir, `${name}-${density}x.png`)),
    );

    // These land in a directory rspack watches, so rewriting them unchanged
    // costs a rebuild each time. Keyed on mtime rather than in memory, so a
    // fresh process skips the work too.
    const newest = Math.max(...sources.map((f) => fs.statSync(f).mtimeMs));

    if (outputs.every((f) => mtimeOf(f) > newest)) {
      return;
    }

    fs.mkdirSync(dir, { recursive: true });

    for (const { name, source, width } of this.options.headerLogos) {
      const svg = readSvg(resolve(source), this.font);

      for (const density of DENSITIES) {
        const w = width * density;

        // Keep the size the viewBox gives, but centre the drawing rather than
        // the viewBox: these carry uneven margin for the drop shadow, which
        // showed as a short gap on the logo's left.
        const scale = w / svg.view.width;
        const h = Math.round(svg.view.height * scale);

        fs.writeFileSync(
          path.join(dir, `${name}-${density}x.png`),
          this.render(
            wrap(
              w,
              h,
              false,
              svg.namespaces,
              placeAt(
                svg,
                (w - svg.bounds.width * scale) / 2,
                (h - svg.bounds.height * scale) / 2,
                scale,
              ),
            ),
          ),
        );
      }
    }
  }

  /** Square icons drawn from the flower alone, so they serve both domains. */
  private flowerIcons() {
    return [
      ...MANIFEST_SIZES.map((size) => ({
        name: `freemap-logo-${size}.png`,
        size,
      })),
      ...this.options.faviconSizes.map((size) => ({
        name: `favicon-${size}x${size}.png`,
        size,
      })),
      ...MSTILE_SIZES.map((size) => ({
        name: `mstile-${size}x${size}.png`,
        size,
      })),
      // iOS composites on black where an icon is transparent, so these are flat.
      ...this.options.appleTouchSizes.map((size) => ({
        name: `apple-touch-icon-${size}x${size}.png`,
        size,
        opaque: true,
      })),
      { name: 'apple-touch-icon.png', size: 180, opaque: true },
      { name: 'apple-touch-icon-precomposed.png', size: 180, opaque: true },
    ];
  }

  /** Only the bundled font, so nothing depends on what the machine has. */
  private get font(): ResvgRenderOptions['font'] {
    return {
      fontFiles: [this.fontPath],
      loadSystemFonts: false,
      defaultFontFamily: 'Liberation Sans',
    };
  }

  private render(svg: string) {
    return new Resvg(svg, { font: this.font }).render().asPng();
  }
}

function mtimeKey(files: string[]) {
  return files.map((file) => `${file}@${fs.statSync(file).mtimeMs}`).join('|');
}

/** 0 for a file that isn't there, so a missing output always counts as stale. */
function mtimeOf(file: string) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

function readSvg(file: string, font: ResvgRenderOptions['font']): Svg {
  const source = fs.readFileSync(file, 'utf8');

  const root = /<svg[^>]*>/.exec(source)?.[0];
  const viewBox = root && /viewBox="([^"]+)"/.exec(root)?.[1];

  if (!root || !viewBox) {
    throw new Error(`${file} has no viewBox`);
  }

  const [x, y, width, height] = viewBox.split(/[\s,]+/).map(Number);

  // The body keeps whatever prefixes the root declared (Inkscape re-adds
  // xlink/sodipodi on every export), so the wrapper has to declare them too.
  const namespaces = (root.match(/\sxmlns:[\w-]+="[^"]*"/g) ?? []).join('');

  // Same fonts as the render, or a master with live text would be fitted to a
  // box that isn't what gets drawn.
  const bounds = new Resvg(source, { font }).getBBox();

  if (!bounds) {
    throw new Error(`${file} draws nothing`);
  }

  return {
    viewBox,
    view: { x, y, width, height },
    body: source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
    namespaces,
    bounds,
  };
}

function wrap(
  width: number,
  height: number,
  opaque: boolean,
  namespaces: string,
  body: string,
) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${namespaces} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    (opaque
      ? `<rect width="${width}" height="${height}" fill="#ffffff"/>`
      : '') +
    body +
    '</svg>'
  );
}

/**
 * Nests `svg` with its drawing's top-left corner at (x, y). The whole viewBox
 * is nested rather than a crop of it, so the drop shadow reaching past the
 * drawing keeps its room instead of being clipped by the nested viewport.
 */
function placeAt(svg: Svg, x: number, y: number, scale: number) {
  const { view, bounds } = svg;

  return (
    `<svg x="${x - (bounds.x - view.x) * scale}" y="${y - (bounds.y - view.y) * scale}"` +
    ` width="${view.width * scale}" height="${view.height * scale}" viewBox="${svg.viewBox}">` +
    svg.body +
    '</svg>'
  );
}

/** The scale at which `svg`'s drawing fills `coverage` of `width`×`height`. */
function fitScale(svg: Svg, width: number, height: number, coverage: number) {
  return Math.min(
    (width * coverage) / svg.bounds.width,
    (height * coverage) / svg.bounds.height,
  );
}

function escapeXml(text: string) {
  return text.replace(
    /[<>&"']/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[c] as string,
  );
}

/** ICO container around already-encoded PNGs (every current browser reads those). */
function buildIco(pngs: Buffer[]) {
  const header = Buffer.alloc(6);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  const directory = Buffer.alloc(16 * pngs.length);

  let offset = header.length + directory.length;

  pngs.forEach((png, i) => {
    const size = ICO_SIZES[i];
    const at = i * 16;

    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2);
    directory.writeUInt8(0, at + 3);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);

    offset += png.length;
  });

  return Buffer.concat([header, directory, ...pngs]);
}
