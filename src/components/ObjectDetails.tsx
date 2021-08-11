import { toastsAdd } from 'fm3/actions/toastsActions';
import { latLonToString } from 'fm3/geoutils';
import { useMessages } from 'fm3/l10nInjector';
import { categoryKeys } from 'fm3/osm/osmNameResolver';
import { useOsmNameResolverRaw } from 'fm3/osm/useOsmNameResolver';
import { LatLon } from 'fm3/types/common';
import { ReactElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

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

type PropsRaw = Props & {
  language: string;
  unnamedText?: string;
  expertMode?: boolean;
  dispatch?: Dispatch;
  modifyPageTitleSuffix?: string;
  position?: LatLon;
};

export function ObjectDetailsRaw({
  id,
  tags,
  type,
  openText,
  historyText,
  editInJosmText,
  unnamedText,
  expertMode,
  dispatch,
  language,
  modifyPageTitleSuffix,
  position,
}: PropsRaw): ReactElement {
  const subjectAndName = useOsmNameResolverRaw(type, tags, language, dispatch);

  useEffect(() => {
    if (modifyPageTitleSuffix !== undefined && subjectAndName) {
      document.title = subjectAndName.join(' - ') + modifyPageTitleSuffix;
    }
  }, [modifyPageTitleSuffix, subjectAndName]);

  const handleEditInJosm = () => {
    fetch(
      'http://localhost:8111/load_object?new_layer=true&relation_members=true&objects=' +
        { node: 'n', way: 'w', relation: 'r' }[type] +
        id +
        '&layer_name=' +
        encodeURIComponent(
          `${subjectAndName?.[0]} "${
            subjectAndName?.[1] || unnamedText
          }"`.trim(),
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

  return (
    <>
      {modifyPageTitleSuffix === undefined ? (
        <p className="lead">
          {subjectAndName?.[0]} <i>{subjectAndName?.[1] || unnamedText}</i>
        </p>
      ) : (
        <h1>
          {subjectAndName?.[0]} <i>{subjectAndName?.[1] || unnamedText}</i>
        </h1>
      )}

      {position && (
        <p>
          GPS Súradnice: {/* TODO translate */}{' '}
          <a href={`geo:${position.lat},${position.lon}`}>
            {latLonToString(position, language)}
          </a>
        </p>
      )}

      <p>
        <a href={`https://www.openstreetmap.org/${type}/${id}`}>{openText}</a> (
        <a href={`https://www.openstreetmap.org/${type}/${id}/history`}>
          {historyText}
        </a>
        )
      </p>

      {tags['description'] && <p>{tags['description']}</p>}

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

export function ObjectDetails({ ...rest }: Props): ReactElement {
  const m = useMessages();

  const expertMode = useSelector((state) => state.main.expertMode);

  const dispatch = useDispatch();

  const language = useSelector((state) => state.l10n.language);

  return (
    <ObjectDetailsRaw
      {...rest}
      unnamedText={m?.general.unnamed}
      expertMode={expertMode}
      dispatch={dispatch}
      language={language}
    />
  );
}
