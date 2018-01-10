/* eslint-disable no-underscore-dangle */
if (!global.Intl) {
  require.ensure([
    'intl',
  ], (require) => {
    require('intl');
    global.Intl.__disableRegExpRestore();
    require('.');
  });
} else {
  require('.');
}
