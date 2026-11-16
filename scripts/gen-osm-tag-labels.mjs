// Generates src/osm/tagLabels/<lang>.json — human-readable OSM key and value
// labels taken from the iD editor's tagging schema, English-filled per language.
//
// Run: node scripts/gen-osm-tag-labels.mjs  (or: pnpm gen-osm-tag-labels)
// The emitted JSON is committed, so normal builds don't run this.

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const VERSION = '7.3.0';

const BASE = `https://cdn.jsdelivr.net/npm/@openstreetmap/id-tagging-schema@${VERSION}/dist`;

const OUT_DIR = new URL('../src/osm/tagLabels/', import.meta.url);

const { langs } = JSON.parse(
  await readFile(
    new URL('../translation-manager/templates.json', import.meta.url),
    'utf8',
  ),
);

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`);

  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status}`);
  }

  return res.json();
}

const fields = await fetchJson('fields.min.json');

const presets = await fetchJson('presets.min.json');

const enStrings = (await fetchJson('translations/en.min.json')).en.presets;

// Field ids spell `:` as `/`; the field whose id is its key is the general one.
const fieldPriority = (id, key) => (id.replaceAll('/', ':') === key ? 0 : 1);

const optionLabel = (o) => (typeof o === 'string' ? o : o?.title);

const ENUM_TYPES = new Set([
  'access',
  'check',
  'combo',
  'defaultCheck',
  'directionalCombo',
  'manyCombo',
  'multiCombo',
  'onewayCheck',
  'radio',
  'semiCombo',
  'structureRadio',
  'typeCombo',
]);

/** Keys whose values come from a fixed list in every field that edits them. */
function enumKeys() {
  const enums = new Set();

  const free = new Set();

  for (const field of Object.values(fields)) {
    if (field.type === 'address') {
      continue;
    }

    // A combo that keeps case and spaces takes free text (`source`).
    const isEnum =
      ENUM_TYPES.has(field.type) &&
      field.snake_case !== false &&
      field.caseSensitive !== true;

    const keys =
      field.type === 'manyCombo'
        ? (field.options ?? [])
        : field.key?.endsWith(':')
          ? (field.options ?? []).map((opt) => field.key + opt)
          : [field.key, ...(field.keys ?? [])].filter(Boolean);

    for (const key of keys) {
      (isEnum ? enums : free).add(key);
    }
  }

  return [...enums.difference(free)].toSorted();
}

const enums = enumKeys();

function extract(strings) {
  const keys = {};

  const values = {};

  // [key, label, priority]; lower priority wins.
  const keyCandidates = [];

  const valueCandidates = [];

  for (const [id, field] of Object.entries(fields)) {
    const tr = strings.fields?.[id];

    if (!tr) {
      continue;
    }

    const options = tr.options ?? {};

    const isMultiPrefix =
      field.type === 'multiCombo' && field.key?.endsWith(':');

    if (isMultiPrefix) {
      // `payment:cash=yes` → "Payment types: Cash".
      for (const [opt, o] of Object.entries(options)) {
        const label = optionLabel(o);

        if (label && tr.label) {
          keyCandidates.push([field.key + opt, `${tr.label}: ${label}`, 0]);
        }
      }

      continue;
    }

    if (field.type === 'address') {
      for (const [part, label] of Object.entries({
        ...tr.placeholders,
        ...tr.labels,
      })) {
        // "Address: City", or it reads as `place`'s or `level`'s label.
        if (!part.includes('!') && !/^[\d\s]+$/.test(label) && tr.label) {
          keyCandidates.push([`addr:${part}`, `${tr.label}: ${label}`, 1]);
        }
      }

      continue;
    }

    if (field.type === 'manyCombo') {
      // Each option is a key of its own, e.g. `hiking=yes`.
      for (const [opt, o] of Object.entries(options)) {
        const label = optionLabel(o);

        if (label) {
          keyCandidates.push([opt, label, 2]);
        }
      }

      continue;
    }

    if (field.type === 'access') {
      for (const [k, label] of Object.entries(tr.types ?? {})) {
        const keyLabel = k === 'access' ? tr.label : label;

        // An undefined label would mask the English one in the merge.
        if (keyLabel) {
          keyCandidates.push([k, keyLabel, k === 'access' ? 0 : 1]);
        }

        for (const [opt, o] of Object.entries(options)) {
          if (optionLabel(o)) {
            valueCandidates.push([k, opt, optionLabel(o), 1]);
          }
        }
      }

      continue;
    }

    // TODO: a field's other `keys` (structureRadio, directionalCombo) get no
    // labels, though `enums` lists them.
    const key = field.key;

    if (!key || key.endsWith(':')) {
      continue;
    }

    const priority = fieldPriority(id, key);

    // A type field's label ("Type", "Natural") only makes sense inside its
    // preset; the key's generic preset (`natural=*`) names it out of context.
    if (field.type === 'typeCombo' || enStrings.fields[id]?.label === 'Type') {
      // Some locales end generic preset names with "...".
      const generic = strings.presets?.[key]?.name?.replace(
        /\s*(\.\.\.|…)$/,
        '',
      );

      if (generic && presets[key]?.tags?.[key] === '*') {
        keyCandidates.push([key, generic, priority]);
      }
    } else if (tr.label) {
      keyCandidates.push([key, tr.label, priority]);
    }

    for (const [opt, o] of Object.entries(options)) {
      const label = optionLabel(o);

      if (label) {
        valueCandidates.push([key, opt, label, priority]);
      }
    }
  }

  // Single-tag presets name the values of type keys (`natural=peak`).
  for (const [id, preset] of Object.entries(presets)) {
    const tags = Object.entries(preset.tags ?? {});

    const name = strings.presets?.[id]?.name;

    if (tags.length === 1 && tags[0][1] !== '*' && name) {
      valueCandidates.push([tags[0][0], tags[0][1], name, 2]);
    }
  }

  const keyPriority = {};

  for (const [key, label, p] of keyCandidates) {
    if (!(key in keyPriority) || p < keyPriority[key]) {
      keyPriority[key] = p;

      keys[key] = label;
    }
  }

  const valuePriority = {};

  for (const [key, value, label, p] of valueCandidates) {
    const id = `${key}=${value}`;

    if (!(id in valuePriority) || p < valuePriority[id]) {
      valuePriority[id] = p;

      values[key] ??= {};

      values[key][value] = label;
    }
  }

  return { keys, values };
}

const sortObject = (o) =>
  Object.fromEntries(
    Object.entries(o)
      .toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => [k, typeof v === 'object' ? sortObject(v) : v]),
  );

const en = extract(enStrings);

await mkdir(OUT_DIR, { recursive: true });

for (const lang of ['en', ...langs]) {
  const own =
    lang === 'en'
      ? en
      : extract(
          (await fetchJson(`translations/${lang}.min.json`))[lang].presets,
        );

  const keys = { ...en.keys, ...own.keys };

  const values = {};

  for (const key of new Set([
    ...Object.keys(en.values),
    ...Object.keys(own.values),
  ])) {
    values[key] = { ...en.values[key], ...own.values[key] };
  }

  const out = {
    source: `@openstreetmap/id-tagging-schema ${VERSION} (ISC)`,
    keys: sortObject(keys),
    values: sortObject(values),
    enums,
  };

  const json = `${JSON.stringify(out)}\n`;

  await writeFile(new URL(`${lang}.json`, OUT_DIR), json);

  console.log(
    `${lang}: ${Object.keys(own.keys).length} own keys, ${(json.length / 1024).toFixed(0)} KiB`,
  );
}
