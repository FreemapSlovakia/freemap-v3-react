import { toastsAdd } from 'fm3/actions/toastsActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
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
import { useDispatch } from 'react-redux';

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
  const dispatch = useDispatch();

  const gn = useOsmNameResolver(type, tags);

  const imgs = resolveGenericName(osmTagToIconMapping, tags);

  const language = useAppSelector((state) => state.l10n.language);

  const name = getNameFromOsmElement(tags, language);

  const handleEditInJosm = () => {
    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[type] +
        id +
        '&layer_name=' +
        encodeURIComponent(`${gn}${name ? ' "' + name + '"' : ''}`),
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
        {gn} {name && <i>{name}</i>}
      </p>

      <p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.openstreetmap.org/${type}/${id}`}
        >
          {openText}
        </a>{' '}
        (
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.openstreetmap.org/${type}/${id}/history`}
        >
          {historyText}
        </a>
        )
      </p>

      {tags['description'] && <p>{tags['description']}</p>}

      {!window.fmEmbedded && (
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
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wiki.openstreetmap.org/wiki/Key:${encodeURIComponent(
                    k,
                  )}`}
                >
                  {k}
                </a>
              </th>
              <td>
                {/^https?:\/\//.test(v) ? (
                  <a target="_blank" rel="noreferrer" href={v}>
                    {v}
                  </a>
                ) : k === 'wikidata' ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.wikidata.org/entity/${encodeURIComponent(
                      v,
                    )}`}
                  >
                    {v}
                  </a>
                ) : k === 'wikipedia' ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(
                      v,
                    )}`}
                  >
                    {v}
                  </a>
                ) : ['contact:email', 'email'].includes(k) ? (
                  <a href={'mailto:' + v}>{v}</a>
                ) : ['phone', 'contact:phone', 'contact:mobile'].includes(k) ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={'tel:' + v.replace(/ /g, '')}
                  >
                    {v}
                  </a>
                ) : categoryKeys.has(k) ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
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
