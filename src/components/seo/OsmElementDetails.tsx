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
          data: `[out:json];${type}(${id});out tags;`,
        })
        .then(({ data }) => setResult(data.elements[0]));
    }
  }, [nodeId, wayId, relationId]);

  return result ? (
    <ObjectDetailsRaw
      id={result.id}
      type={result.type}
      tags={result.tags}
      language="sk"
      modifyPageTitlePrefix="Freemap Slovakia - "
    />
  ) : (
    <div />
  );
}
