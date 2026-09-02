// Checks the React Compiler's *output*, which is where its surprises live —
// see doc/react-compiler.md.
//
//   node scripts/react-compiler-check.mjs rewrites
//     Compiles every source file with the compiler on and off and compares the
//     string literals in the emitted code. A literal that appears in only one
//     build means the compiler rewrote something it should not have. This is
//     what caught `<kbd>` being emitted as `<kbd_0>` because a local binding
//     shadowed the intrinsic tag name.
//
//   node scripts/react-compiler-check.mjs unchanged [ref]
//     Compiles every file changed against `ref` (default HEAD) both before and
//     after and reports which emit byte-identical JavaScript. Use it to prove a
//     refactor is a semantic no-op — removing manual memoization, say.
import { execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, transformFile } from '@swc/core';

const SWC = (reactCompiler) => ({
  jsc: {
    parser: { syntax: 'typescript', tsx: true },
    transform: { react: { runtime: 'automatic' }, reactCompiler },
  },
});

// Added by the compiler itself, so not evidence of a rewrite.
const BENIGN = new Set([
  'react/compiler-runtime',
  'react.memo_cache_sentinel',
  'react.early_return_sentinel',
  'use no memo',
  'use memo',
]);

function sources(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);

    if (statSync(p).isDirectory()) {
      sources(p, out);
    } else if (/\.tsx?$/.test(p) && !/\.messages\.tsx$/.test(p)) {
      out.push(p);
    }
  }

  return out;
}

/**
 * String literals in emitted code, by value — the compiler re-prints the module
 * and normalises quoting, so comparing raw text reports every file.
 */
async function literals(code) {
  const counts = new Map();

  const visit = (node) => {
    if (node === null || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      for (const n of node) {
        visit(n);
      }

      return;
    }

    if (node.type === 'StringLiteral' && typeof node.value === 'string') {
      counts.set(node.value, (counts.get(node.value) ?? 0) + 1);
    }

    for (const k of Object.keys(node)) {
      if (k !== 'span') {
        visit(node[k]);
      }
    }
  };

  visit(await parse(code, { syntax: 'ecmascript', jsx: false }));

  return counts;
}

async function rewrites() {
  const files = sources('src');
  let hits = 0;

  for (const f of files) {
    const compiled = (await transformFile(f, SWC(true))).code;

    if (!compiled.includes('react/compiler-runtime')) {
      continue; // the compiler skipped this file, so it can rewrite nothing
    }

    const before = await literals((await transformFile(f, SWC(false))).code);
    const after = await literals(compiled);

    const added = [...after.keys()].filter(
      (k) => !before.has(k) && !BENIGN.has(k),
    );

    if (added.length) {
      hits++;
      console.log('REWRITTEN', f, JSON.stringify(added));
    }
  }

  console.log(`\nscanned ${files.length} files | rewrites: ${hits}`);

  return hits === 0 ? 0 : 1;
}

async function unchanged(ref) {
  const changed = execSync(`git diff --name-only ${ref}`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((f) => /\.tsx?$/.test(f));

  if (changed.length === 0) {
    console.log(`no source files changed against ${ref}`);

    return 0;
  }

  const dir = mkdtempSync(join(tmpdir(), 'rc-check-'));
  const differ = [];

  for (const f of changed) {
    const tmp = join(dir, `${f.replace(/[^a-z0-9]/gi, '_')}.tsx`);

    writeFileSync(tmp, execSync(`git show ${ref}:${f}`, { encoding: 'utf8' }));

    const before = (await transformFile(tmp, SWC(true))).code;
    const after = (await transformFile(f, SWC(true))).code;

    if (before !== after) {
      differ.push(f);
    }
  }

  console.log(
    `byte-identical emitted output: ${changed.length - differ.length}/${changed.length}`,
  );

  for (const f of differ) {
    console.log('  differs:', f);
  }

  return 0;
}

const [mode, ref] = process.argv.slice(2);

if (mode === 'rewrites') {
  process.exit(await rewrites());
} else if (mode === 'unchanged') {
  process.exit(await unchanged(ref ?? 'HEAD'));
} else {
  console.error('usage: react-compiler-check.mjs rewrites | unchanged [ref]');
  process.exit(2);
}
