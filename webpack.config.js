const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require('marked');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const OfflinePlugin = require('offline-plugin');

const prod = process.env.DEPLOYMENT && process.env.DEPLOYMENT !== 'dev';

const renderer = new marked.Renderer();

renderer.link = (href, title, text) => `<a href="${href}" target="_blank" title="${title}">${text}</a>`;

const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: !prod,
});

const cssLoader = {
  loader: 'css-loader',
  options: prod ? {
    minimize: true,
    sourceMap: true,
  } : {},
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './boot.js',
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      fm3: path.resolve(__dirname, 'src'),
    },
  },
  // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  // #cheap-module-eval-source-map doesn't work - see https://github.com/webpack/webpack/issues/2145
  devtool: prod ? 'source-map' : 'cheap-module-source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: false,
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['react', 'es2015', 'stage-2'],
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|ttf|eot|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
      {
        test: /\.scss$/,
        loader: extractSass.extract({
          use: [cssLoader, { loader: 'sass-loader' }],
          // use style-loader in development
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.css$/,
        use: ['style-loader', cssLoader],
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
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(prod ? 'production' : 'undefined'), // for react
        BROWSER: JSON.stringify(true),
        DEPLOYMENT: JSON.stringify(process.env.DEPLOYMENT),
        MAX_GPX_TRACK_SIZE_IN_MB: JSON.stringify(5),
        MAPQUEST_API_KEY: JSON.stringify('Fmjtd|luu82qut25,rg=o5-94twla'),
        API_URL: JSON.stringify({
          www: 'https://backend.freemap.sk',
          next: 'http://backend.freemap.sk:3001',
        }[process.env.DEPLOYMENT] || 'http://localhost:3000'),
        GA_TRACKING_CODE: JSON.stringify({ www: 'UA-89861822-3', next: 'UA-89861822-4' }[process.env.DEPLOYMENT] || null),
      },
    }),
    new WebpackCleanupPlugin({
      exclude: ['.git/**'],
    }),
    new HtmlWebpackPlugin({
      template: '!!ejs-loader!src/index.html',
      inject: false,
    }),
    new WebpackPwaManifest({
      name: 'Freemap Slovakia',
      short_name: 'Freemap',
      description: 'OpenStreetMap based map application',
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
    }),
    new CopyWebpackPlugin([
      { from: { glob: 'static', dot: true }, flatten: true },
    ]),
    extractSass,
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime',
    }),
    new webpack.HashedModuleIdsPlugin(),
    prod && new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
    new OfflinePlugin({
      publicPath: '/',
      caches: 'all',
      externals: [
        '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
      ],
      ServiceWorker: {
        navigateFallbackURL: '/',
      },
      AppCache: null, // disable
    }),
  ].filter(x => x),
  devServer: {
    disableHostCheck: true,
  },
};
