import axios from 'axios';
import qs from 'query-string';
import { ReactElement, useEffect, useState } from 'react';
import { ObjectDetailsRaw } from '../ObjectDetails';

export function OsmElementDetails(): ReactElement {
  const q = qs.parse(window.location.search);

  const nodeId = q['osm-node'];

  const wayId = q['osm-way'];

  const relationId = q['osm-relation'];

  const [result, setResult] = useState<any>();

  useEffect(() => {
    const id = nodeId ?? wayId ?? relationId;

    if (id) {
      const type = nodeId ? 'node' : wayId ? 'way' : 'relation';

      axios
        .request({
          method: 'POST',
          url: 'https://overpass.freemap.sk/api/interpreter',
          headers: { 'Content-Type': 'text/plain' },
          data: `[out:json];${type}(${id});out tags center;`,
        })
        .then(({ data }) => {
          console.log('DDDDD', data);

          const [element] = data.elements;

          const center = element.center ?? element;

          const head = document.getElementsByTagName('head')[0];

          const m1 = document.createElement('meta');
          m1.setAttribute('name', 'geo.position');
          m1.setAttribute('content', center.lat + ';' + center.lon);
          head.appendChild(m1);

          const m2 = document.createElement('meta');
          m2.setAttribute('name', 'ICBM');
          m2.setAttribute('content', center.lat + ', ' + center.lon);
          head.appendChild(m2);

          setResult(element);
        });
    }
  }, [nodeId, wayId, relationId]);

  return result ? (
    <ObjectDetailsRaw
      id={result.id}
      type={result.type}
      tags={result.tags}
      openText="Otvoriť na OpenStreetMap.org"
      historyText="história"
      editInJosmText="Editovať v JOSM"
      language="sk"
      modifyPageTitleSuffix=" | Freemap Slovakia"
      position={result.center ?? result}
    />
  ) : (
    <div />
  );
}
