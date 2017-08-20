/* eslint-disable no-underscore-dangle */
if (!global.Intl) {
  require.ensure([
    'intl',
    'intl/locale-data/jsonp/sk.js',
  ], (require) => {
    require('intl');
    global.Intl.__disableRegExpRestore();
    require('intl/locale-data/jsonp/sk.js');
    require('.');
  });
} else {
  require('.');
}
