// Generates src/osm/poiIcons.ts: for every bundled poi icon, the drawing markup
// ready to inline into a host <svg> (so it paints like a Font Awesome path
// instead of being embedded as an opaque <image>), plus the drawing's bounding
// box (each icon's canvas has idiosyncratic padding, so markers place the
// *drawing*, not the canvas).
//
// Run: node scripts/gen-poi-icons.mjs [--verify]  (or: pnpm gen-poi-icons)
// The emitted .ts is committed, so normal builds don't run this.
//
// The cleaning pass strips editor cruft (metadata, sodipodi/inkscape, unused
// defs) and rewrites achromatic paints so the drawing follows the surrounding
// text colour: dark paints become `currentColor` (the ink), and near-white ones
// — knockouts and haloes, which stand for the surface behind the drawing — paint
// with a CSS variable each consumer points at that surface. Mid greys stay put:
// they read as a grey against either background, and they are often painted
// over the ink, where a translucent stand-in would not show at all.
//
// Paints with a hue are left alone — for icons like the spring family the
// colour *is* the distinction (blue/green/red), so flattening them would lose
// information. `mono` records which icons came out fully theme-following.
//
// --verify re-renders every icon from the generated markup and compares it
// against the original (both composited on white): the inked area must match
// shape for shape, and every coloured pixel must keep its colour.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { optimize } from 'svgo';

const here = dirname(fileURLToPath(import.meta.url));
const ICON_DIR = join(here, '..', 'src', 'images', 'poiIcons');
const OUT_FILE = join(here, '..', 'src', 'osm', 'poiIcons.ts');
const MAPPING_FILE = join(here, '..', 'src', 'osm', 'osmTagToIconMapping.ts');
const VERIFY = process.argv.includes('--verify');

// Where the drawings come from. Ours are bundled whole — the icon picker offers
// every one of them — while the borrowed sets are far larger than anything we
// map, so only the icons osmTagToIconMapping actually names are taken. Their
// names are prefixed, both to say where a drawing came from and so neither set
// can collide with ours.
const SOURCES = [
  { dir: ICON_DIR, prefix: '', whole: true },
  {
    dir: join(here, '..', 'node_modules', '@rapideditor', 'temaki', 'icons'),
    prefix: 'temaki:',
  },
  {
    dir: join(here, '..', 'node_modules', '@mapbox', 'maki', 'icons'),
    prefix: 'maki:',
  },
  // Vendored rather than installed: the whole iD editor is a huge dependency
  // for the handful of line drawings nothing else has. See the folder's README.
  {
    dir: join(here, '..', 'src', 'images', 'idIcons'),
    prefix: 'id:',
    whole: true,
  },
];

// Every icon the tag mapping names. Only a value is read — the keys are OSM tag
// keys and values, and some look just like icon names.
const referenced = new Set(
  [
    ...readFileSync(MAPPING_FILE, 'utf8').matchAll(
      /:\s*'([^']*)'|:\s*"([^"]*)"/g,
    ),
  ].map((m) => m[1] ?? m[2]),
);

// Paint for the near-white areas that stand for the surface behind the drawing
// (knockouts and haloes). Consumers set the variable to whatever that surface
// actually is — the page on the dark theme, the marker's inset on a marker —
// and the fallback keeps any plain SVG viewer rendering it as authored.
const KNOCKOUT_VAR = '--fm-icon-ko';
const KNOCKOUT_PAINT = `var(${KNOCKOUT_VAR}, #fff)`;

function walk(dir) {
  const out = [];

  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...walk(p));
    } else if (e.name.endsWith('.svg')) {
      out.push(p);
    }
  }

  return out;
}

// Round to 3 decimals, dropping trailing zeros.
const r = (n) => Number(n.toFixed(3));

// Squeezes the path data before the cleaning pass runs. The plugins that would
// interfere are off: ids can be referenced (`dog_park` uses one), and a paint
// renamed to a keyword would slip past the theming below. (`removeViewBox` is
// not in preset-default, so the viewBox the drawing is placed by is safe.)
const SVGO_CONFIG = {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          convertColors: { names2hex: true, rgb2hex: true, shorthex: false },
        },
      },
    },
  ],
};

// ---------------------------------------------------------------- XML parsing

// Finds the `>` closing the tag started at `start`, skipping quoted values.
function findTagEnd(s, start) {
  let quote = null;

  for (let i = start + 1; i < s.length; i++) {
    const c = s[i];

    if (quote) {
      if (c === quote) {
        quote = null;
      }
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return i;
    }
  }

  throw new Error('unterminated tag');
}

const XML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] !== '#') {
      return XML_ENTITIES[e.toLowerCase()] ?? m;
    }

    return e[1] === 'x' || e[1] === 'X'
      ? String.fromCodePoint(Number.parseInt(e.slice(2), 16))
      : String.fromCodePoint(Number(e.slice(1)));
  });
}

function encodeAttr(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;')
    .replaceAll(/[\n\r\t]/g, ' ');
}

function parseAttrs(s) {
  const attrs = {};

  for (const m of s.matchAll(/([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    attrs[m[1]] = decodeEntities(m[3] ?? m[4]);
  }

  return attrs;
}

/** Minimal XML -> tree. Nodes are `{ tag, attrs, children }` or `{ text }`. */
function parseXml(src) {
  const root = { tag: '#root', attrs: {}, children: [] };

  const stack = [root];

  let i = 0;

  while (i < src.length) {
    const lt = src.indexOf('<', i);

    if (lt < 0) {
      break;
    }

    if (lt > i && src.slice(i, lt).trim()) {
      stack.at(-1).children.push({ text: src.slice(i, lt) });
    }

    if (src.startsWith('<!--', lt)) {
      i = src.indexOf('-->', lt) + 3;
    } else if (src.startsWith('<![CDATA[', lt)) {
      const end = src.indexOf(']]>', lt);

      stack.at(-1).children.push({ text: src.slice(lt + 9, end) });

      i = end + 3;
    } else if (src.startsWith('<?', lt)) {
      i = src.indexOf('?>', lt) + 2;
    } else if (src.startsWith('<!', lt)) {
      i = src.indexOf('>', lt) + 1;
    } else if (src.startsWith('</', lt)) {
      stack.pop();

      i = src.indexOf('>', lt) + 1;
    } else {
      const end = findTagEnd(src, lt);

      const raw = src.slice(lt + 1, end);

      const selfClose = raw.trimEnd().endsWith('/');

      const body = selfClose ? raw.trimEnd().slice(0, -1) : raw;

      const [, tag, rest] = /^([^\s/>]+)([\s\S]*)$/.exec(body);

      const node = { tag, attrs: parseAttrs(rest), children: [] };

      stack.at(-1).children.push(node);

      if (!selfClose) {
        stack.push(node);
      }

      i = end + 1;
    }
  }

  return root;
}

function serialize(nodes) {
  return nodes
    .map((n) => {
      if (n.text !== undefined) {
        return n.text;
      }

      const attrs = Object.entries(n.attrs)
        .map(([k, v]) => ` ${k}="${encodeAttr(v)}"`)
        .join('');

      return n.children.length
        ? `<${n.tag}${attrs}>${serialize(n.children)}</${n.tag}>`
        : `<${n.tag}${attrs}/>`;
    })
    .join('');
}

// ------------------------------------------------------------------- cleaning

// Editor bookkeeping and document-level metadata: never drawn.
const DROP_TAGS = new Set([
  'metadata',
  'title',
  'desc',
  'style',
  'script',
  'namedview',
  'perspective',
  'rdf',
  'work',
  'license',
  'format',
  'type',
  'language',
  'subject',
  'source',
  'publisher',
  'description',
  'date',
  'creator',
  'bag',
  'agent',
]);

// Elements that only paint when something references them by id.
const DEF_TAGS = new Set([
  'defs',
  'symbol',
  'clippath',
  'marker',
  'mask',
  'lineargradient',
  'radialgradient',
  'pattern',
  'filter',
]);

// Anything namespaced (`sodipodi:`, `inkscape:`, Illustrator's `i:`, …) goes
// with its `xmlns:*` declaration — a leftover prefix is a parse error. The one
// exception, `xlink:href`, is rewritten to plain `href` before this runs.
const DROP_ATTR = /^(xmlns($|:)|[\w.-]+:|version$|class$|aria-|data-)/i;

// Attributes holding coordinates, rounded to keep the table small. 3 decimals
// is far below a pixel at every size these icons are drawn at; `transform`
// keeps significant digits instead, since a matrix scale of 0.0337 would be
// destroyed by absolute rounding.
const COORD_ATTRS = new Set([
  'd',
  'points',
  'x',
  'y',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'x1',
  'y1',
  'x2',
  'y2',
  'stroke-width',
  'stroke-dasharray',
]);

const NUMBER = /-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/gi;

/**
 * Rounds every number in a coordinate string. Compact path syntax lets a number
 * start right after the previous one, separated only by its own `-` or `.`
 * (`0.74991-1.6942e-5`), so a rounding that drops that character has to put a
 * space back — otherwise two numbers merge into one.
 */
function roundNumbers(s, round) {
  return s.replace(NUMBER, (m, _frac, _exp, offset) => {
    const out = String(round(Number(m)));

    const glued =
      offset > 0 &&
      /[\d.]/.test(s[offset - 1]) &&
      !out.startsWith('-') &&
      !out.startsWith('.');

    return glued ? ` ${out}` : out;
  });
}

const roundCoords = (s) => roundNumbers(s, r);

const roundSignificant = (s) =>
  roundNumbers(s, (n) => Number(n.toPrecision(8)));

// Parameter count per path command; `z` closes and takes none.
const PATH_ARITY = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

/**
 * Rounds path data. This needs a real tokenizer rather than a pass over the
 * numbers: an arc's two flags are single digits that may be written glued to
 * each other and to what follows (`a9.29 9.29 0 00-.227 1.055`), so reading
 * them as ordinary numbers destroys the command.
 */
function roundPathData(d) {
  let i = 0;

  const skipSep = () => {
    while (
      i < d.length &&
      (d[i] === ' ' ||
        d[i] === ',' ||
        d[i] === '\n' ||
        d[i] === '\t' ||
        d[i] === '\r')
    ) {
      i++;
    }
  };

  const readNumber = () => {
    skipSep();

    const m = /^[+-]?(\d*\.\d+|\d+\.?)([eE][+-]?\d+)?/.exec(d.slice(i));

    if (!m) {
      throw new Error(`path: expected a number at offset ${i}`);
    }

    i += m[0].length;

    return String(r(Number(m[0])));
  };

  const readFlag = () => {
    skipSep();

    if (d[i] !== '0' && d[i] !== '1') {
      throw new Error(`path: expected an arc flag at offset ${i}`);
    }

    return d[i++];
  };

  let out = '';

  const emit = (token) => {
    // A separator is only needed where two tokens would otherwise run together.
    out +=
      out && /[\w.]/.test(out.at(-1)) && /[\w.]/.test(token[0])
        ? ` ${token}`
        : token;
  };

  skipSep();

  while (i < d.length) {
    const cmd = d[i];

    if (!/[a-z]/i.test(cmd)) {
      throw new Error(`path: expected a command at offset ${i}, got ${cmd}`);
    }

    i++;

    const key = cmd.toLowerCase();

    const arity = PATH_ARITY[key];

    if (arity === undefined) {
      throw new Error(`path: unknown command ${cmd}`);
    }

    emit(cmd);

    skipSep();

    // Parameter groups repeat until the next command letter; the repeats carry
    // no letter of their own, which is what implicit repetition means anyway.
    while (arity > 0) {
      for (let k = 0; k < arity; k++) {
        emit(key === 'a' && (k === 3 || k === 4) ? readFlag() : readNumber());
      }

      skipSep();

      if (i >= d.length || !/[\d.+-]/.test(d[i])) {
        break;
      }
    }

    skipSep();
  }

  return out;
}

// Text and editor properties that cannot affect a shape-only drawing, plus
// declarations that only restate a default.
const DEAD_STYLE =
  /^(font|text|-inkscape|marker|line-height|letter-spacing|word-spacing|white-space|writing-mode|direction|block-progression|baseline-shift|enable-background|color-interpolation|image-rendering|isolation|solid-|shape-padding|inline-size|clip-rule)/;

const NOOP_STYLE = {
  opacity: '1',
  'fill-opacity': '1',
  'stroke-opacity': '1',
  'stroke-dasharray': 'none',
  'stroke-dashoffset': '0',
  display: 'inline',
  visibility: 'visible',
  'stroke-miterlimit': '4',
};

const NAMED_COLORS = {
  black: '#000000',
  white: '#ffffff',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  red: '#ff0000',
  lime: '#00ff00',
  blue: '#0000ff',
  green: '#008000',
};

/** Parses a colour literal to [r,g,b], or null when it isn't one. */
function parseColor(value) {
  let v = value.trim().toLowerCase();

  if (NAMED_COLORS[v]) {
    v = NAMED_COLORS[v];
  }

  const rgb = /^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/.exec(v);

  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(v)) {
    return null;
  }

  const hex =
    v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;

  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

/** Maps one paint value onto the theme. */
function themePaint(value) {
  const rgb = parseColor(value);

  if (!rgb) {
    // `none`, `currentColor`, `url(#…)` and anything unparseable stay put; only
    // a gradient reference can carry a colour we can't see.
    return { paint: value, colored: /^url\(/i.test(value.trim()) };
  }

  const [red, green, blue] = rgb;

  const max = Math.max(red, green, blue);

  const l = max / 255;

  // A hue this dark reads as black however saturated it is (the beehive's
  // #030c25), so it is ink rather than a colour worth preserving.
  if (l > 0.2 && max - Math.min(red, green, blue) > 16) {
    return { paint: value, colored: true };
  }

  // Everything down to a mid-dark grey is the drawing's ink. The cut-off has to
  // sit above the greys some icons are drawn entirely in (#404040, #646464) —
  // as an explicit colour those would all but vanish on the dark theme.
  if (l <= 0.45) {
    return { paint: 'currentColor', colored: false };
  }

  return l >= 0.85
    ? { paint: KNOCKOUT_PAINT, colored: false }
    : { paint: value, colored: false };
}

/** Splits a `style` attribute into ordered [prop, value] pairs. */
function parseStyle(style) {
  return style
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(':');

      return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()];
    });
}

function stringifyStyle(decls) {
  return decls.map(([k, v]) => `${k}:${v}`).join(';');
}

/**
 * Rewrites an element's paints in place. Returns true when it kept a colour of
 * its own (so the icon can't follow the theme).
 */
function themeElement(attrs) {
  let colored = false;

  const decls = attrs.style ? parseStyle(attrs.style) : [];

  for (const prop of ['fill', 'stroke']) {
    // A `style` declaration wins over the presentation attribute, so whichever
    // one is authoritative is the one to rewrite.
    const styleIdx = decls.findIndex(([k]) => k === prop);

    const source = styleIdx >= 0 ? decls[styleIdx][1] : attrs[prop];

    if (source === undefined) {
      continue;
    }

    const { paint, colored: c } = themePaint(source);

    colored ||= c;

    if (styleIdx >= 0) {
      decls[styleIdx][1] = paint;
    } else {
      attrs[prop] = paint;
    }
  }

  if (attrs.style !== undefined) {
    // A no-op declaration only goes when nothing underneath it would surface.
    const style = stringifyStyle(
      decls.filter(
        ([k, v]) =>
          !DEAD_STYLE.test(k) &&
          !(NOOP_STYLE[k] === v && attrs[k] === undefined),
      ),
    );

    if (style) {
      attrs.style = style;
    } else {
      delete attrs.style;
    }
  }

  return colored;
}

function collectRefs(node, out) {
  for (const [k, v] of Object.entries(node.attrs ?? {})) {
    if ((k === 'href' || k === 'xlink:href') && v.startsWith('#')) {
      out.add(v.slice(1));
    }

    for (const m of v.matchAll(/url\(\s*#([^)\s]+)\s*\)/g)) {
      out.add(m[1]);
    }
  }

  for (const c of node.children ?? []) {
    collectRefs(c, out);
  }
}

function hasReferencedId(node, refs) {
  return (
    (node.attrs?.id !== undefined && refs.has(node.attrs.id)) ||
    (node.children ?? []).some((c) => hasReferencedId(c, refs))
  );
}

/**
 * Turns a parsed icon document into inlinable markup. Returns the drawing's
 * children, or throws with what it couldn't handle.
 */
function cleanIcon(root, prefix) {
  const svg = root.children.find((c) => c.tag?.replace(/^svg:/i, '') === 'svg');

  if (!svg) {
    throw new Error('no <svg> root');
  }

  // Drop editor namespaces and metadata, and normalize the `svg:` prefix some
  // Inkscape files put on every element.
  (function dropJunk(node) {
    node.children = node.children.filter((child) => {
      if (child.text !== undefined) {
        return true;
      }

      const tag = child.tag.replace(/^svg:/i, '');

      if (tag.includes(':') || DROP_TAGS.has(tag.toLowerCase())) {
        return false;
      }

      child.tag = tag;

      dropJunk(child);

      return true;
    });
  })(svg);

  const refs = new Set();

  collectRefs(svg, refs);

  // Definitions nothing points at (leftover clip paths, symbols, gradients).
  (function dropUnusedDefs(node) {
    node.children = node.children.filter((child) => {
      if (child.text !== undefined) {
        return true;
      }

      if (
        DEF_TAGS.has(child.tag.toLowerCase()) &&
        !hasReferencedId(child, refs)
      ) {
        return false;
      }

      dropUnusedDefs(child);

      return true;
    });
  })(svg);

  let colored = false;

  (function rewrite(node) {
    for (const child of node.children) {
      if (child.text !== undefined) {
        if (child.text.trim()) {
          throw new Error(`unexpected text content: ${child.text.trim()}`);
        }

        continue;
      }

      if (child.attrs['xlink:href'] !== undefined) {
        child.attrs.href = child.attrs['xlink:href'];

        delete child.attrs['xlink:href'];
      }

      for (const key of Object.keys(child.attrs)) {
        if (DROP_ATTR.test(key)) {
          delete child.attrs[key];
        } else if (key === 'd') {
          child.attrs[key] = roundPathData(child.attrs[key]);
        } else if (COORD_ATTRS.has(key)) {
          child.attrs[key] = roundCoords(child.attrs[key]);
        } else if (key === 'transform') {
          child.attrs[key] = roundSignificant(child.attrs[key]);
        }
      }

      // Ids only survive where something references them; the prefix keeps two
      // icons inlined into one document from colliding.
      if (child.attrs.id !== undefined) {
        if (refs.has(child.attrs.id)) {
          child.attrs.id = `${prefix}${child.attrs.id}`;
        } else {
          delete child.attrs.id;
        }
      }

      if (child.attrs.href?.startsWith('#')) {
        child.attrs.href = `#${prefix}${child.attrs.href.slice(1)}`;
      }

      colored = themeElement(child.attrs) || colored;

      rewrite(child);
    }
  })(svg);

  // The root's own presentation attributes would be lost when its children are
  // lifted out, so carry the ones that paint over to a wrapping group.
  const rootAttrs = {};

  for (const key of ['fill', 'stroke', 'fill-rule', 'opacity', 'style']) {
    if (svg.attrs[key] !== undefined) {
      rootAttrs[key] = svg.attrs[key];
    }
  }

  if (rootAttrs.style !== undefined) {
    // Layout properties on the root describe the standalone document, not the
    // drawing.
    const decls = parseStyle(rootAttrs.style).filter(
      ([k]) => !/^(width|height|overflow|vertical-align|display)$/.test(k),
    );

    rootAttrs.style = stringifyStyle(decls);

    if (!rootAttrs.style) {
      delete rootAttrs.style;
    }
  }

  colored = themeElement(rootAttrs) || colored;

  for (const [k, v] of Object.entries(rootAttrs)) {
    // `currentColor` is what the host <svg> already sets.
    if (v === 'currentColor' || v === '') {
      delete rootAttrs[k];
    }
  }

  const body = Object.keys(rootAttrs).length
    ? serialize([{ tag: 'g', attrs: rootAttrs, children: svg.children }])
    : serialize(svg.children);

  return { body, colored, svgAttrs: svg.attrs };
}

/**
 * The icon's own coordinate system: viewBox, else width/height. `ppu` is how
 * many pixels one user unit is at the icon's natural size — the two usually
 * agree, but a handful of icons draw a 3.7-unit viewBox at 14 px, and taking
 * their units for pixels renders them at a third of their proper size.
 */
function viewport(attrs) {
  // Only a plain length is a pixel size: `width="100%"` means "fill whatever
  // you are placed in", and reading it as 100 px would claim the drawing is
  // seven times its real size.
  const px = /^\s*[\d.]+\s*(px)?\s*$/.test(attrs.width ?? '')
    ? Number.parseFloat(attrs.width)
    : Number.NaN;

  if (attrs.viewBox) {
    const [x, y, w, h] = attrs.viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    return { x, y, w, h, ppu: Number.isFinite(px) && w ? px / w : 1 };
  }

  const h = Number.parseFloat(attrs.height);

  return Number.isFinite(px) && Number.isFinite(h)
    ? { x: 0, y: 0, w: px, h, ppu: 1 }
    : null;
}

// -------------------------------------------------------------------- collect

const ok = [];
const failed = [];
const skipped = [];

for (const source of SOURCES) {
  for (const abs of walk(source.dir).sort()) {
    collect(abs, source);
  }
}

function collect(abs, source) {
  const src = readFileSync(abs, 'utf8');

  const path = relative(source.dir, abs).replace(/\.svg$/, '');

  // The folders only group the sources; an icon is identified by its file name
  // alone, which is what a stored `poi:<name>` spec carries.
  const name = source.prefix + path.split('/').pop();

  if (!source.whole && !referenced.has(name)) {
    skipped.push(name);

    return;
  }

  try {
    const optimized = optimize(src, { ...SVGO_CONFIG, path: abs }).data;

    const { body, colored, svgAttrs } = cleanIcon(
      parseXml(optimized),
      `${name.replaceAll(/[^\w]/g, '_')}_`,
    );

    const vp = viewport(svgAttrs);

    if (!vp?.w || !vp?.h) {
      throw new Error('no viewport (viewBox/width/height)');
    }

    // loadSystemFonts:false skips scanning the system font dirs on every
    // instance (these icons have no text) — that scan dominated the runtime.
    const bbox = new Resvg(src, { font: { loadSystemFonts: false } }).getBBox();

    if (!bbox || !(bbox.width > 0) || !(bbox.height > 0)) {
      throw new Error('empty bbox');
    }

    ok.push({
      path: source.prefix + path,
      name,
      body,
      mono: !colored,
      vb: [r(vp.x), r(vp.y), r(vp.w), r(vp.h)],
      ppu: r(vp.ppu),
      bbox: [r(bbox.x - vp.x), r(bbox.y - vp.y), r(bbox.width), r(bbox.height)],
      src,
    });
  } catch (e) {
    failed.push({ abs, error: String(e.message ?? e).trim() });
  }
}

// --------------------------------------------------------------------- verify

if (VERIFY) {
  // Rendered large on purpose: a re-fitted curve moves antialiased edge pixels
  // by a fraction of a pixel, and the bigger the render the smaller a share of
  // the drawing those edges are — so the threshold below can stay tight enough
  // to catch a dropped detail.
  const SIZE = 320;

  // No background: the alpha channel then carries the drawing's shape alone,
  // independent of the tone it is painted in.
  const render = (svg) =>
    new Resvg(svg, {
      fitTo: { mode: 'width', value: SIZE },
      font: { loadSystemFonts: false },
    }).render();

  const drift = [];

  for (const icon of ok) {
    // resvg resolves neither `currentColor` nor CSS variables, so stand in the
    // values the light theme lands on.
    const rebuilt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.vb.join(
      ' ',
    )}" width="${icon.vb[2]}" height="${icon.vb[3]}" fill="#000">${icon.body
      .replaceAll(KNOCKOUT_PAINT, '#fff')
      .replaceAll('currentColor', '#000')}</svg>`;

    let a;
    let b;

    try {
      a = render(icon.src);
      b = render(rebuilt);
    } catch (e) {
      drift.push({ name: icon.name, note: `render failed: ${e.message}` });

      continue;
    }

    if (a.width !== b.width || a.height !== b.height) {
      drift.push({
        name: icon.name,
        note: `size ${a.width}x${a.height} vs ${b.width}x${b.height}`,
      });

      continue;
    }

    // `pixels` copies the frame buffer on every read, so take it exactly once.
    const ap = a.pixels;
    const bp = b.pixels;

    // Re-inking is deliberate, so tone is not compared: what must hold is that
    // the drawing covers the same pixels (nothing lost, moved or gained by the
    // cleaning pass) and that anything coloured kept its colour.
    let shape = 0;
    let hue = 0;

    for (let i = 0; i < ap.length; i += 4) {
      if (Math.abs(ap[i + 3] - bp[i + 3]) > 24) {
        shape++;
      }

      // Only the paints the theming promises to keep are compared: a hue too
      // dark to read as one is deliberately re-inked, exactly as themePaint says.
      if (
        ap[i + 3] > 200 &&
        Math.max(ap[i], ap[i + 1], ap[i + 2]) > 51 &&
        Math.max(ap[i], ap[i + 1], ap[i + 2]) -
          Math.min(ap[i], ap[i + 1], ap[i + 2]) >
          24 &&
        (Math.abs(ap[i] - bp[i]) > 24 ||
          Math.abs(ap[i + 1] - bp[i + 1]) > 24 ||
          Math.abs(ap[i + 2] - bp[i + 2]) > 24)
      ) {
        hue++;
      }
    }

    const px = a.width * a.height;

    if (shape / px > 0.005 || hue / px > 0.005) {
      drift.push({
        name: icon.name,
        note: `${((shape / px) * 100).toFixed(2)}% shape, ${(
          (hue / px) * 100
        ).toFixed(2)}% colour`,
      });
    }
  }

  console.log(
    drift.length
      ? `\n${drift.length} icon(s) differ from the original render:\n` +
          drift.map((d) => `  - ${d.name}: ${d.note}`).join('\n')
      : `\nVerified ${ok.length} icons render identically to their source.`,
  );
}

// ---------------------------------------------------------------------- write

// Only the file's own name identifies an icon, so two files in different
// folders may not share one.
const byName = new Map();

for (const icon of ok) {
  const clash = byName.get(icon.name);

  if (clash) {
    throw new Error(
      `two icons are both named "${icon.name}": ${clash.path} and ${icon.path}`,
    );
  }

  byName.set(icon.name, icon);
}

// Quote a key only where it isn't a plain identifier (forester's_lodge).
const key = (name) =>
  /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);

const entryLines = ok.map(
  (icon) =>
    `  ${key(icon.name)}: { vb: [${icon.vb.join(', ')}], bbox: [${icon.bbox.join(
      ', ',
    )}], ${icon.ppu === 1 ? '' : `ppu: ${icon.ppu}, `}mono: ${
      icon.mono
    }, body: ${JSON.stringify(icon.body)} },`,
);

writeFileSync(
  OUT_FILE,
  `// AUTO-GENERATED by scripts/gen-poi-icons.mjs — do not edit by hand.
// One entry per bundled poi icon, keyed by its file name — the same name a
// \`poi:<name>\` icon spec and osmTagToIconMapping use. The drawings are inlined
// here rather than referenced, so the .svg files themselves never reach the
// bundle. See the generator header for how \`body\` is cleaned and re-painted.
//
// This module is deliberately imported eagerly, unlike the Font Awesome set:
// markers and result rows would otherwise draw without their glyph until a
// chunk landed, and that is the map's own content.

/**
 * Knockouts inside an icon paint with this variable — set it to whatever sits
 * behind the drawing (the page, a marker's inset). Unset, they stay white.
 */
export const POI_ICON_KNOCKOUT_VAR = '${KNOCKOUT_VAR}';

/** Every bundled icon, so a mapping onto one is checked at build time. */
export type PoiIconName =
${[...byName.keys()].map((n) => `  | ${JSON.stringify(n)}`).join('\n')};

export type PoiIcon = {
  /** The drawing's own coordinate system: [x, y, width, height]. */
  vb: readonly [x: number, y: number, w: number, h: number];
  /** Ink bounding box in viewport-local units: [x, y, width, height]. */
  bbox: readonly [lx: number, ly: number, bw: number, bh: number];
  /** Pixels per user unit at the drawing's natural size; 1 unless stated. */
  ppu?: number;
  /** True when the drawing carries no colour of its own, so it follows the text colour. */
  mono: boolean;
  /** Markup to inline into a host <svg> that sets \`fill="currentColor"\`. */
  body: string;
};

export const poiIcons: Record<string, PoiIcon> = {
${entryLines.join('\n')}
};
`,
);

// The output is committed and linted with everything else, and Biome's import
// order is not the order the icons are walked in.
try {
  execFileSync(join(here, '..', 'node_modules', '.bin', 'biome'), [
    'check',
    '--write',
    OUT_FILE,
  ]);
} catch {
  console.warn('\nCould not run biome on the output — format it by hand.');
}

console.log(
  `Wrote ${OUT_FILE}: ${ok.length} icons (${
    ok.filter((i) => i.mono).length
  } monochrome, ${ok.filter((i) => !i.mono).length} coloured).`,
);

if (failed.length) {
  console.warn(`\n${failed.length} icon(s) FAILED and were left out:`);

  for (const f of failed) {
    console.warn(`  - ${relative(ICON_DIR, f.abs)}: ${f.error}`);
  }

  process.exitCode = 1;
}
