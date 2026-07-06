// One-shot scaffolder: creates `<lang>.template.*` files for a new language so
// `sync-language-files` can then emit full `<lang>.messages.*` files with
// `TODO translate` blocks.
//
// Strategy: copy each `en.messages.*` file verbatim, but in the messages root
// object drop every plain-string leaf (those become `TODO translate` entries in
// the generated file, carrying sibling-language hints) while keeping every
// non-string leaf (functions, JSX, template literals) as-is. Non-string leaves
// are what reference the file's imports and top-level helpers, so keeping them
// leaves no unused imports; their English text is a placeholder to translate by
// hand later. Imports, helper consts, and sibling exports (e.g. osm
// `colorNames`) are preserved unchanged. The root type annotation is rewrapped
// with the partial wrapper (`DeepPartial` / `DeepPartialWithRequiredObjects`)
// taken from the matching `sk.template`.
//
// Usage: node translation-manager/scaffold-language.mjs <lang>

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as babelParser from '@babel/parser';
import {
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isIdentifier,
  isImportDeclaration,
  isNumericLiteral,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTSTypeReference,
  isVariableDeclaration,
} from '@babel/types';
import templatesConfig from './templates.json' with { type: 'json' };

const lang = process.argv[2];

if (!lang) {
  console.error('usage: node scaffold-language.mjs <lang>');
  process.exit(1);
}

function parseSource(source) {
  return babelParser.parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// The type name that marks the messages root, unwrapping any partial wrapper.
function rootInnerTypeName(decl) {
  if (!isIdentifier(decl.id)) {
    return null;
  }

  const ann = decl.id.typeAnnotation?.typeAnnotation;

  if (!isTSTypeReference(ann) || !isIdentifier(ann.typeName)) {
    return null;
  }

  if (
    ann.typeName.name === 'DeepPartial' ||
    ann.typeName.name === 'DeepPartialWithRequiredObjects'
  ) {
    const inner = (ann.typeArguments ?? ann.typeParameters)?.params[0];

    return isTSTypeReference(inner) && isIdentifier(inner.typeName)
      ? inner.typeName.name
      : null;
  }

  return ann.typeName.name;
}

function isMessagesTypeName(name) {
  return !!name && (name.endsWith('Messages') || name === 'OsmTagToNameMapping');
}

// Find the top-level object-expression declaration whose type annotation marks
// it as the messages root (ignoring sibling exports like `colorNames`).
function findRootInfo(program) {
  for (const stmt of program.body) {
    let decl = null;
    let isNamedExport = false;

    if (
      isExportNamedDeclaration(stmt) &&
      isVariableDeclaration(stmt.declaration)
    ) {
      decl = stmt.declaration.declarations[0];
      isNamedExport = true;
    } else if (isVariableDeclaration(stmt)) {
      decl = stmt.declarations[0];
    }

    if (
      decl &&
      isObjectExpression(decl.init) &&
      isMessagesTypeName(rootInnerTypeName(decl))
    ) {
      return { decl, isNamedExport };
    }
  }

  return null;
}

// Wrapper type + its import source, read from the sk.template root annotation.
function wrapperMeta(program) {
  const info = findRootInfo(program);

  if (!info) {
    throw new Error('sk.template root not found');
  }

  const ann = info.decl.id.typeAnnotation.typeAnnotation;
  const wrapper = ann.typeName.name;

  let wrapperSource = null;

  for (const stmt of program.body) {
    if (!isImportDeclaration(stmt)) {
      continue;
    }

    for (const spec of stmt.specifiers) {
      if (spec.local?.name === wrapper) {
        wrapperSource = stmt.source.value;
      }
    }
  }

  if (!wrapperSource) {
    throw new Error('wrapper import source not found for ' + wrapper);
  }

  return { wrapper, wrapperSource };
}

function keyText(key) {
  let name;

  if (isIdentifier(key)) {
    name = key.name;
  } else if (isStringLiteral(key)) {
    name = key.value;
  } else if (isNumericLiteral(key)) {
    name = String(key.value);
  } else {
    return null;
  }

  return IDENT_RE.test(name) ? name : `'${name}'`;
}

// Emit the messages object keeping non-string leaves verbatim and dropping
// plain-string leaves (so sync marks them TODO).
function transformObject(objExpr, src, indent) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  const lines = [];

  for (const prop of objExpr.properties) {
    if (!isObjectProperty(prop)) {
      continue;
    }

    const key = keyText(prop.key);

    if (key === null) {
      continue;
    }

    const val = prop.value;

    if (isObjectExpression(val)) {
      lines.push(`${padInner}${key}: ${transformObject(val, src, indent + 1)},`);
    } else if (isStringLiteral(val)) {
      // drop → becomes a TODO translate entry with sibling-language hints
    } else {
      lines.push(`${padInner}${key}: ${src.slice(val.start, val.end)},`);
    }
  }

  if (lines.length === 0) {
    return '{}';
  }

  return `{\n${lines.join('\n')}\n${pad}}`;
}

function scaffoldOne(template) {
  const enPath = resolve(import.meta.dirname, '..', template.replace('{LANG}', 'en.messages'));
  const skPath = resolve(import.meta.dirname, '..', template.replace('{LANG}', 'sk.template'));
  const outPath = resolve(import.meta.dirname, '..', template.replace('{LANG}', lang + '.template'));

  const enSource = readFileSync(enPath, 'utf-8');
  const enProgram = parseSource(enSource).program;
  const skProgram = parseSource(readFileSync(skPath, 'utf-8')).program;

  const enRoot = findRootInfo(enProgram);

  if (!enRoot) {
    throw new Error('en root not found in ' + enPath);
  }

  const { wrapper, wrapperSource } = wrapperMeta(skProgram);

  const decl = enRoot.decl;
  const enName = decl.id.name;
  const targetName = enName === 'en' ? lang : enName; // features use the lang code

  const annNode = decl.id.typeAnnotation.typeAnnotation;
  const annText = enSource.slice(annNode.start, annNode.end);

  const edits = [];

  // rename the const identifier for language-coded feature files (en -> sl)
  if (targetName !== enName) {
    edits.push([decl.id.start, decl.id.start + enName.length, targetName]);

    for (const stmt of enProgram.body) {
      if (
        isExportDefaultDeclaration(stmt) &&
        isIdentifier(stmt.declaration) &&
        stmt.declaration.name === enName
      ) {
        edits.push([stmt.declaration.start, stmt.declaration.end, targetName]);
      }
    }
  }

  // rewrap the root type annotation with the partial wrapper
  edits.push([annNode.start, annNode.end, `${wrapper}<${annText}>`]);

  // replace the messages object with the transformed skeleton
  edits.push([decl.init.start, decl.init.end, transformObject(decl.init, enSource, 0)]);

  edits.sort((a, b) => b[0] - a[0]);

  let out = enSource;

  for (const [start, end, text] of edits) {
    out = out.slice(0, start) + text + out.slice(end);
  }

  // relocalize the sibling `<lang>-shared` import (only the global file has it)
  out = out.replace(/(['"]\.\/)en-shared(\.js['"])/g, `$1${lang}-shared$2`);

  out = `import type { ${wrapper} } from '${wrapperSource}';\n` + out;

  writeFileSync(outPath, out);

  console.log('wrote', template.replace('{LANG}', lang + '.template'));
}

for (const template of templatesConfig.templates) {
  scaffoldOne(template);
}

console.log('done:', templatesConfig.templates.length, 'files');
