const webpack = require('webpack');

module.exports = {
  context: __dirname + '/src',
  entry: './app.js',
  output: {
    filename: 'build/app.js',
    path: __dirname
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [ 'react', 'es2015' ]
        }
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
