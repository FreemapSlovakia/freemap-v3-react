const base = require("./webpack.config.base.js");

module.exports = Object.assign({}, base, {
  entry: './library.js',
  output: Object.assign({}, base.output, {
    library: 'toposcope',
    libraryTarget: 'var',
    filename: 'build/library.js'
  })
});
