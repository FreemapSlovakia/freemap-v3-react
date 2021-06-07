import { useMessages } from 'fm3/l10nInjector';
import { getName } from 'fm3/osmNameResolver';
import { ReactElement } from 'react';
import Table from 'react-bootstrap/Table';

export type ObjectDetailBasicProps = {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags: Record<string, string>;
};

type Props = ObjectDetailBasicProps & {
  openText: string;
  historyText: string;
};

// TODO add others
const categoryKeys = new Set([
  'admin_level',
  'amenity',
  'barrier',
  'boundary',
  'building',
  'bus',
  'cusine',
  'highway',
  'historic',
  'information',
  'landuse',
  'leaf_type',
  'leisure',
  'man_made',
  'natural',
  'network',
  'office',
  'public_transport',
  'railway',
  'route',
  'service',
  'shelter',
  'shop',
  'sport',
  'tactile_paving',
  'tourism',
  'type',
  'vending',
  'wall',
  'water',
  'waterway',
]);

export function ObjectDetails({
  id,
  tags,
  type,
  openText,
  historyText,
}: Props): ReactElement {
  const m = useMessages();

  const [subject, name] = getName({ type, tags });

  return (
    <>
      <p className="lead">
        {subject} <i>{name || m?.general.unnamed}</i>
      </p>
      <p>
        <a href={`https://www.openstreetmap.org/${type}/${id}`}>{openText}</a> (
        <a href={`https://www.openstreetmap.org/${type}/${id}/history`}>
          {historyText}
        </a>
        )
      </p>

      <Table striped bordered size="sm">
        <tbody>
          {Object.entries(tags).map(([k, v]) => (
            <tr key={k}>
              <th>
                <a
                  href={`https://wiki.openstreetmap.org/wiki/Key:${encodeURIComponent(
                    k,
                  )}`}
                >
                  {k}
                </a>
              </th>
              <td>
                {k === 'wikidata' ? (
                  <a
                    href={`https://www.wikidata.org/entity/${encodeURIComponent(
                      v,
                    )}`}
                  >
                    {v}
                  </a>
                ) : k === 'wikipedia' ? (
                  <a
                    href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(
                      v,
                    )}`}
                  >
                    {v}
                  </a>
                ) : categoryKeys.has(k) ? (
                  <a
                    href={`https://wiki.openstreetmap.org/wiki/Tag:${encodeURIComponent(
                      k,
                    )}=${encodeURIComponent(v)}`}
                  >
                    {v}
                  </a>
                ) : (
                  v
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
