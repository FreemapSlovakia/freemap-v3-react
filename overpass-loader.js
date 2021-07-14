const axios = require('axios');

const promises = new Set(); // to serialize requests

module.exports = function (source, map, meta) {
  const callback = this.async();

  if (process.env.SKIP_OVERPASS) {
    callback(null, 'module.exports = undefined;', map, meta);

    return;
  }

  const promise = await Promise.all(promises)
    .then(() =>
      axios.request({
        method: 'POST',
        url: 'https://overpass.freemap.sk/api/interpreter',
        headers: { 'Content-Type': 'text/plain' },
        data: source,
      }),
    )
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
    )
    .finally(() => {
      promises.delete(promise);
    });

  promises.add(promise);

  return;
};
