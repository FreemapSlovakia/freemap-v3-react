const axios = require('axios');
const { opendir, readFile } = require('fs/promises');

module.exports = class SitemapWebpackPlugin {
  apply(compiler) {
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

            const out = ['https://www.freemap.sk/?layers=X'];

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
                (modal) => `https://www.freemap.sk/?layers=X&show=${modal}`,
              ),
            );

            // tips
            out.push(
              ...[
                | 'freemap'
                | 'osm'
                | 'attribution'
                | 'shortcuts'
                | 'exports'
                | 'sharing'
                | 'galleryUpload'
                | 'gpxViewer'
                | 'planner'
                | 'dvePercenta'
                | 'privacyPolicy'
              ].map(
                (modal) => `https://www.freemap.sk/?layers=X&tip=${modal}`,
              ),
            );

            let i = 0;

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
                    `https://www.freemap.sk/?layers=X&osm-${el.type}=${el.id}`,
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
