import { toastsAdd } from 'fm3/actions/toastsActions';
import { useMessages } from 'fm3/l10nInjector';
import {
  categoryKeys,
  getNameFromOsmElement,
  resolveGenericName,
} from 'fm3/osm/osmNameResolver';
import { osmTagToIconMapping } from 'fm3/osm/osmTagToIconMapping';
import { useOsmNameResolver } from 'fm3/osm/useOsmNameResolver';
import { Fragment, ReactElement } from 'react';
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

export function ObjectDetails({
  id,
  tags,
  type,
  openText,
  historyText,
  editInJosmText,
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const gn = useOsmNameResolver(type, tags);

  const imgs = resolveGenericName(osmTagToIconMapping, tags);

  const language = useSelector((state) => state.l10n.language);

  const name = getNameFromOsmElement(tags, language);

  const handleEditInJosm = () => {
    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[type] +
        id +
        '&layer_name=' +
        encodeURIComponent(`${gn} "${name || m?.general.unnamed}"`.trim()),
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error response from localhost:8111: ' + res.status);
        }
      })
      .catch((err) => {
        dispatch?.(
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
        {imgs.map((img) => (
          <Fragment key={img}>
            <img src={img} style={{ width: '1em', height: '1em' }} />
            &ensp;
          </Fragment>
        ))}
        {gn} <i>{name || m?.general.unnamed}</i>
      </p>

      <p>
        <a href={`https://www.openstreetmap.org/${type}/${id}`}>{openText}</a> (
        <a href={`https://www.openstreetmap.org/${type}/${id}/history`}>
          {historyText}
        </a>
        )
      </p>

      {tags['description'] && <p>{tags['description']}</p>}

      <Button type="button" onClick={handleEditInJosm} className="mb-4">
        {editInJosmText}
      </Button>

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
                ) : ['contact:website', 'website', 'url', 'image'].includes(
                    k,
                  ) ? (
                  <a href={v}>{v}</a>
                ) : ['contact:email', 'email'].includes(k) ? (
                  <a href={'mailto:' + v}>{v}</a>
                ) : ['phone', 'contact:phone', 'contact:mobile'].includes(k) ? (
                  <a href={'tel:' + v.replace(/ /g, '')}>{v}</a>
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
