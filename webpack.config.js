const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: 'dist/[name].[contenthash].css',
  disable: true, // FIXME map will not show in production: process.env.NODE_ENV !== 'production'
});

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './boot.js',
  output: {
    filename: 'index.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      fm3: path.resolve(__dirname, 'src'),
    },
  },
  // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  // #cheap-module-eval-source-map doesn't work - see https://github.com/webpack/webpack/issues/2145
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',
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
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
      {
        test: /\.scss$/,
        loader: extractSass.extract({
          use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }],
          // use style-loader in development
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader' }],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV), // for react
        BROWSER: JSON.stringify(true),
        MAX_GPX_TRACK_SIZE_IN_MB: JSON.stringify(5),
        MAPQUEST_API_KEY: JSON.stringify('Fmjtd|luu82qut25,rg=o5-94twla'),
        API_URL: JSON.stringify(process.env.NODE_ENV === 'production' ? 'http://www.freemap.sk:3000' : 'http://localhost:3000'),
      },
    }),
  ],
  devServer: {
    disableHostCheck: true,
  },
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports.plugins.push(
  new CopyWebpackPlugin([
    { from: 'index.html' },
    { from: 'authCallback.html' },
    { from: 'favicon.ico' },
  ]),
  extractSass,
);
