export default [
  {
    name: 'OpenStreetMap Mapnik',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  },
  ...[ [ 'A', 'Automobile' ], [ 'T', 'Hiking' ], [ 'C', 'Bicycle' ] ].map(([ type, name ]) => (
    {
      name: `Freemap ${name}`,
      url: `http://{s}.freemap.sk/${type}/{z}/{x}/{y}.png`,
      attribution: 'visualization © Freemap Slovakia, data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 7,
      maxZoom: 16
    }
  ))
];
