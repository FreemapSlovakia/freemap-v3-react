const base = require("./webpack.config.base.js");

module.exports = Object.assign({}, base, {
  entry: './app.js',
  output: Object.assign({}, base.output, {
    filename: 'build/app.js'
  })
});
