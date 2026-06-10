import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { Compiler } from '@rspack/core';
import templatesConfig from './translation-manager/templates.json' with {
  type: 'json',
};

interface SyncLanguagesPluginOptions {
  root: string;
  script: string;
}

export class RspackSyncLanguagesPlugin {
  constructor(private readonly options: SyncLanguagesPluginOptions) {}

  apply(compiler: Compiler) {
    const sources = new Set<string>();

    for (const template of templatesConfig.templates) {
      sources.add(
        path.resolve(
          this.options.root,
          template.replace('{LANG}', 'en.messages'),
        ),
      );

      for (const lang of templatesConfig.langs) {
        sources.add(
          path.resolve(
            this.options.root,
            template.replace('{LANG}', `${lang}.template`),
          ),
        );
      }
    }

    const run = () => {
      const result = spawnSync(
        process.execPath,
        ['--enable-source-maps', this.options.script],
        { stdio: 'inherit', cwd: this.options.root },
      );

      if (result.status !== 0) {
        throw new Error(
          `sync-language-files exited with status ${result.status}`,
        );
      }
    };

    compiler.hooks.watchRun.tap('RspackSyncLanguagesPlugin', (c) => {
      const modified = c.modifiedFiles;

      // First watch run — assume the start script already synced.
      if (!modified) {
        return;
      }

      for (const f of modified) {
        if (sources.has(f)) {
          run();
          break;
        }
      }
    });

    compiler.hooks.thisCompilation.tap(
      'RspackSyncLanguagesPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          { name: 'RspackSyncLanguagesPlugin', stage: -2000 },
          () => {
            for (const f of sources) {
              compilation.fileDependencies.add(f);
            }
          },
        );
      },
    );
  }
}
