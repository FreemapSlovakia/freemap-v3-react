export default [
  ...[ [ 'A', 'Automapa' ], [ 'T', 'Turistická' ], [ 'C', 'Cyklomapa' ], [ 'K', 'Lyžiarska' ] ].map(([ type, name ]) => (
    {
      name: `${name}`,
      type: type,
      url: `http://{s}.freemap.sk/${type}/{z}/{x}/{y}.png`,
      attribution: 'prispievatelia © <a href="http://osm.org/copyright">OpenStreetMap</a>',
      minZoom: 7,
      maxZoom: 16
    }
  ))
];
