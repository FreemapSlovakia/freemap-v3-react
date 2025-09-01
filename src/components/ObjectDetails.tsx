import { Fragment, ReactElement } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { toastsAdd } from '../actions/toastsActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import {
  categoryKeys,
  getNameFromOsmElement,
  resolveGenericName,
} from '../osm/osmNameResolver.js';
import { osmTagToIconMapping } from '../osm/osmTagToIconMapping.js';
import { useOsmNameResolver } from '../osm/useOsmNameResolver.js';
import { OsmFeatureId } from '../types/featureId.js';

export type ObjectDetailBasicProps = {
  id: OsmFeatureId;
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
  openText,
  historyText,
  editInJosmText,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const gn = useOsmNameResolver(id.type, tags);

  const imgs = resolveGenericName(osmTagToIconMapping, tags);

  const language = useAppSelector((state) => state.l10n.language);

  const name = getNameFromOsmElement(tags, language);

  const handleEditInJosm = () => {
    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[id.type] +
        id.id +
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
          href={`https://www.openstreetmap.org/${id.type}/${id.id}`}
        >
          {openText}
        </a>{' '}
        (
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://www.openstreetmap.org/${id.type}/${id.id}/history`}
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
          {Object.entries(tags)
            .filter(([k]) => k !== 'display_name')
            .map(([k, v]) => (
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
                        v.replace(/ /g, '_'),
                      )}`}
                    >
                      {v}
                    </a>
                  ) : k === 'wikimedia_commons' ? (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(
                        v.replace(/ /g, '_'),
                      )}`}
                    >
                      {v}
                    </a>
                  ) : ['contact:email', 'email'].includes(k) ? (
                    <a href={'mailto:' + v}>{v}</a>
                  ) : ['phone', 'contact:phone', 'contact:mobile'].includes(
                      k,
                    ) ? (
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
