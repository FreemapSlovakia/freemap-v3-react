import path from 'node:path';
import { defineConfig } from 'vitest/config';

const src = path.resolve(import.meta.dirname, 'src');
const assetStub = path.resolve(import.meta.dirname, 'test/stubs/asset.ts');

export default defineConfig({
  resolve: {
    // Mirror the rspack aliases (rspack.config.ts). Regex `find` avoids the
    // `@` / `@app` prefix-collision a bare-string alias would cause.
    alias: [
      { find: /^@app\//, replacement: `${src}/app/` },
      { find: /^@shared\//, replacement: `${src}/shared/` },
      { find: /^@features\//, replacement: `${src}/features/` },
      { find: /^@osm\//, replacement: `${src}/osm/` },
      { find: /^@\//, replacement: `${src}/` },
      // Stub static assets — rspack's asset loaders don't run under Vitest.
      { find: /\.(png|jpe?g|gif|svg|webp|css|scss)$/, replacement: assetStub },
    ],
  },
  // Note: the transitively-imported `mapDefinitions.tsx` / `transportTypeDefs.tsx`
  // create JSX at module load; Vitest 4's oxc transformer compiles JSX with the
  // automatic runtime by default, so no extra JSX config is needed.
  test: {
    // jsdom gives us `window` (statePersistingMiddleware reads
    // `window.fmEmbedded`) and a real `localStorage`, which
    // `local-storage-fallback` then uses — letting tests drive the `store` key.
    environment: 'jsdom',
  },
});
