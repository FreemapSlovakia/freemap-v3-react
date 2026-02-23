import { useMessages } from '@features/l10n/l10nInjector.js';
import { SearchResult } from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  categoryKeys,
  getNameFromOsmElement,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { useGenericNameResolver } from '@osm/useGenericNameResolver.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Fragment, ReactElement } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import { OsmFeatureId } from '../../../types/featureId.js';
import { SourceName } from './SourceName.js';

type Props = {
  result: SearchResult;
  openText: string;
  historyText: string;
  editInJosmText: string;
};

export function ObjectDetails({
  result,
  openText,
  historyText,
  editInJosmText,
}: Props): ReactElement {
  const { id, geojson } = result;

  const dispatch = useDispatch();

  const genericName = useGenericNameResolver(result);

  const imgs = resolveGenericName(
    osmTagToIconMapping,
    geojson.properties ?? {},
  );

  const language = useAppSelector((state) => state.l10n.language);

  const displayName =
    result.displayName ||
    getNameFromOsmElement(geojson.properties ?? {}, language);

  const isOsm = is<OsmFeatureId>(id);

  const handleEditInJosm = () => {
    if (!isOsm) {
      throw new Error('unsupported type');
    }

    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[id.elementType] +
        id.id +
        '&layer_name=' +
        encodeURIComponent(
          `${genericName}${displayName ? ' "' + displayName + '"' : ''}`,
        ),
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

  function renderKey(k: string) {
    return !isOsm ? (
      k
    ) : (
      <a
        target="_blank"
        rel="noreferrer"
        href={
          'https://wiki.openstreetmap.org/wiki/Key:' + encodeURIComponent(k)
        }
      >
        {k}
      </a>
    );
  }
  function renderValue(k: string, v: string) {
    return !isOsm ? (
      v
    ) : /^https?:\/\//.test(v) ? (
      <a target="_blank" rel="noreferrer" href={v}>
        {v}
      </a>
    ) : k === 'wikidata' || k.endsWith(':wikidata') ? (
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.wikidata.org/entity/${encodeURIComponent(v)}`}
      >
        {v}
      </a>
    ) : k === 'wikipedia' || k.endsWith(':wikipedia') ? (
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
    ) : ['phone', 'contact:phone', 'contact:mobile'].includes(k) ? (
      <a target="_blank" rel="noreferrer" href={'tel:' + v.replace(/ /g, '')}>
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
    );
  }

  const m = useMessages();

  return (
    <>
      <p className="lead">
        {imgs.map((img) => (
          <Fragment key={img}>
            <img src={img} style={{ width: '1em', height: '1em' }} />
            &ensp;
          </Fragment>
        ))}
        {genericName} {displayName && <i>{displayName}</i>}
      </p>

      {isOsm && (
        <p>
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.openstreetmap.org/${id.elementType}/${id.id}`}
          >
            {openText}
          </a>
          {' ('}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.openstreetmap.org/${id.elementType}/${id.id}/history`}
          >
            {historyText}
          </a>
          )
        </p>
      )}

      {isOsm && geojson.properties?.['description'] && (
        <p>{geojson.properties['description']}</p>
      )}

      {!window.fmEmbedded && isOsm && (
        <Button type="button" onClick={handleEditInJosm} className="mb-4">
          {editInJosmText}
        </Button>
      )}

      {geojson.properties && (
        <Table striped bordered size="sm">
          <tbody>
            {Object.entries(geojson.properties)
              .filter(([k]) => k !== 'display_name')
              .map(([k, v]) => (
                <tr key={k}>
                  <th>{renderKey(k)}</th>
                  <td>{renderValue(k, v)}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}

      <span>
        {m?.mapDetails.source}: <SourceName result={result} />
      </span>
    </>
  );
}
