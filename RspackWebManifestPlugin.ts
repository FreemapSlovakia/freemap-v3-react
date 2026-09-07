import fs from 'node:fs';
import path from 'node:path';
import type { Compiler } from '@rspack/core';
import { rspack } from '@rspack/core';

/** What one domain overrides in the base manifest. */
export interface WebManifestVariant {
  filename: string;
  /** The portal name shown in the install prompt and on the home screen. */
  name: string;
  lang: string;
  description: string;
  /** Labels for the base manifest's `shortcuts`, in order. */
  shortcutNames: string[];
}

interface WebManifestPluginOptions {
  /** Base manifest; everything not overridden by a variant is taken from here. */
  base: string;
  variants: WebManifestVariant[];
}

/**
 * Emits one web manifest per domain from a single base document, so an app
 * installed from freemap.eu carries the international name and copy.
 */
export class RspackWebManifestPlugin {
  constructor(private readonly options: WebManifestPluginOptions) {}

  apply(compiler: Compiler) {
    const base = path.resolve(compiler.context, this.options.base);

    compiler.hooks.thisCompilation.tap(
      'RspackWebManifestPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'RspackWebManifestPlugin',
            stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          },
          () => {
            compilation.fileDependencies.add(base);

            const doc = JSON.parse(fs.readFileSync(base, 'utf8'));

            for (const variant of this.options.variants) {
              compilation.emitAsset(
                variant.filename,
                new rspack.sources.RawSource(this.render(doc, variant)),
              );
            }
          },
        );
      },
    );
  }

  private render(
    doc: Record<string, unknown>,
    variant: WebManifestVariant,
  ): string {
    // `$schema` is an editor aid on the source document only.
    const { $schema, ...rest } = doc;

    const shortcuts = (doc['shortcuts'] ?? []) as { name: string }[];

    if (shortcuts.length !== variant.shortcutNames.length) {
      throw new Error(
        `${variant.filename}: the base manifest has ${shortcuts.length} shortcuts but ${variant.shortcutNames.length} labels were given`,
      );
    }

    return JSON.stringify(
      {
        ...rest,
        name: variant.name,
        lang: variant.lang,
        description: variant.description,
        shortcuts: shortcuts.map((shortcut, i) => ({
          ...shortcut,
          name: variant.shortcutNames[i],
        })),
      },
      null,
      2,
    );
  }
}
