const { getOptions } = require('loader-utils');
const { validate } = require('schema-utils');
const axios = require('axios');

module.exports = function (source, map, meta) {
  const callback = this.async();

  axios
    .request({
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      headers: { 'Content-Type': 'text/plain' },
      data: source,
    })
    .then(
      (res) => {
        callback(
          null,
          'module.exports = ' + JSON.stringify(res.data),
          map,
          meta,
        );
      },
      (err) => {
        callback(err);
      },
    );

  return;
};
