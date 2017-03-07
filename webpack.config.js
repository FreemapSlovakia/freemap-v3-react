const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: 'dist/[name].[contenthash].css',
  disable: true // FIXME map will not show in production: process.env.NODE_ENV !== 'production'
});

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    alias: {
      fm3: path.resolve(__dirname, 'src')
    }
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
          fix: true
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [ 'react', 'es2015' ]
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg)$/,
        loader: 'url-loader',
        options:  {
          limit: 10000
        }
      },
      {
        test: /\.scss$/,
        loader: extractSass.extract({
            use: [ { loader: "css-loader" }, { loader: "sass-loader" } ],
            // use style-loader in development
            fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ] : []
};

module.exports.plugins.push(
  new CopyWebpackPlugin([
    { from: 'index.html' },
    { from: 'favicon.ico' }
  ]),
  extractSass
);
