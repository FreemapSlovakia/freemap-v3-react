import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SHARED_MJS = './maplibre-gl-shared.mjs';

/** Drops the `.map` reference; maplibre's source maps aren't emitted. */
function stripSourceMappingUrl(code) {
  return code.replace(/\n?\/\/# sourceMappingURL=.*$/m, '');
}

/**
 * Prepares maplibre-gl's prebuilt worker for emission as a raw asset.
 *
 * The worker imports `maplibre-gl-shared.mjs` as a literal `./` sibling, so
 * that file is emitted here and the import rewritten to point at it. Both get
 * a `.js` extension — nginx's stock mime.types maps no `.mjs`, and a module
 * worker served without a JavaScript content type is rejected — and a content
 * hash, so a redeploy can never pair a fresh worker with a cached stale
 * sibling.
 */
export default async function maplibreWorkerLoader(source) {
  if (!source.includes(SHARED_MJS)) {
    this.emitError(
      new Error(
        `maplibre-gl worker no longer imports ${SHARED_MJS} — rework the worker asset wiring.`,
      ),
    );

    return source;
  }

  const sharedPath = path.join(
    path.dirname(this.resourcePath),
    'maplibre-gl-shared.mjs',
  );

  this.addDependency(sharedPath);

  const shared = stripSourceMappingUrl(await readFile(sharedPath, 'utf8'));

  const hash = createHash('sha256').update(shared).digest('hex').slice(0, 16);

  const sharedName = `maplibre-gl-shared.${hash}.js`;

  this.emitFile(sharedName, shared);

  return stripSourceMappingUrl(source).replaceAll(
    SHARED_MJS,
    `./${sharedName}`,
  );
}
