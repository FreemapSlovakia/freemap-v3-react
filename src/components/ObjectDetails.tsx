import { toastsAdd } from 'fm3/actions/toastsActions';
import { useMessages } from 'fm3/l10nInjector';
import { useOsmNameResolver } from 'fm3/osm/useOsmNameResolver';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { useDispatch, useSelector } from 'react-redux';

export type ObjectDetailBasicProps = {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags: Record<string, string>;
};

type Props = ObjectDetailBasicProps & {
  openText: string;
  historyText: string;
  editInJosmText: string;
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
  editInJosmText,
}: Props): ReactElement {
  const m = useMessages();

  const subjectAndName = useOsmNameResolver(type, tags);

  const expertMode = useSelector((state) => state.main.expertMode);

  const dispatch = useDispatch();

  const handleEditInJosm = () => {
    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[type] +
        id +
        '&layer_name=' +
        encodeURIComponent(
          `${subjectAndName?.[0]} "${
            subjectAndName?.[1] || m?.general.unnamed
          }"`.trim(),
        ),
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error response from localhost:8111: ' + res.status);
        }
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            messageKey: 'general.operationError',
            messageParams: { err },
            style: 'danger',
          }),
        );
      });
  };

  return (
    <>
      <p className="lead">
        {subjectAndName?.[0]} <i>{subjectAndName?.[1] || m?.general.unnamed}</i>
      </p>
      <p>
        <a href={`https://www.openstreetmap.org/${type}/${id}`}>{openText}</a> (
        <a href={`https://www.openstreetmap.org/${type}/${id}/history`}>
          {historyText}
        </a>
        )
      </p>
      {expertMode && (
        <Button type="button" onClick={handleEditInJosm} className="mb-4">
          {editInJosmText}
        </Button>
      )}

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
