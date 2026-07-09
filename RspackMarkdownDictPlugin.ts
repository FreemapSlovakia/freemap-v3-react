import fs from 'node:fs';
import path from 'node:path';
import type { Compiler } from '@rspack/core';
import { rspack } from '@rspack/core';
import matter from 'gray-matter';

interface MarkdownDictPluginOptions {
  dir: string;
  modulePath?: string; // e.g. 'node_modules/virtual/markdown-dict.js'
}

export class RspackMarkdownDictPlugin {
  constructor(private readonly options: MarkdownDictPluginOptions) {}

  apply(compiler: Compiler) {
    const virtualPath =
      this.options.modulePath ?? 'node_modules/virtual/markdown-dict.js';

    const virtualModules = new rspack.experiments.VirtualModulesPlugin({
      [virtualPath]: this.buildDict(),
    });

    virtualModules.apply(compiler);
  }

  private buildDict(): string {
    const files = fs.readdirSync(this.options.dir);

    const imports = new Set(['import { createElement } from "react";']);
    const code: string[] = ['export default ['];

    for (const file of files) {
      if (!file.endsWith('.md')) {
        continue;
      }

      const fullPath = path.join(this.options.dir, file);
      const { data } = matter(fs.readFileSync(fullPath, 'utf-8'));

      const match = /^(\w+)\.(\w\w)\.md$/.exec(file);

      if (!match) {
        throw new Error(`invalid filename ${file}`);
      }

      if ('icon' in data) {
        imports.add(
          `import { ${data.icon} } from 'react-icons/${data.icon.slice(0, 2).toLowerCase()}';`,
        );
      }

      const fields: string[] = [`key: "${match[1]}"`, `lang: "${match[2]}"`];

      if ('title' in data) {
        fields.push(`title: ${JSON.stringify(data.title)}`);
      }

      if ('listed' in data) {
        fields.push(`listed: ${data.listed}`);
      }

      if ('icon' in data) {
        fields.push(`icon: createElement(${data.icon})`);
      }

      if ('order' in data) {
        fields.push(`order: ${data.order}`);
      }

      code.push(`{ ${fields.join(', ')} },`);
    }

    code.push('];');

    return [...imports, ...code].join('\n');
  }
}
