const process = require('process');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require('marked');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const prod = process.env.DEPLOYMENT && process.env.DEPLOYMENT !== 'dev';

const fastDev = !prod && !process.env.DISABLE_FAST_DEV;

const renderer = new marked.Renderer();

renderer.link = (href, title, text) =>
  `<a href="${href}" target="_blank" title="${title}">${text}</a>`;

module.exports = {
  mode: prod ? 'production' : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: './index.tsx',
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      fm3: path.resolve(__dirname, 'src'),
      pica: 'pica/dist/pica.js',
    },
  },
  // more info: https://webpack.js.org/configuration/devtool/
  devtool: prod ? 'source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        // babelify some very modern libraries
        test: /\bnode_modules\/.*\b(exifreader|strict-uri-encode|query-string|split-on-first)\/.*\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: ['> 2%'],
                },
              },
            ],
          ],
        },
      },
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compiler: 'ttypescript', // this is for typescript-is
            transpileOnly: fastDev,
          },
        },
      },
      // addition - add source-map support
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|ttf|eot|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          esModule: false,
        },
      },
      {
        test: /\.scss$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
            options: {
              renderer,
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: !fastDev,
        files: './**/*.{ts,tsx,js,jsx}',
      },
      typescript: {
        configFile: path.resolve(__dirname, './tsconfig.json'),
      },
      async: fastDev,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: prod ? JSON.stringify('production') : 'undefined', // for react
        BROWSER: JSON.stringify(true),
        DEPLOYMENT: JSON.stringify(process.env.DEPLOYMENT),
        MAP_EXPORT_URL: JSON.stringify(process.env.MAP_EXPORT_URL),
        MAX_GPX_TRACK_SIZE_IN_MB: JSON.stringify(5),
        API_URL: JSON.stringify(
          {
            www: 'https://backend.freemap.sk',
            next: 'http://backend.freemap.sk:3001',
          }[process.env.DEPLOYMENT] || 'https://local.freemap.sk:3000',
        ),
        GA_TRACKING_CODE: JSON.stringify(
          { www: 'UA-89861822-3', next: 'UA-89861822-4' }[
            process.env.DEPLOYMENT
          ] || null,
        ),
      },
    }),
    new WebpackCleanupPlugin({
      exclude: ['.git/**'],
    }),
    new HtmlWebpackPlugin({
      template: '!!ejs-loader?esModule=false!src/index.html',
      inject: false,
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: '../sw/sw.ts',
      maximumFileSizeToCacheInBytes: 100000000, // TODO only for dev
      exclude: ['.htaccess'],
    }),
    new FaviconsWebpackPlugin({
      logo: './images/logo.jpg',
      inject: true,
      prefix: './',
      favicons: {
        appName: 'Freemap Slovakia', // Your application's name. `string`
        appShortName: 'Freemap', // Your application's short_name. `string`. Optional. If not set, appName will be used
        // Your application's description. `string`
        appDescription:
          'Freemap je voľne dostupná online mapa Slovenska založená na dátach z OpenStreetMap',
        developerName: 'Freemap Slovakia', // Your (or your developer's) name. `string`
        developerURL: 'https://github.com/FreemapSlovakia/', // Your (or your developer's) URL. `string`
        dir: 'auto', // Primary text direction for name, short_name, and description
        lang: 'en-US', // Primary language for name and short_name
        background: '#ffffff', // Background colour for flattened icons. `string`
        theme_color: '#ffffff', // Theme color user for example in Android's task switcher. `string`
        display: 'fullscreen', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
        appleStatusBarStyle: 'black-translucent', // Color for appleStatusBarStyle : Not implemented (black-translucent | default | black)
        orientation: 'any', // Default orientation: "any", "natural", "portrait" or "landscape". `string`
        icons: {
          favicons: false, // we have separate icno for favicon
          android: false, // we generate manifest with WebpackPwaManifest
          coast: false,
          yandex: false,
        },
      },
    }),
    new WebpackPwaManifest({
      name: 'Freemap Slovakia',
      short_name: 'Freemap',
      description:
        'Freemap je voľne dostupná online mapa Slovenska založená na dátach z OpenStreetMap',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      'theme-color': '#ffffff',
      icons: [
        {
          src: path.resolve('src/images/freemap-logo-small.png'),
          sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
        },
      ],
      orientation: 'any',
      share_target: {
        action: '/',
        method: 'POST',
        enctype: 'multipart/form-data',
        params: {
          title: 'title',
          text: 'text',
          url: 'url',
          files: [
            {
              name: 'file',
              accept: ['image/jpeg', 'application/gpx+xml'],
            },
          ],
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static/**',
          globOptions: { dot: true },
          flatten: true,
        },
      ],
    }),
    prod &&
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].[chunkhash].css',
        chunkFilename: '[name].[chunkhash].css',
      }),
    prod &&
      new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.ContextReplacementPlugin(
      /intl\/locale-data\/jsonp$/,
      /(sk|cs|en)\.tsx/,
    ),
  ].filter((x) => x),
  devServer: {
    disableHostCheck: true,
  },
};
