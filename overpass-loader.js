const axios = require('axios');

module.exports = function (source, map, meta) {
  const callback = this.async();

  if (process.env.SKIP_OVERPASS) {
    callback(null, 'module.exports = unfedined;', map, meta);

    return;
  }

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
