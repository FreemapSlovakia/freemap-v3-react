const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: 'dist/[name].[contenthash].css',
  disable: process.env.NODE_ENV !== 'production'
});

module.exports = {
  context: __dirname + '/src',
  entry: './app.js',
  output: {
    filename: 'dist/app.js',
    path: __dirname
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
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
            loader: [ { loader: "css-loader" }, { loader: "sass-loader" } ],
            // use style-loader in development
            fallbackLoader: 'style-loader'
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
    { from: 'index.html', to: 'dist/index.html' },
    { from: 'favicon.ico', to: 'dist/favicon.ico' }
  ]),
  extractSass
);
