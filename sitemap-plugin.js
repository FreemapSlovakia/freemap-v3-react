const axios = require('axios');
const { opendir, readFile } = require('fs/promises');

module.exports = class SitemapWebpackPlugin {
  apply(compiler) {
    if (process.env.NO_SITEMAP) {
      return;
    }

    const { webpack } = compiler;

    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(
      SitemapWebpackPlugin.name,
      (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: SitemapWebpackPlugin.name,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          },
          async () => {
            // compilation.options.output.path

            const dir = await opendir('./src/components/seo/overpassQueries');

            const out = [];

            for (const lang of ['sk', 'cs', 'en', 'hu']) {
              out.push(`https://www.freemap.sk/?layers=X&lang=${lang}`);

              // basic modals
              out.push(
                ...[
                  'legend',
                  'upload-track',
                  'about',
                  'export-gpx',
                  'export-pdf',
                  'settings',
                  'embed',
                  'supportUs',
                  'tracking-watched',
                  'tracking-my',
                  'maps',
                ].map(
                  (modal) =>
                    `https://www.freemap.sk/?layers=X&show=${modal}&lang=${lang}`,
                ),
              );

              // tips
              out.push(
                ...[
                  'freemap',
                  'osm',
                  'attribution',
                  'shortcuts',
                  'exports',
                  'sharing',
                  'galleryUpload',
                  'gpxViewer',
                  'planner',
                  'dvePercenta',
                  'privacyPolicy',
                ].map(
                  (modal) =>
                    `https://www.freemap.sk/?layers=X&tip=${modal}&lang=${lang}`,
                ),
              );
            }

            for await (const dirent of dir) {
              console.log(dirent.name);

              const source = await readFile(
                './src/components/seo/overpassQueries/' + dirent.name,
              );

              const res = await axios.request({
                method: 'POST',
                url: 'https://overpass.freemap.sk/api/interpreter',
                headers: { 'Content-Type': 'text/plain' },
                data: source,
              });

              out.push(
                ...res.data.elements.map(
                  (el) =>
                    `https://www.freemap.sk/?layers=X&osm-${el.type}=${el.id}&lang=sk`,
                ),
              );
            }

            compilation.emitAsset(
              './sitemap.txt',
              new RawSource(out.join('\n')),
            );
          },
        );
      },
    );
  }
};
