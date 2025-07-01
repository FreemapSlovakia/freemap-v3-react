import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'node:url';
import path from 'path';
import process from 'process';
import type SassLoader from 'sass-loader';
import type { Configuration } from 'webpack';
import webpack from 'webpack';
import { InjectManifest } from 'workbox-webpack-plugin';
// import ESLintPlugin from 'eslint-webpack-plugin';

import csMessages from './src/translations/cs-shared.js';
import enMessages from './src/translations/en-shared.js';
import huMessages from './src/translations/hu-shared.js';
import itMessages from './src/translations/it-shared.js';
import skMessages from './src/translations/sk-shared.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prod = process.env['DEPLOYMENT'] && process.env['DEPLOYMENT'] !== 'dev';

const htmlPluginProps = {
  filename: 'index.html',
  template: 'index.ejs',
  inject: false,
  templateParameters: {
    lang: 'en',
    title: enMessages.title,
    description: enMessages.description,
    errorHtml:
      '<h1>Problem starting application</h1>' +
      '<p>Please make sure you are using recent version of a modern browser (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
    nojsMessage:
      'JavaScript enabled browser is required to run this application.',
    loadingMessage: 'Loading…',
  },
};

const config: Configuration = {
  mode: prod ? 'production' : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {
    main: './index.tsx',
    'upload-sw': './sw/upload-sw.ts',
  },
  output: {
    clean: true,
    filename: (pathData) => {
      return pathData.chunk?.name === 'upload-sw'
        ? '[name].js'
        : '[name].[chunkhash].js';
    },
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts', '.tsx'],
    },
    fallback: {
      url: false,
      fs: false,
      path: false,
    },
  },
  optimization: {
    // moduleIds: 'deterministic',
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  // more info: https://webpack.js.org/configuration/devtool/
  devtool: prod ? 'source-map' : 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|ttf|eot|woff2)$/,
        type: 'asset/resource',
      },
      {
        test: /\.scss$/,
        use: [
          prod
            ? {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: (resourcePath, context) => {
                    return (
                      path.relative(path.dirname(resourcePath), context) + '/'
                    );
                  },
                } satisfies MiniCssExtractPlugin.LoaderOptions,
              }
            : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: [
                  'mixed-decls',
                  'color-functions',
                  'global-builtin',
                  'import',
                ],
              },
            } satisfies SassLoader.Options,
          },
        ],
      },
      {
        test: /\.overpass$/,
        loader: '../overpass-loader',
      },
      {
        test: /\.css$/,
        use: [
          prod
            ? {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: (resourcePath, context) => {
                    return (
                      path.relative(path.dirname(resourcePath), context) + '/'
                    );
                  },
                } satisfies MiniCssExtractPlugin.LoaderOptions,
              }
            : 'style-loader',
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
            loader: path.resolve('markdown-loader.js'),
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(wasm|wgsl)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    !prod &&
      new ReactRefreshWebpackPlugin({
        overlay: false,
      }),
    new InjectManifest({
      swSrc: './sw/sw.ts',
      maximumFileSizeToCacheInBytes: 100_000_000,
    }),
    new webpack.EnvironmentPlugin({
      ...(prod ? { NODE_ENV: 'production' } : null), // for react
      BROWSER: 'true',
      PREVENT_ADS: 'PREVENT_ADS' in process.env,
      DEPLOYMENT: process.env['DEPLOYMENT'] ?? null,
      FM_MAPSERVER_URL:
        process.env['FM_MAPSERVER_URL'] || 'https://outdoor.tiles.freemap.sk',
      MAX_GPX_TRACK_SIZE_IN_MB: '15',
      BASE_URL:
        {
          www: 'https://www.freemap.sk',
        }[process.env['DEPLOYMENT']!] ?? 'https://local.freemap.sk:9000',
      API_URL:
        {
          www: 'https://backend.freemap.sk',
        }[process.env['DEPLOYMENT']!] ?? 'https://local.freemap.sk:3000',
      MATOMO_SITE_ID: { www: '1' }[process.env['DEPLOYMENT']!] ?? null,
      SENTRY_DSN:
        {
          www: 'https://18bd1845f6304063aef58be204a77149@glitchtip.freemap.sk/2',
        }[process.env['DEPLOYMENT']!] ?? null,
      FB_APP_ID: { www: '681854635902254' }[process.env['DEPLOYMENT']!] ?? null,
      GRAPHHOPPER_URL:
        {
          www: 'https://graphhopper.freemap.sk',
        }[process.env['DEPLOYMENT']!] || 'https://graphhopper.freemap.sk', //'http://localhost:8989',
    }),
    new HtmlWebpackPlugin(htmlPluginProps), // fallback for dev
    new HtmlWebpackPlugin({
      ...htmlPluginProps,
      filename: 'index-en.html',
    }),
    new HtmlWebpackPlugin({
      ...htmlPluginProps,
      filename: 'index-sk.html',
      templateParameters: {
        lang: 'sk',
        title: skMessages.title,
        description: skMessages.description,
        errorHtml:
          '<h1>Aplikáciu sa nepodarilo spustiť</h1>' +
          '<p>Uistite sa, že používate aktuálnu verziu niektorého zo súčasných prehliadačov (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).<p>',
        nojsMessage:
          'Aplikácia vyžaduje prehliadač so zapnutou podporou JavaScriptu.',
        loadingMessage: 'Načítavam…',
      },
    }),
    new HtmlWebpackPlugin({
      ...htmlPluginProps,
      filename: 'index-cs.html',
      templateParameters: {
        lang: 'cs',
        title: csMessages.title,
        description: csMessages.description,
        errorHtml:
          '<h1>Aplikaci se nepodařilo spustit</h1>' +
          '<p>Ujistěte se, že používáte aktuální verzi některého ze současných prohlížečů (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).<p>',
        nojsMessage:
          'Aplikace vyžaduje prohlížeč se zapnutou podporou JavaScriptu.',
        loadingMessage: 'Načítám…',
      },
    }),
    new HtmlWebpackPlugin({
      ...htmlPluginProps,
      filename: 'index-hu.html',
      templateParameters: {
        lang: 'hu',
        title: huMessages.title,
        description: huMessages.description,
        errorHtml:
          '<h1>Hiba történt az alkalmazás elindításánál</h1>' +
          '<p>Győződjék meg arról, hogy egy modern böngésző (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …) friss verzióját használja.</p>',
        nojsMessage:
          'Az alkalmazás futtatásához JavaScriptet támogató böngészőre van szükség.',
        loadingMessage: 'Loading…', // TODO translate
      },
    }),
    new HtmlWebpackPlugin({
      ...htmlPluginProps,
      filename: 'index-it.html',
      templateParameters: {
        lang: 'it',
        title: itMessages.title,
        description: itMessages.description,
        errorHtml:
          "<h1>Problema nell'avvio dell'applicazione</h1>" +
          '<p>Per favore assicurati di utilizzare una versione recente di un browser moderno (Google Chrome, Firefox, Safari, Opera, Edge, Chromium, Vivaldi, Brave, …).</p>',
        nojsMessage:
          "E' richiesto un browser con JavaScript abilitato per avviare questa applicazione.",
        loadingMessage: 'Caricamento…',
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static/**/*',
          to: '[name][ext]',
          globOptions: { dot: true },
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
    new webpack.ContextReplacementPlugin(
      /intl\/locale-data\/jsonp$/,
      /(sk|cs|en)\.tsx/,
    ),
  ].filter(Boolean),
};

export default config;
